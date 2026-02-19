import Link from 'next/link';

export default function Home() {
  const systems = [
    { id: 1, name: 'Tasks Board', icon: '🎯', description: 'Track all tasks and their status', href: '/tasks', status: 'active' },
    { id: 2, name: 'Calendar', icon: '📅', description: 'Scheduled tasks and cron jobs', href: '/calendar', status: 'active' },
    { id: 3, name: 'Memory', icon: '🧠', description: 'Searchable memory documents', href: '/memory', status: 'active' },
    { id: 4, name: 'Content Pipeline', icon: '📝', description: 'Content creation workflow', href: '/content', status: 'coming' },
    { id: 5, name: 'Team', icon: '👥', description: 'Sub-agents organization', href: '/team', status: 'coming' },
    { id: 6, name: 'Office', icon: '🏢', description: 'Real-time agent status', href: '/office', status: 'coming' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">🏢 Mission Control</h1>
      <p className="text-gray-500 mb-8">AI Operating System Dashboard</p>
      
      <div className="grid grid-cols-3 gap-4">
        {systems.map(system => (
          <Link 
            key={system.id} 
            href={system.href}
            className={`block p-6 rounded-lg shadow hover:shadow-lg transition ${
              system.status === 'coming' ? 'bg-gray-100 opacity-60' : 'bg-white'
            }`}
          >
            <div className="text-4xl mb-3">{system.icon}</div>
            <h2 className="text-xl font-bold mb-1">{system.name}</h2>
            <p className="text-sm text-gray-500">{system.description}</p>
            {system.status === 'coming' && (
              <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-xs rounded">Coming Soon</span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">💡 Quick Stats</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-gray-500">Active Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm text-gray-500">Memories</div>
          </div>
          <div>
            <div className="text-2xl font-bold">1</div>
            <div className="text-sm text-gray-500">Sub-agents</div>
          </div>
        </div>
      </div>
    </div>
  );
}
