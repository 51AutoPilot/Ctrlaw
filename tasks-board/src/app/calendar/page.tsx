'use client';

import { useMemo } from 'react';
import { useAgents } from '../../lib/agent-context';
import { NoAgentsPlaceholder } from '../../components/NoAgentsPlaceholder';

export default function Calendar() {
  const { allSessions, agents, connectedCount } = useAgents();

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const groups: Record<string, typeof allSessions> = {};
    for (const session of allSessions) {
      const dateStr = session.created_at
        ? new Date(session.created_at).toISOString().split('T')[0]
        : 'Unknown';
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(session);
    }
    return groups;
  }, [allSessions]);

  // Build a 7-day view centered on today
  const days = useMemo(() => {
    const result: { date: string; label: string; dayOfWeek: string }[] = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      result.push({
        date: iso,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        dayOfWeek: dow,
      });
    }
    return result;
  }, []);

  if (agents.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
        <NoAgentsPlaceholder message="Connect agents to see session activity on a timeline." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>

      {/* 7-day view */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="grid grid-cols-7 bg-gray-100">
          {days.map((d) => (
            <div key={d.date} className="p-2 text-center">
              <div className="font-bold text-xs">{d.dayOfWeek}</div>
              <div className="text-sm">{d.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const daySessions = sessionsByDate[d.date] || [];
            const isToday = d.date === new Date().toISOString().split('T')[0];
            return (
              <div
                key={d.date}
                className={`min-h-[100px] border p-2 ${isToday ? 'bg-blue-50' : ''}`}
              >
                {daySessions.map((s) => (
                  <div
                    key={`${s.agentName}-${s.id}`}
                    className={`text-xs p-1 rounded mb-1 truncate ${
                      s.status === 'active' || s.status === 'running'
                        ? 'bg-green-100 text-green-800'
                        : s.status === 'completed'
                          ? 'bg-gray-100 text-gray-600'
                          : s.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {s.agentName}: {s.id.slice(0, 8)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session timeline */}
      <h2 className="text-xl font-bold mb-4">Session Activity</h2>
      {allSessions.length === 0 && connectedCount > 0 ? (
        <p className="text-gray-500">No sessions found from connected agents.</p>
      ) : (
        <div className="space-y-2">
          {allSessions.map((session) => (
            <div
              key={`${session.agentName}-${session.id}`}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold">{session.id}</h3>
                <p className="text-sm text-gray-500">
                  {session.agentName}
                  {session.created_at && ` \u2022 ${new Date(session.created_at).toLocaleString()}`}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  session.status === 'active' || session.status === 'running'
                    ? 'bg-green-100 text-green-800'
                    : session.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : session.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {session.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
