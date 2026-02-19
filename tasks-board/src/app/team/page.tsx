'use client';

import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'blocked';
  task?: string;
}

export default function Team() {
  const [members] = useState<Member[]>([
    { id: '1', name: '大龍蝦 (Me)', role: 'Commander', status: 'working', task: 'Building Mission Control' },
    { id: '2', name: 'KIMI', role: 'Researcher', status: 'idle' },
    { id: '3', name: 'MiniMax', role: 'Worker', status: 'idle' },
    { id: '4', name: 'Claude Opus', role: 'Advisor', status: 'idle' },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👥 Team</h1>
      <div className="grid grid-cols-2 gap-4">
        {members.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
              member.status === 'working' ? 'bg-green-100' : member.status === 'blocked' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {member.name[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
              {member.task && <p className="text-sm text-blue-600">📌 {member.task}</p>}
            </div>
            <div className={`px-3 py-1 rounded ${
              member.status === 'working' ? 'bg-green-100 text-green-800' : 
              member.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {member.status === 'working' ? '🔥' : member.status === 'blocked' ? '🚫' : '💤'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
