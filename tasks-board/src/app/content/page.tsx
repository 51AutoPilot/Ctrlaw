'use client';

import { useMemo } from 'react';
import { useAgents } from '../../lib/agent-context';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';

type Stage = 'pending' | 'active' | 'running' | 'completed' | 'failed';

const STAGES: { id: Stage; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'running', label: 'Running' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
];

export default function ContentPipeline() {
  const { allSessions, agents, connectedCount } = useAgents();

  const grouped = useMemo(() => {
    const map: Record<string, typeof allSessions> = {};
    for (const stage of STAGES) {
      map[stage.id] = [];
    }
    for (const session of allSessions) {
      const stageId = STAGES.find((s) => s.id === session.status)
        ? session.status
        : 'pending';
      if (!map[stageId]) map[stageId] = [];
      map[stageId].push(session);
    }
    return map;
  }, [allSessions]);

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Content Pipeline</h1>
        <NoAgentsPlaceholder message="Connect agents to see sessions flowing through pipeline stages." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Pipeline</h1>
        <span className="text-sm text-gray-500">
          {allSessions.length} total sessions from {connectedCount} agent{connectedCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {STAGES.map((stage) => {
          const items = grouped[stage.id] || [];
          return (
            <div key={stage.id} className="bg-gray-100 p-3 rounded">
              <h2 className="font-bold mb-3">
                {stage.label}{' '}
                <span className="text-gray-400 font-normal text-sm">({items.length})</span>
              </h2>
              {items.map((session) => (
                <div
                  key={`${session.agentName}-${session.id}`}
                  className="bg-white p-2 rounded mb-2 text-sm"
                >
                  <p className="truncate font-medium">{session.id}</p>
                  <p className="text-xs text-gray-400">{session.agentName}</p>
                  {session.created_at && (
                    <p className="text-xs text-gray-400">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
