'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type {
  AgentConfig,
  AgentState,
  ConnectionStatus,
  GatewaySession,
  GatewayNode,
} from './types';
import { loadAgents, saveAgents, createDefaultAgent } from './config';
import { openTunnel, closeTunnel, closeAllTunnels, onTunnelStatus } from './tunnel-manager';
import { GatewayClient } from './gateway-client';

const POLL_INTERVAL = 10000;

interface AgentContextValue {
  agents: AgentState[];
  allSessions: (GatewaySession & { agentName: string })[];
  allNodes: (GatewayNode & { agentName: string })[];
  connectedCount: number;
  totalCount: number;
  loading: boolean;
  addAgent: (partial: Partial<AgentConfig> & Pick<AgentConfig, 'name' | 'ec2Ip' | 'ec2User' | 'pemPath'>) => Promise<void>;
  removeAgent: (id: string) => Promise<void>;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => Promise<void>;
  connectAgent: (id: string) => Promise<void>;
  disconnectAgent: (id: string) => Promise<void>;
  connectAll: () => Promise<void>;
  disconnectAll: () => Promise<void>;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agentStates, setAgentStates] = useState<Map<string, AgentState>>(new Map());
  const [loading, setLoading] = useState(true);
  const clientsRef = useRef<Map<string, GatewayClient>>(new Map());
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a ref that always mirrors agentStates so callbacks can read the latest
  // value without needing agentStates in their dependency arrays.
  const agentStatesRef = useRef<Map<string, AgentState>>(agentStates);
  useEffect(() => { agentStatesRef.current = agentStates; }, [agentStates]);

  const updateAgentState = useCallback((agentId: string, updater: (prev: AgentState) => AgentState) => {
    setAgentStates((prev) => {
      const next = new Map(prev);
      const current = next.get(agentId);
      if (current) {
        next.set(agentId, updater(current));
      }
      return next;
    });
  }, []);

  // Initialize: load agents from config
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const configs = await loadAgents();
        if (cancelled) return;
        const initial = new Map<string, AgentState>();
        for (const config of configs) {
          initial.set(config.id, {
            connection: { config, status: 'disconnected' },
            sessions: [],
            nodes: [],
          });
        }
        setAgentStates(initial);
      } catch (e) {
        console.error('Failed to load agents:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Listen for tunnel status changes — use ref to read latest state so we
  // don't need agentStates in the dependency array (avoids stale closures
  // and infinite re-registration).
  useEffect(() => {
    onTunnelStatus((agentId, tunnelStatus, error) => {
      try {
        let status: ConnectionStatus;
        if (tunnelStatus === 'open') status = 'tunnel_up';
        else if (tunnelStatus === 'connecting') status = 'connecting';
        else if (tunnelStatus === 'error') status = 'error';
        else status = 'disconnected';

        updateAgentState(agentId, (prev) => ({
          ...prev,
          connection: { ...prev.connection, status, error },
        }));

        // When tunnel is up, connect WebSocket
        if (tunnelStatus === 'open') {
          const state = agentStatesRef.current.get(agentId);
          if (state) {
            const port = state.connection.config.localPort;
            const token = state.connection.config.gatewayToken;
            let client = clientsRef.current.get(agentId);
            if (!client) {
              client = new GatewayClient(port, token);
              client.setConnectionCallback((_port, connected) => {
                updateAgentState(agentId, (prev) => ({
                  ...prev,
                  connection: {
                    ...prev.connection,
                    status: connected ? 'ws_connected' : 'tunnel_up',
                    lastSeen: connected ? Date.now() : prev.connection.lastSeen,
                  },
                }));
              });
              clientsRef.current.set(agentId, client);
            }
            client.connect();
          }
        }
      } catch (e) {
        console.error('Error in tunnel status handler:', e);
      }
    });

    return () => { onTunnelStatus(() => {}); };
  }, [updateAgentState]);

  // Polling: fetch data from connected agents
  useEffect(() => {
    const poll = async () => {
      for (const [agentId, client] of clientsRef.current) {
        if (!client.connected) continue;
        try {
          const [sessions, nodes, health] = await Promise.all([
            client.listSessions().catch(() => null),
            client.listNodes().catch(() => null),
            client.getHealth().catch(() => null),
          ]);
          updateAgentState(agentId, (prev) => ({
            ...prev,
            health: health || prev.health,
            sessions: Array.isArray(sessions) ? sessions : prev.sessions,
            nodes: Array.isArray(nodes) ? nodes : prev.nodes,
            connection: {
              ...prev.connection,
              lastSeen: Date.now(),
            },
          }));
        } catch {
          // Ignore polling errors
        }
      }
    };

    pollTimerRef.current = setInterval(poll, POLL_INTERVAL);
    // Do an initial poll soon after mount
    const initialPoll = setTimeout(poll, 2000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      clearTimeout(initialPoll);
    };
  }, [updateAgentState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const client of clientsRef.current.values()) {
        client.disconnect();
      }
      closeAllTunnels();
    };
  }, []);

  const agents = Array.from(agentStates.values());

  const allSessions = agents.flatMap((a) =>
    (Array.isArray(a.sessions) ? a.sessions : []).map((s) => ({ ...s, agentName: a.connection.config.name }))
  );

  const allNodes = agents.flatMap((a) =>
    (Array.isArray(a.nodes) ? a.nodes : []).map((n) => ({ ...n, agentName: a.connection.config.name }))
  );

  const connectedCount = agents.filter(
    (a) => a.connection.status === 'ws_connected'
  ).length;

  const addAgent = async (
    partial: Partial<AgentConfig> & Pick<AgentConfig, 'name' | 'ec2Ip' | 'ec2User' | 'pemPath'>
  ) => {
    const configs = Array.from(agentStatesRef.current.values()).map((a) => a.connection.config);
    const newConfig = createDefaultAgent(partial, configs);
    const newState: AgentState = {
      connection: { config: newConfig, status: 'disconnected' },
      sessions: [],
      nodes: [],
    };
    setAgentStates((prev) => {
      const next = new Map(prev);
      next.set(newConfig.id, newState);
      return next;
    });
    await saveAgents([...configs, newConfig]);
  };

  const removeAgent = async (id: string) => {
    // Disconnect first
    const client = clientsRef.current.get(id);
    if (client) {
      client.disconnect();
      clientsRef.current.delete(id);
    }
    await closeTunnel(id);

    // Use the state-setter callback form so we compute remaining from latest state
    let remaining: AgentConfig[] = [];
    setAgentStates((prev) => {
      const next = new Map(prev);
      next.delete(id);
      remaining = Array.from(next.values()).map((a) => a.connection.config);
      return next;
    });
    await saveAgents(remaining);
  };

  const updateAgentConfig = async (id: string, updates: Partial<AgentConfig>) => {
    let configs: AgentConfig[] = [];
    setAgentStates((prev) => {
      const next = new Map(prev);
      const state = next.get(id);
      if (state) {
        next.set(id, {
          ...state,
          connection: {
            ...state.connection,
            config: { ...state.connection.config, ...updates },
          },
        });
      }
      configs = Array.from(next.values()).map((a) => a.connection.config);
      return next;
    });
    await saveAgents(configs);
  };

  const connectAgent = async (id: string) => {
    const state = agentStatesRef.current.get(id);
    if (!state) return;
    updateAgentState(id, (prev) => ({
      ...prev,
      connection: { ...prev.connection, status: 'connecting', error: undefined },
    }));
    try {
      await openTunnel(state.connection.config);
    } catch (e) {
      console.error('Failed to open tunnel:', e);
      updateAgentState(id, (prev) => ({
        ...prev,
        connection: { ...prev.connection, status: 'error', error: e instanceof Error ? e.message : String(e) },
      }));
    }
  };

  const disconnectAgent = async (id: string) => {
    const client = clientsRef.current.get(id);
    if (client) {
      client.disconnect();
      clientsRef.current.delete(id);
    }
    try {
      await closeTunnel(id);
    } catch (e) {
      console.error('Failed to close tunnel:', e);
    }
    updateAgentState(id, (prev) => ({
      ...prev,
      connection: { ...prev.connection, status: 'disconnected', error: undefined },
      sessions: [],
      nodes: [],
      health: undefined,
    }));
  };

  const connectAll = async () => {
    for (const state of agentStatesRef.current.values()) {
      if (state.connection.config.enabled && state.connection.status === 'disconnected') {
        await connectAgent(state.connection.config.id);
      }
    }
  };

  const disconnectAll = async () => {
    for (const state of agentStatesRef.current.values()) {
      if (state.connection.status !== 'disconnected') {
        await disconnectAgent(state.connection.config.id);
      }
    }
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        allSessions,
        allNodes,
        connectedCount,
        totalCount: agents.length,
        loading,
        addAgent,
        removeAgent,
        updateAgent: updateAgentConfig,
        connectAgent,
        disconnectAgent,
        connectAll,
        disconnectAll,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useAgents must be used within <AgentProvider>');
  }
  return ctx;
}
