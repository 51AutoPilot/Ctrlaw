'use client';

import { useState } from 'react';
import { useAgents } from '../../lib/agent-context';
import { AgentStatusBadge } from '../../components/AgentStatusBadge';

const ROLE_OPTIONS = ['Commander', 'Researcher', 'Worker', 'Advisor', 'Trader', 'Monitor'];

export default function Settings() {
  const {
    agents,
    addAgent,
    removeAgent,
    updateAgent,
    connectAgent,
    disconnectAgent,
    connectAll,
    disconnectAll,
  } = useAgents();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: 'Worker',
    avatar: '',
    ec2Ip: '',
    ec2User: 'ubuntu',
    pemPath: '',
  });

  const resetForm = () => {
    setForm({ name: '', role: 'Worker', avatar: '', ec2Ip: '', ec2User: 'ubuntu', pemPath: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateAgent(editingId, {
        name: form.name,
        role: form.role,
        avatar: form.avatar || form.name.charAt(0).toUpperCase(),
        ec2Ip: form.ec2Ip,
        ec2User: form.ec2User,
        pemPath: form.pemPath,
      });
    } else {
      await addAgent({
        name: form.name,
        role: form.role,
        avatar: form.avatar || undefined,
        ec2Ip: form.ec2Ip,
        ec2User: form.ec2User,
        pemPath: form.pemPath,
      });
    }
    resetForm();
  };

  const startEdit = (agentId: string) => {
    const agent = agents.find((a) => a.connection.config.id === agentId);
    if (!agent) return;
    const c = agent.connection.config;
    setForm({
      name: c.name,
      role: c.role,
      avatar: c.avatar,
      ec2Ip: c.ec2Ip,
      ec2User: c.ec2User,
      pemPath: c.pemPath,
    });
    setEditingId(agentId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this agent?')) {
      await removeAgent(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={connectAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            Connect All
          </button>
          <button
            onClick={disconnectAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
          >
            Disconnect All
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            + Add Agent
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? 'Edit Agent' : 'Add New Agent'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Agent-Alpha"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avatar (single char/emoji)</label>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="Auto: first letter of name"
                maxLength={2}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">EC2 IP *</label>
              <input
                type="text"
                required
                value={form.ec2Ip}
                onChange={(e) => setForm({ ...form, ec2Ip: e.target.value })}
                placeholder="e.g. 54.123.45.67"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SSH User</label>
              <input
                type="text"
                value={form.ec2User}
                onChange={(e) => setForm({ ...form, ec2User: e.target.value })}
                placeholder="ubuntu"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PEM File Path *</label>
              <input
                type="text"
                required
                value={form.pemPath}
                onChange={(e) => setForm({ ...form, pemPath: e.target.value })}
                placeholder="C:\Users\...\.ssh\key.pem"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingId ? 'Save Changes' : 'Add Agent'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No agents configured yet.</p>
          <p className="text-gray-400">Click &quot;Add Agent&quot; to connect your first OpenClaw instance.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map(({ connection }) => {
            const c = connection.config;
            return (
              <div
                key={c.id}
                className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{c.name}</h3>
                    <span className="text-xs text-gray-400">{c.role}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {c.ec2User}@{c.ec2Ip} &rarr; localhost:{c.localPort}
                  </p>
                  {connection.error && (
                    <p className="text-xs text-red-500 mt-1">{connection.error}</p>
                  )}
                </div>
                <AgentStatusBadge status={connection.status} />
                <div className="flex gap-2">
                  {connection.status === 'disconnected' || connection.status === 'error' ? (
                    <button
                      onClick={() => connectAgent(c.id)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Connect
                    </button>
                  ) : (
                    <button
                      onClick={() => disconnectAgent(c.id)}
                      className="px-3 py-1.5 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      Disconnect
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(c.id)}
                    className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
        <h3 className="font-bold mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Add your EC2 instance details (IP, SSH user, PEM key path)</li>
          <li>Click &quot;Connect&quot; to open an SSH tunnel to the OpenClaw Gateway (port 18789)</li>
          <li>The dashboard will automatically fetch live data via WebSocket</li>
          <li>All pages update in real-time with agent sessions, nodes, and health info</li>
        </ol>
      </div>
    </div>
  );
}
