// === Agent Configuration ===

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  avatar: string;
  ec2Ip: string;
  ec2User: string;
  pemPath: string;
  localPort: number;
  enabled: boolean;
}

// === Connection Status ===

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'tunnel_up'
  | 'ws_connected'
  | 'error';

export interface AgentConnection {
  config: AgentConfig;
  status: ConnectionStatus;
  error?: string;
  lastSeen?: number;
}

// === OpenClaw Gateway Types ===

export interface GatewayHealth {
  status: string;
  uptime?: number;
  version?: string;
}

export interface GatewaySession {
  id: string;
  agent_id?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

export interface GatewayNode {
  id: string;
  name: string;
  type: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface SessionMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export interface SessionHistory {
  session_id: string;
  messages: SessionMessage[];
}

// === JSON-RPC ===

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// === Aggregated State ===

export interface AgentState {
  connection: AgentConnection;
  health?: GatewayHealth;
  sessions: GatewaySession[];
  nodes: GatewayNode[];
}
