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

  const fetchHistories = useCallback(async () => {
    const connected = agents.filter(
      (a) => a.connection.status === 'ws_connected'
    );
    if (connected.length === 0) return;

    setLoadingHistory(true);
    const results: (SessionHistory & { agentName: string })[] = [];

    for (const agent of connected) {
      const client = new GatewayClient(agent.connection.config.localPort, agent.connection.config.gatewayToken);
      client.connect();
      await new Promise((r) => setTimeout(r, 1000));

      for (const session of agent.sessions) {
        try {
          const history = await client.getSessionHistory(session.id);
          results.push({ ...history, agentName: agent.connection.config.name });
        } catch {
          // 略過無法取得紀錄的 Session
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
      content: messagePreview || `Session 狀態：${session.status}`,
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
        <h1 className="text-2xl font-bold mb-6">記憶庫</h1>
        <NoAgentsPlaceholder message="連接 Agent 即可瀏覽 Session 對話紀錄。" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">記憶庫</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜尋 Session 與對話紀錄..."
        className="w-full p-3 border rounded-lg mb-6"
      />

      {loadingHistory && (
        <p className="text-sm text-gray-400 mb-4">正在載入對話紀錄...</p>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-500">
          {allSessions.length === 0
            ? '已連線的 Agent 中沒有可用的 Session。'
            : '沒有符合搜尋條件的結果。'}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((memory) => (
            <div key={memory.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg truncate flex-1">{memory.title}</h3>
                <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                  {memory.date
                    ? new Date(memory.date).toLocaleDateString('zh-TW')
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
                    {memory.messageCount} 則訊息
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
