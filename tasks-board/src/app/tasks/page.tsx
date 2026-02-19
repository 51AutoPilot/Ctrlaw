'use client';

import { useAgents } from '../../lib/agent-context';
import { AgentStatusBadge } from '../../components/AgentStatusBadge';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';

type TaskStatus = 'active' | 'running' | 'completed' | 'failed' | 'pending' | 'unknown';

const STATUS_COLUMNS: { status: TaskStatus[]; label: string }[] = [
  { status: ['pending'], label: '待處理' },
  { status: ['active', 'running'], label: '進行中' },
  { status: ['completed'], label: '已完成' },
  { status: ['failed'], label: '失敗' },
];

export default function TasksBoard() {
  const { allSessions, agents, connectedCount } = useAgents();

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">任務看板</h1>
        <NoAgentsPlaceholder message="連接 Agent 即可查看即時 Session 任務。" />
      </div>
    );
  }

  const categorized = allSessions.map((session) => {
    let colStatus: TaskStatus = 'unknown';
    for (const col of STATUS_COLUMNS) {
      if (col.status.includes(session.status as TaskStatus)) {
        colStatus = col.status[0];
        break;
      }
    }
    if (colStatus === 'unknown') colStatus = 'pending';
    return { ...session, colStatus };
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">任務看板</h1>
        <span className="text-sm text-gray-500">
          來自 {connectedCount} 個 Agent 的 {allSessions.length} 個 Session
        </span>
      </div>

      {allSessions.length === 0 && connectedCount > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-yellow-800">
          已連接 {connectedCount} 個 Agent，但未找到任何 Session。
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const items = categorized.filter((s) =>
            col.status.includes(s.colStatus)
          );
          return (
            <div key={col.label} className="bg-gray-100 p-4 rounded-lg">
              <h2 className="font-bold mb-4">
                {col.label}{' '}
                <span className="text-gray-400 font-normal">({items.length})</span>
              </h2>
              {items.map((session) => (
                <div key={`${session.agentName}-${session.id}`} className="bg-white p-3 rounded mb-2 shadow-sm">
                  <p className="font-medium text-sm truncate">{session.id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {session.agentName}
                    </span>
                    <span className="text-xs text-gray-400">{session.status}</span>
                  </div>
                  {session.created_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(session.created_at).toLocaleString('zh-TW')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 各 Agent 狀態 */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {agents.map(({ connection }) => (
          <div key={connection.config.id} className="flex items-center gap-1.5 text-sm bg-white px-3 py-1.5 rounded shadow-sm">
            <span>{connection.config.name}</span>
            <AgentStatusBadge status={connection.status} showLabel={false} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
