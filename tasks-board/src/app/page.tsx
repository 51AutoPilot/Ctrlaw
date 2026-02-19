'use client';

import Link from 'next/link';
import { useAgents } from '../lib/agent-context';
import { AgentStatusBadge } from '../components/AgentStatusBadge';
import { useT } from '../lib/i18n';

export default function Home() {
  const { agents, allSessions, connectedCount, totalCount } = useAgents();
  const { t } = useT();

  const systems = [
    { id: 1, name: t('home.sys.taskBoard'), icon: 'T', description: t('home.sys.taskBoardDesc'), href: '/tasks' },
    { id: 2, name: t('home.sys.calendar'), icon: 'C', description: t('home.sys.calendarDesc'), href: '/calendar' },
    { id: 3, name: t('home.sys.memory'), icon: 'M', description: t('home.sys.memoryDesc'), href: '/memory' },
    { id: 4, name: t('home.sys.pipeline'), icon: 'P', description: t('home.sys.pipelineDesc'), href: '/content' },
    { id: 5, name: t('home.sys.team'), icon: 'T', description: t('home.sys.teamDesc'), href: '/team' },
    { id: 6, name: t('home.sys.office'), icon: 'O', description: t('home.sys.officeDesc'), href: '/office' },
  ];

  const activeSessions = allSessions.filter((s) => s.status === 'active' || s.status === 'running').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('home.title')}</h1>
        <p className="text-gray-500">
          {t('home.subtitle')}
          {connectedCount > 0
            ? ` \u2022 ${t('home.agentsOnline', { count: connectedCount })}`
            : totalCount > 0
              ? ` \u2022 ${t('home.allOffline')}`
              : ` \u2022 ${t('home.noAgentsConfigured')}`}
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
          <h3 className="font-bold mb-2">{t('home.quickStats')}</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{allSessions.length}</div>
              <div className="text-sm text-gray-500">{t('home.sessions')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{activeSessions}</div>
              <div className="text-sm text-gray-500">{t('home.active')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{connectedCount}</div>
              <div className="text-sm text-gray-500">{t('home.connected')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-gray-500">{t('home.totalAgents')}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold mb-2">{t('home.agentStatus')}</h3>
          {agents.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t('home.noAgentsYet')}{' '}
              <Link href="/settings" className="text-blue-600 underline">
                {t('home.addAgent')}
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
