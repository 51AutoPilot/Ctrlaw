import type {
  GatewayHealth,
  GatewaySession,
  GatewayNode,
  SessionHistory,
} from './types';

const REQUEST_TIMEOUT = 15000;
const RECONNECT_INTERVAL = 5000;

// OpenClaw WebSocket protocol:
// Request:  { type: "req", id: "<uuid>", method: "<method>", params?: {...} }
// Response: { type: "res", id: "<uuid>", ok: true, result: ... }
//           { type: "res", id: "<uuid>", ok: false, error: { code, message } }
// First message must be: method "connect" with params { token }

interface OcRequest {
  type: 'req';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

interface OcResponse {
  type: 'res';
  id: string;
  ok: boolean;
  result?: unknown;
  error?: { code: number; message: string };
}

type ConnectionCallback = (port: number, connected: boolean) => void;

let idCounter = 0;
function nextId(): string {
  return `mc-${++idCounter}-${Date.now()}`;
}

export class GatewayClient {
  private ws: WebSocket | null = null;
  private port: number;
  private token: string;
  private pending = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private _connected = false;
  private _handshook = false;
  private onConnectionChange: ConnectionCallback | null = null;

  constructor(port: number, token: string = '') {
    this.port = port;
    this.token = token;
  }

  get connected(): boolean {
    return this._connected && this._handshook;
  }

  setConnectionCallback(cb: ConnectionCallback) {
    this.onConnectionChange = cb;
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this.doConnect();
  }

  private doConnect(): void {
    try {
      this.ws = new WebSocket(`ws://127.0.0.1:${this.port}`);
    } catch (e) {
      console.error(`Failed to create WebSocket on port ${this.port}:`, e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      // Must send "connect" handshake first
      this.handshake();
    };

    this.ws.onclose = () => {
      this._connected = false;
      this._handshook = false;
      this.onConnectionChange?.(this.port, false);
      this.rejectAllPending('WebSocket closed');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as OcResponse;
        if (msg.type !== 'res') return; // ignore non-response frames (events, etc.)

        const pending = this.pending.get(msg.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(msg.id);
          if (msg.ok) {
            pending.resolve(msg.result);
          } else {
            pending.reject(new Error(msg.error?.message || 'Unknown error'));
          }
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };
  }

  private async handshake(): Promise<void> {
    try {
      await this.request('connect', {
        token: this.token || undefined,
        client: 'mission-control',
      });
      this._connected = true;
      this._handshook = true;
      this.onConnectionChange?.(this.port, true);
    } catch (e) {
      console.error('Handshake failed:', e);
      this._connected = false;
      this._handshook = false;
      this.onConnectionChange?.(this.port, false);
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.doConnect();
      }
    }, RECONNECT_INTERVAL);
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error(reason));
      this.pending.delete(id);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.rejectAllPending('Disconnected');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this._handshook = false;
    this.onConnectionChange?.(this.port, false);
  }

  request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const id = nextId();
      const req: OcRequest = {
        type: 'req',
        id,
        method,
        params,
      };

      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, REQUEST_TIMEOUT);

      this.pending.set(id, { resolve, reject, timer });

      try {
        this.ws.send(JSON.stringify(req));
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(e);
      }
    });
  }

  // === OpenClaw API Methods ===

  async getHealth(): Promise<GatewayHealth> {
    const result = await this.request('usage.status');
    return result as GatewayHealth;
  }

  async listSessions(): Promise<GatewaySession[]> {
    const result = await this.request('sessions.list');
    return (result as GatewaySession[]) || [];
  }

  async getSessionHistory(sessionId: string): Promise<SessionHistory> {
    const result = await this.request('chat.history', { sessionId });
    return result as SessionHistory;
  }

  async listNodes(): Promise<GatewayNode[]> {
    const result = await this.request('node.list');
    return (result as GatewayNode[]) || [];
  }

  async describeNode(nodeId: string): Promise<GatewayNode> {
    const result = await this.request('node.describe', { nodeId });
    return result as GatewayNode;
  }

  async listAgents(): Promise<unknown[]> {
    const result = await this.request('agents.list');
    return (result as unknown[]) || [];
  }

  async listCron(): Promise<unknown[]> {
    const result = await this.request('cron.list');
    return (result as unknown[]) || [];
  }

  async getConfig(): Promise<unknown> {
    return this.request('config.get');
  }

  async getChannelsStatus(): Promise<unknown> {
    return this.request('channels.status');
  }

  async getSkillsStatus(): Promise<unknown> {
    return this.request('skills.status');
  }

  async getModelsList(): Promise<unknown> {
    return this.request('models.list');
  }
}
