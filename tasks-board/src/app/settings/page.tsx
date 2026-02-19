'use client';

import { useState } from 'react';
import { useAgents } from '../../lib/agent-context';
import { AgentStatusBadge } from '../../components/AgentStatusBadge';

const ROLE_OPTIONS = ['指揮官', '研究員', '工作者', '顧問', '交易員', '監控員'];

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
    role: '工作者',
    avatar: '',
    ec2Ip: '',
    ec2User: 'ubuntu',
    pemPath: '',
  });

  const resetForm = () => {
    setForm({ name: '', role: '工作者', avatar: '', ec2Ip: '', ec2User: 'ubuntu', pemPath: '' });
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
    if (confirm('確定要移除此 Agent？')) {
      await removeAgent(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">設定</h1>
        <div className="flex gap-2">
          <button
            onClick={connectAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            全部連線
          </button>
          <button
            onClick={disconnectAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
          >
            全部斷線
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            + 新增 Agent
          </button>
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? '編輯 Agent' : '新增 Agent'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">名稱 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：Agent-Alpha"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">角色</label>
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
              <label className="block text-sm font-medium mb-1">頭像（單一字元或 Emoji）</label>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="預設：名稱首字母"
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
                placeholder="例如：54.123.45.67"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SSH 使用者</label>
              <input
                type="text"
                value={form.ec2User}
                onChange={(e) => setForm({ ...form, ec2User: e.target.value })}
                placeholder="ubuntu"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PEM 金鑰路徑 *</label>
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
                {editingId ? '儲存變更' : '新增 Agent'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agent 列表 */}
      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">尚未設定任何 Agent。</p>
          <p className="text-gray-400">點擊「新增 Agent」來連接你的第一個 OpenClaw 實例。</p>
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
                      連線
                    </button>
                  ) : (
                    <button
                      onClick={() => disconnectAgent(c.id)}
                      className="px-3 py-1.5 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      斷線
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(c.id)}
                    className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    移除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 說明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
        <h3 className="font-bold mb-2">使用說明</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>填入你的 EC2 主機資訊（IP、SSH 使用者、PEM 金鑰路徑）</li>
          <li>點擊「連線」建立 SSH 通道連接 OpenClaw Gateway（port 18789）</li>
          <li>儀表板將自動透過 WebSocket 取得即時資料</li>
          <li>所有頁面會即時更新 Agent 的 Sessions、Nodes 及健康狀態</li>
        </ol>
      </div>
    </div>
  );
}
