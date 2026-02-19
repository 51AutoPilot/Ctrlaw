'use client';

import type { ConnectionStatus } from '../lib/types';
import { useT } from '../lib/i18n';

const statusStyle: Record<ConnectionStatus, { color: string; bg: string }> = {
  disconnected: { color: 'text-gray-600', bg: 'bg-gray-100' },
  connecting: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  tunnel_up: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  ws_connected: { color: 'text-green-700', bg: 'bg-green-100' },
  error: { color: 'text-red-700', bg: 'bg-red-100' },
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
  const { t } = useT();
  const style = statusStyle[status];
  const dot = dotColor[status];
  const label = t(`status.${status}`);

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
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${style.bg} ${style.color} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${dot} ${
          status === 'connecting' || status === 'tunnel_up' ? 'animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  );
}
