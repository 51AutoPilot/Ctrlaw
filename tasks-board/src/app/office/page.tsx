'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'working' | 'idle' | 'thinking';
  currentTask?: string;
}

export default function Office() {
  const [agents] = useState<Agent[]>([
    { id: '1', name: '大龍蝦', avatar: '🦞', status: 'working', currentTask: 'Building Mission Control' },
    { id: '2', name: 'KIMI', avatar: '🤖', status: 'thinking', currentTask: 'Monitoring Web4' },
    { id: '3', name: 'MiniMax', avatar: '⚡', status: 'idle' },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🏢 Digital Office</h1>
      
      <div className="grid grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-lg p-6 shadow">
            <div className="text-6xl mb-4 text-center">{agent.avatar}</div>
            <h2 className="text-xl font-bold text-center mb-2">{agent.name}</h2>
            <div className="flex justify-center gap-2 mb-4">
              {agent.status === 'working' && <span className="px-3 py-1 bg-green-100 text-green-800 rounded">💻 Working</span>}
              {agent.status === 'thinking' && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">🤔 Thinking</span>}
              {agent.status === 'idle' && <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">😴 Idle</span>}
            </div>
            {agent.currentTask && (
              <p className="text-sm text-center text-gray-600 border-t pt-3">
                📌 {agent.currentTask}
              </p>
            )}
            <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: agent.status === 'working' ? '80%' : '20%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">📊 Office Status</h3>
        <p className="text-sm">Active Agents: {agents.filter(a => a.status !== 'idle').length}/{agents.length}</p>
      </div>
    </div>
  );
}
