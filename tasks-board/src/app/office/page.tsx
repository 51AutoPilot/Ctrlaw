'use client';

import { useAgents } from '../../lib/agent-context';
import { AgentStatusBadge } from '../../components/AgentStatusBadge';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';
import { useT } from '../../lib/i18n';

export default function Office() {
  const { agents } = useAgents();
  const { t } = useT();

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('office.title')}</h1>
        <NoAgentsPlaceholder message={t('office.placeholder')} />
      </div>
    );
  }

  const activeCount = agents.filter(
    (a) => a.connection.status === 'ws_connected'
  ).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('office.title')}</h1>

      <div className="grid grid-cols-3 gap-6">
        {agents.map(({ connection, sessions, health }) => {
          const c = connection.config;
          const isConnected = connection.status === 'ws_connected';
          const activeSessions = sessions.filter(
            (s) => s.status === 'active' || s.status === 'running'
          );
          const progressPercent = isConnected
            ? Math.min(100, Math.max(10, activeSessions.length * 25))
            : 0;

          return (
            <div key={c.id} className="bg-white rounded-lg p-6 shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold">
                {c.avatar}
              </div>
              <h2 className="text-xl font-bold text-center mb-1">{c.name}</h2>
              <p className="text-xs text-gray-400 text-center mb-3">{c.role}</p>
              <div className="flex justify-center mb-4">
                <AgentStatusBadge status={connection.status} />
              </div>
              {isConnected && activeSessions.length > 0 && (
                <p className="text-sm text-center text-gray-600 border-t pt-3">
                  {t('office.activeSessions', { count: activeSessions.length })}
                </p>
              )}
              {health && (
                <p className="text-xs text-center text-gray-400 mt-1">
                  {health.version && `v${health.version}`}
                  {health.uptime != null && ` | ${t('office.uptime', { minutes: Math.floor(health.uptime / 60) })}`}
                </p>
              )}
              <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {connection.error && (
                <p className="text-xs text-red-500 mt-2 text-center">{connection.error}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">{t('office.status')}</h3>
        <p className="text-sm">
          {t('office.onlineAgents', { active: activeCount, total: agents.length })}
        </p>
      </div>
    </div>
  );
}
