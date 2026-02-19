import type {
  JsonRpcRequest,
  JsonRpcResponse,
  GatewayHealth,
  GatewaySession,
  GatewayNode,
  SessionHistory,
} from './types';

const REQUEST_TIMEOUT = 15000;
const RECONNECT_INTERVAL = 5000;

type ConnectionCallback = (port: number, connected: boolean) => void;

export class GatewayClient {
  private ws: WebSocket | null = null;
  private port: number;
  private requestId = 0;
  private pending = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private _connected = false;
  private onConnectionChange: ConnectionCallback | null = null;

  constructor(port: number) {
    this.port = port;
  }

  get connected(): boolean {
    return this._connected;
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
      this._connected = true;
      this.onConnectionChange?.(this.port, true);
    };

    this.ws.onclose = () => {
      this._connected = false;
      this.onConnectionChange?.(this.port, false);
      this.rejectAllPending('WebSocket closed');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data as string) as JsonRpcResponse;
        const pending = this.pending.get(response.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(response.id);
          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };
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
    this.onConnectionChange?.(this.port, false);
  }

  private async request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const id = ++this.requestId;
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
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
        this.ws.send(JSON.stringify(request));
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(e);
      }
    });
  }

  async getHealth(): Promise<GatewayHealth> {
    const result = await this.request('gateway.health');
    return result as GatewayHealth;
  }

  async listSessions(): Promise<GatewaySession[]> {
    const result = await this.request('sessions.list');
    return (result as GatewaySession[]) || [];
  }

  async getSessionHistory(sessionId: string): Promise<SessionHistory> {
    const result = await this.request('sessions.history', { session_id: sessionId });
    return result as SessionHistory;
  }

  async listNodes(): Promise<GatewayNode[]> {
    const result = await this.request('node.list');
    return (result as GatewayNode[]) || [];
  }

  async describeNode(nodeId: string): Promise<GatewayNode> {
    const result = await this.request('node.describe', { node_id: nodeId });
    return result as GatewayNode;
  }

  async invokeNode(nodeId: string, input: Record<string, unknown>): Promise<unknown> {
    return this.request('node.invoke', { node_id: nodeId, input });
  }
}
