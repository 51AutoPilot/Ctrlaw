'use client';

import { useState } from 'react';
import { useAgents } from '../../lib/agent-context';
import { AgentStatusBadge } from '../../components/AgentStatusBadge';
import { useT } from '../../lib/i18n';

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
  const { t } = useT();

  const ROLE_OPTIONS = [
    { value: 'Commander', label: t('settings.roleCommander') },
    { value: 'Researcher', label: t('settings.roleResearcher') },
    { value: 'Worker', label: t('settings.roleWorker') },
    { value: 'Advisor', label: t('settings.roleAdvisor') },
    { value: 'Trader', label: t('settings.roleTrader') },
    { value: 'Monitor', label: t('settings.roleMonitor') },
  ];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: 'Worker',
    avatar: '',
    ec2Ip: '',
    ec2User: 'ubuntu',
    pemPath: '',
    gatewayToken: '',
  });

  const resetForm = () => {
    setForm({ name: '', role: 'Worker', avatar: '', ec2Ip: '', ec2User: 'ubuntu', pemPath: '', gatewayToken: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === form.role)?.label || form.role;
    if (editingId) {
      await updateAgent(editingId, {
        name: form.name,
        role: roleLabel,
        avatar: form.avatar || form.name.charAt(0).toUpperCase(),
        ec2Ip: form.ec2Ip,
        ec2User: form.ec2User,
        pemPath: form.pemPath,
        gatewayToken: form.gatewayToken,
      });
    } else {
      await addAgent({
        name: form.name,
        role: roleLabel,
        avatar: form.avatar || undefined,
        ec2Ip: form.ec2Ip,
        ec2User: form.ec2User,
        pemPath: form.pemPath,
        gatewayToken: form.gatewayToken,
      });
    }
    resetForm();
  };

  const startEdit = (agentId: string) => {
    const agent = agents.find((a) => a.connection.config.id === agentId);
    if (!agent) return;
    const c = agent.connection.config;
    const roleValue = ROLE_OPTIONS.find((r) => r.label === c.role)?.value || c.role;
    setForm({
      name: c.name,
      role: roleValue,
      avatar: c.avatar,
      ec2Ip: c.ec2Ip,
      ec2User: c.ec2User,
      pemPath: c.pemPath,
      gatewayToken: c.gatewayToken || '',
    });
    setEditingId(agentId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('settings.confirmRemove'))) {
      await removeAgent(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={connectAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            {t('settings.connectAll')}
          </button>
          <button
            onClick={disconnectAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
          >
            {t('settings.disconnectAll')}
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            {t('settings.addAgent')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? t('settings.editAgent') : t('settings.newAgent')}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.name')}</label>
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
              <label className="block text-sm font-medium mb-1">{t('settings.role')}</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.avatar')}</label>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="A"
                maxLength={2}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.ec2Ip')}</label>
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
              <label className="block text-sm font-medium mb-1">{t('settings.sshUser')}</label>
              <input
                type="text"
                value={form.ec2User}
                onChange={(e) => setForm({ ...form, ec2User: e.target.value })}
                placeholder="ubuntu"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.pemPath')}</label>
              <input
                type="text"
                required
                value={form.pemPath}
                onChange={(e) => setForm({ ...form, pemPath: e.target.value })}
                placeholder="C:\Users\...\.ssh\key.pem"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">{t('settings.gatewayToken')}</label>
              <input
                type="text"
                value={form.gatewayToken}
                onChange={(e) => setForm({ ...form, gatewayToken: e.target.value })}
                placeholder={t('settings.gatewayTokenPlaceholder')}
                className="w-full p-2 border rounded-lg font-mono text-sm"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingId ? t('settings.save') : t('settings.newAgent')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t('settings.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">{t('settings.noAgents')}</p>
          <p className="text-gray-400">{t('settings.noAgentsHint')}</p>
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
                      {t('settings.connect')}
                    </button>
                  ) : (
                    <button
                      onClick={() => disconnectAgent(c.id)}
                      className="px-3 py-1.5 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      {t('settings.disconnect')}
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(c.id)}
                    className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    {t('settings.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    {t('settings.remove')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
        <h3 className="font-bold mb-2">{t('settings.instructions')}</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>{t('settings.inst1')}</li>
          <li>{t('settings.inst2')}</li>
          <li>{t('settings.inst3')}</li>
          <li>{t('settings.inst4')}</li>
        </ol>
      </div>
    </div>
  );
}
