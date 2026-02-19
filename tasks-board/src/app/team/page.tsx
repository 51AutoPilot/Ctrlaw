'use client';

import { useAgents } from '../../lib/agent-context';
import { AgentStatusBadge } from '../../components/AgentStatusBadge';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';

function connectionToWorkStatus(status: string): 'working' | 'idle' | 'blocked' {
  if (status === 'ws_connected') return 'working';
  if (status === 'error') return 'blocked';
  return 'idle';
}

export default function Team() {
  const { agents } = useAgents();

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Team</h1>
        <NoAgentsPlaceholder message="Add agents in Settings to see your team here." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Team</h1>
      <div className="grid grid-cols-2 gap-4">
        {agents.map(({ connection, sessions }) => {
          const c = connection.config;
          const workStatus = connectionToWorkStatus(connection.status);
          const activeSessions = sessions.filter(
            (s) => s.status === 'active' || s.status === 'running'
          );
          const currentTask = activeSessions.length > 0
            ? `${activeSessions.length} active session${activeSessions.length > 1 ? 's' : ''}`
            : undefined;

          return (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  workStatus === 'working'
                    ? 'bg-green-100'
                    : workStatus === 'blocked'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                }`}
              >
                {c.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.role}</p>
                {currentTask && <p className="text-sm text-blue-600">{currentTask}</p>}
              </div>
              <AgentStatusBadge status={connection.status} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
