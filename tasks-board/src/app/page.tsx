'use client';

import Link from 'next/link';
import { useAgents } from '../lib/agent-context';
import { AgentStatusBadge } from '../components/AgentStatusBadge';

export default function Home() {
  const { agents, allSessions, connectedCount, totalCount } = useAgents();

  const systems = [
    { id: 1, name: 'Tasks Board', icon: 'T', description: 'Track all tasks and their status', href: '/tasks' },
    { id: 2, name: 'Calendar', icon: 'C', description: 'Session activity timeline', href: '/calendar' },
    { id: 3, name: 'Memory', icon: 'M', description: 'Session conversation history', href: '/memory' },
    { id: 4, name: 'Content Pipeline', icon: 'P', description: 'Content creation workflow', href: '/content' },
    { id: 5, name: 'Team', icon: 'T', description: 'Agent organization', href: '/team' },
    { id: 6, name: 'Office', icon: 'O', description: 'Real-time agent status', href: '/office' },
  ];

  const activeSessions = allSessions.filter((s) => s.status === 'active' || s.status === 'running').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mission Control</h1>
        <p className="text-gray-500">
          AI Operating System Dashboard
          {connectedCount > 0
            ? ` \u2022 ${connectedCount} Agent${connectedCount > 1 ? 's' : ''} Online`
            : totalCount > 0
              ? ' \u2022 All Agents Offline'
              : ' \u2022 No Agents Configured'}
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
          <h3 className="font-bold mb-2">Quick Stats</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{allSessions.length}</div>
              <div className="text-sm text-gray-500">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{activeSessions}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{connectedCount}</div>
              <div className="text-sm text-gray-500">Connected</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-gray-500">Agents</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold mb-2">Agent Status</h3>
          {agents.length === 0 ? (
            <p className="text-sm text-gray-500">
              No agents configured.{' '}
              <Link href="/settings" className="text-blue-600 underline">
                Add agents
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
