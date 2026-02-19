'use client';

import { useState } from 'react';

type Stage = 'idea' | 'script' | 'thumbnail' | 'filming' | 'publish';

interface Content {
  id: string;
  title: string;
  stage: Stage;
  scheduledDate?: string;
}

export default function ContentPipeline() {
  const [contents] = useState<Content[]>([
    { id: '1', title: 'Mission Control Demo', stage: 'script' },
    { id: '2', title: 'AI Trading Guide', stage: 'idea' },
  ]);

  const stages: { id: Stage; label: string }[] = [
    { id: 'idea', label: '💡 Idea' },
    { id: 'script', label: '📝 Script' },
    { id: 'thumbnail', label: '🖼️ Thumbnail' },
    { id: 'filming', label: '🎬 Filming' },
    { id: 'publish', label: '🚀 Publish' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📝 Content Pipeline</h1>
      <div className="grid grid-cols-5 gap-2">
        {stages.map(stage => (
          <div key={stage.id} className="bg-gray-100 p-3 rounded">
            <h2 className="font-bold mb-3">{stage.label}</h2>
            {contents.filter(c => c.stage === stage.id).map(c => (
              <div key={c.id} className="bg-white p-2 rounded mb-2 text-sm">
                {c.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
