'use client';

import { useMemo } from 'react';
import { useAgents } from '../../lib/agent-context';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';
import { useT } from '../../lib/i18n';

type Stage = 'pending' | 'active' | 'running' | 'completed' | 'failed';

export default function ContentPipeline() {
  const { allSessions, agents, connectedCount } = useAgents();
  const { t, locale } = useT();

  const STAGES: { id: Stage; label: string }[] = [
    { id: 'pending', label: t('content.pending') },
    { id: 'active', label: t('content.active') },
    { id: 'running', label: t('content.running') },
    { id: 'completed', label: t('content.completed') },
    { id: 'failed', label: t('content.failed') },
  ];

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
  }, [allSessions, t]);

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('content.title')}</h1>
        <NoAgentsPlaceholder message={t('content.placeholder')} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('content.title')}</h1>
        <span className="text-sm text-gray-500">
          {t('content.sessionCount', { sessions: allSessions.length, agents: connectedCount })}
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
                      {new Date(session.created_at).toLocaleDateString(locale)}
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
