'use client';

import Link from 'next/link';
import { useAgents } from '../lib/agent-context';
import { AgentStatusBadge } from '../components/AgentStatusBadge';

export default function Home() {
  const { agents, allSessions, connectedCount, totalCount } = useAgents();

  const systems = [
    { id: 1, name: '任務看板', icon: 'T', description: '追蹤所有任務與狀態', href: '/tasks' },
    { id: 2, name: '行事曆', icon: 'C', description: 'Session 活動時間線', href: '/calendar' },
    { id: 3, name: '記憶庫', icon: 'M', description: 'Session 對話紀錄', href: '/memory' },
    { id: 4, name: '內容管線', icon: 'P', description: '內容創作工作流程', href: '/content' },
    { id: 5, name: '團隊', icon: 'T', description: 'Agent 組織架構', href: '/team' },
    { id: 6, name: '辦公室', icon: 'O', description: '即時 Agent 狀態', href: '/office' },
  ];

  const activeSessions = allSessions.filter((s) => s.status === 'active' || s.status === 'running').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ctrlaw 控制台</h1>
        <p className="text-gray-500">
          AI Agent 作業系統儀表板
          {connectedCount > 0
            ? ` \u2022 ${connectedCount} 個 Agent 在線`
            : totalCount > 0
              ? ' \u2022 所有 Agent 離線'
              : ' \u2022 尚未設定 Agent'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {systems.map((system) => (
          <Link
            key={system.id}
            href={system.href}
            className="block p-6 rounded-lg shadow hover:shadow-lg transition bg-white hover:bg-blue-50"
          >
            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 mb-3">
              {system.icon}
            </div>
            <h2 className="text-xl font-bold mb-1">{system.name}</h2>
            <p className="text-sm text-gray-500">{system.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">快速統計</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{allSessions.length}</div>
              <div className="text-sm text-gray-500">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{activeSessions}</div>
              <div className="text-sm text-gray-500">進行中</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{connectedCount}</div>
              <div className="text-sm text-gray-500">已連線</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-gray-500">Agent 總數</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold mb-2">Agent 狀態</h3>
          {agents.length === 0 ? (
            <p className="text-sm text-gray-500">
              尚未設定 Agent。{' '}
              <Link href="/settings" className="text-blue-600 underline">
                新增 Agent
              </Link>
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {agents.map(({ connection }) => (
                <div key={connection.config.id} className="flex justify-between items-center">
                  <span>{connection.config.name}</span>
                  <AgentStatusBadge status={connection.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
