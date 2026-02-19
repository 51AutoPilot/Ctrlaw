'use client';

import { useState } from 'react';

interface Memory {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

export default function Memory() {
  const [memories] = useState<Memory[]>([
    { id: '1', title: 'AGENTS.md Rules', content: 'Investment advice must check on-chain data first', createdAt: '2026-02-19', tags: ['rules', 'important'] },
    { id: '2', title: 'Wallet Addresses', content: 'ACP: 0x2b4271..., SOL: AaRbbz...', createdAt: '2026-02-19', tags: ['wallet', 'crypto'] },
    { id: '3', title: 'Skills Installed', content: 'x-research, x-automation, blogwatcher, crypto-tools...', createdAt: '2026-02-19', tags: ['skills'] },
    { id: '4', title: 'Goals', content: 'Build Mission Control, Earn money with ACP, Monitor Web4', createdAt: '2026-02-19', tags: ['goals'] },
  ]);

  const [search, setSearch] = useState('');

  const filtered = memories.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🧠 Memory</h1>
      
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search memories..."
        className="w-full p-3 border rounded-lg mb-6"
      />

      <div className="space-y-4">
        {filtered.map(memory => (
          <div key={memory.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{memory.title}</h3>
              <span className="text-sm text-gray-500">{memory.createdAt}</span>
            </div>
            <p className="text-gray-700 mb-3">{memory.content}</p>
            <div className="flex gap-2">
              {memory.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
