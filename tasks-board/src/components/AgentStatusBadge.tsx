'use client';

import type { ConnectionStatus } from '../lib/types';

const statusConfig: Record<ConnectionStatus, { color: string; bg: string; label: string }> = {
  disconnected: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Offline' },
  connecting: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Connecting...' },
  tunnel_up: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Tunnel Up' },
  ws_connected: { color: 'text-green-700', bg: 'bg-green-100', label: 'Connected' },
  error: { color: 'text-red-700', bg: 'bg-red-100', label: 'Error' },
};

const dotColor: Record<ConnectionStatus, string> = {
  disconnected: 'bg-gray-400',
  connecting: 'bg-yellow-400',
  tunnel_up: 'bg-yellow-400',
  ws_connected: 'bg-green-500',
  error: 'bg-red-500',
};

interface Props {
  status: ConnectionStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function AgentStatusBadge({ status, showLabel = true, size = 'md' }: Props) {
  const config = statusConfig[status];
  const dot = dotColor[status];

  if (!showLabel) {
    return (
      <span
        className={`inline-block rounded-full ${dot} ${
          size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
        } ${status === 'connecting' || status === 'tunnel_up' ? 'animate-pulse' : ''}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${config.bg} ${config.color} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${dot} ${
          status === 'connecting' || status === 'tunnel_up' ? 'animate-pulse' : ''
        }`}
      />
      {config.label}
    </span>
  );
}
