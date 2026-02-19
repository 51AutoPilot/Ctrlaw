'use client';

import { useState } from 'react';

interface ScheduledTask {
  id: string;
  title: string;
  scheduledAt: string;
  frequency: string;
  lastRun?: string;
  status: 'pending' | 'success' | 'failed';
}

export default function Calendar() {
  const [tasks] = useState<ScheduledTask[]>([
    { id: '1', title: 'Twitter Trend Monitor', scheduledAt: '00:00', frequency: 'Every 30min', status: 'success' },
    { id: '2', title: 'Crypto Report', scheduledAt: '00:00', frequency: 'Hourly', status: 'success' },
    { id: '3', title: 'Memory Update', scheduledAt: '06:00', frequency: 'Every 6h', status: 'pending' },
    { id: '4', title: 'Self Update', scheduledAt: '06:00', frequency: 'Every 6h', status: 'pending' },
    { id: '5', title: 'Web4 Monitor', scheduledAt: '00:00', frequency: 'Heartbeat', status: 'success' },
  ]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📅 Calendar</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-bold">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} className="min-h-[80px] border p-2">
              <span className="text-sm text-gray-500">{i + 16}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">⏰ Scheduled Tasks</h2>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.frequency} • {task.scheduledAt}</p>
            </div>
            <div className="flex gap-2">
              {task.status === 'success' && <span className="px-3 py-1 bg-green-100 text-green-800 rounded">✅</span>}
              {task.status === 'failed' && <span className="px-3 py-1 bg-red-100 text-red-800 rounded">❌</span>}
              {task.status === 'pending' && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">⏳</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
