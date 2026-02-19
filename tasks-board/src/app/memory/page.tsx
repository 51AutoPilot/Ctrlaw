'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAgents } from '../../lib/agent-context';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';
import { GatewayClient } from '../../lib/gateway-client';
import type { SessionHistory } from '../../lib/types';

export default function MemoryPage() {
  const { allSessions, agents } = useAgents();
  const [search, setSearch] = useState('');
  const [histories, setHistories] = useState<
    (SessionHistory & { agentName: string })[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch session histories from connected agents
  const fetchHistories = useCallback(async () => {
    const connected = agents.filter(
      (a) => a.connection.status === 'ws_connected'
    );
    if (connected.length === 0) return;

    setLoadingHistory(true);
    const results: (SessionHistory & { agentName: string })[] = [];

    for (const agent of connected) {
      const client = new GatewayClient(agent.connection.config.localPort);
      client.connect();
      // Wait briefly for WebSocket to connect
      await new Promise((r) => setTimeout(r, 1000));

      for (const session of agent.sessions) {
        try {
          const history = await client.getSessionHistory(session.id);
          results.push({ ...history, agentName: agent.connection.config.name });
        } catch {
          // Skip sessions we can't fetch history for
        }
      }

      client.disconnect();
    }

    setHistories(results);
    setLoadingHistory(false);
  }, [agents]);

  useEffect(() => {
    if (agents.some((a) => a.connection.status === 'ws_connected')) {
      fetchHistories();
    }
  }, [agents, fetchHistories]);

  // Combine sessions + histories for display
  const memoryCards = allSessions.map((session) => {
    const history = histories.find(
      (h) => h.session_id === session.id && h.agentName === session.agentName
    );
    const messagePreview = history?.messages
      .slice(0, 3)
      .map((m) => `${m.role}: ${m.content}`)
      .join(' | ');

    return {
      id: `${session.agentName}-${session.id}`,
      title: session.id,
      content: messagePreview || `Session ${session.status}`,
      agentName: session.agentName,
      date: session.created_at || '',
      status: session.status,
      messageCount: history?.messages.length || 0,
    };
  });

  const filtered = memoryCards.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.agentName.toLowerCase().includes(search.toLowerCase())
  );

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Memory</h1>
        <NoAgentsPlaceholder message="Connect agents to browse session conversation history." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Memory</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sessions and conversations..."
        className="w-full p-3 border rounded-lg mb-6"
      />

      {loadingHistory && (
        <p className="text-sm text-gray-400 mb-4">Loading conversation history...</p>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-500">
          {allSessions.length === 0
            ? 'No sessions available from connected agents.'
            : 'No results match your search.'}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((memory) => (
            <div key={memory.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg truncate flex-1">{memory.title}</h3>
                <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                  {memory.date
                    ? new Date(memory.date).toLocaleDateString()
                    : ''}
                </span>
              </div>
              <p className="text-gray-700 mb-3 line-clamp-2">{memory.content}</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {memory.agentName}
                </span>
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    memory.status === 'active' || memory.status === 'running'
                      ? 'bg-green-100 text-green-800'
                      : memory.status === 'completed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {memory.status}
                </span>
                {memory.messageCount > 0 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                    {memory.messageCount} messages
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
