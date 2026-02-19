import Link from 'next/link';

export default function Home() {
  const systems = [
    { id: 1, name: 'Tasks Board', icon: '🎯', description: 'Track all tasks and their status', href: '/tasks', status: 'active' },
    { id: 2, name: 'Calendar', icon: '📅', description: 'Scheduled tasks and cron jobs', href: '/calendar', status: 'active' },
    { id: 3, name: 'Memory', icon: '🧠', description: 'Searchable memory documents', href: '/memory', status: 'active' },
    { id: 4, name: 'Content Pipeline', icon: '📝', description: 'Content creation workflow', href: '/content', status: 'active' },
    { id: 5, name: 'Team', icon: '👥', description: 'Sub-agents organization', href: '/team', status: 'active' },
    { id: 6, name: 'Office', icon: '🏢', description: 'Real-time agent status', href: '/office', status: 'active' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏢 Mission Control</h1>
        <p className="text-gray-500">AI Operating System Dashboard • All Systems Operational</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {systems.map(system => (
          <Link 
            key={system.id} 
            href={system.href}
            className="block p-6 rounded-lg shadow hover:shadow-lg transition bg-white hover:bg-blue-50"
          >
            <div className="text-4xl mb-3">{system.icon}</div>
            <h2 className="text-xl font-bold mb-1">{system.name}</h2>
            <p className="text-sm text-gray-500">{system.description}</p>
            <span className="inline-block mt-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              ● Active
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
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
              <div className="text-2xl font-bold">4</div>
              <div className="text-sm text-gray-500">Team Members</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold mb-2">🚀 System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Next.js App</span>
              <span className="text-green-600">✓ Running</span>
            </div>
            <div className="flex justify-between">
              <span>All 6 Pages</span>
              <span className="text-green-600">✓ Deployed</span>
            </div>
            <div className="flex justify-between">
              <span>Navigation</span>
              <span className="text-green-600">✓ Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
