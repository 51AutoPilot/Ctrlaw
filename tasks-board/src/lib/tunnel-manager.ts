import type { AgentConfig } from './types';

type TunnelStatus = 'closed' | 'connecting' | 'open' | 'error';

interface TunnelState {
  status: TunnelStatus;
  error?: string;
  childProcess?: unknown;
}

type StatusCallback = (agentId: string, status: TunnelStatus, error?: string) => void;

let Command: typeof import('@tauri-apps/plugin-shell').Command | null = null;

async function loadShellPlugin() {
  if (!Command) {
    try {
      const shell = await import('@tauri-apps/plugin-shell');
      Command = shell.Command;
    } catch {
      console.warn('Tauri Shell plugin not available');
    }
  }
}

const tunnels = new Map<string, TunnelState>();
let statusCallback: StatusCallback | null = null;

export function onTunnelStatus(cb: StatusCallback) {
  statusCallback = cb;
}

function emitStatus(agentId: string, status: TunnelStatus, error?: string) {
  const state = tunnels.get(agentId) || { status: 'closed' };
  state.status = status;
  state.error = error;
  tunnels.set(agentId, state);
  try {
    statusCallback?.(agentId, status, error);
  } catch (e) {
    console.error('Error in tunnel status callback:', e);
  }
}

export async function openTunnel(agent: AgentConfig): Promise<void> {
  await loadShellPlugin();

  if (tunnels.get(agent.id)?.status === 'open') return;

  emitStatus(agent.id, 'connecting');

  if (!Command) {
    // Dev mode fallback — simulate tunnel
    console.warn(`[Dev] Simulating SSH tunnel for ${agent.name} on port ${agent.localPort}`);
    setTimeout(() => emitStatus(agent.id, 'open'), 1000);
    return;
  }

  try {
    const args = [
      '-N',
      '-L', `${agent.localPort}:127.0.0.1:18789`,
      '-i', agent.pemPath,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=30',
      '-o', 'ServerAliveCountMax=3',
      '-o', 'ExitOnForwardFailure=yes',
      `${agent.ec2User}@${agent.ec2Ip}`,
    ];

    const cmd = Command.create('ssh', args);

    cmd.on('error', (error: string) => {
      console.error(`SSH tunnel error for ${agent.name}:`, error);
      emitStatus(agent.id, 'error', error);
    });

    cmd.on('close', (data: { code: number | null }) => {
      if (data.code !== 0) {
        emitStatus(agent.id, 'error', `SSH exited with code ${data.code}`);
      } else {
        emitStatus(agent.id, 'closed');
      }
    });

    cmd.stdout.on('data', (line: string) => {
      console.log(`[SSH ${agent.name}] stdout:`, line);
    });

    cmd.stderr.on('data', (line: string) => {
      console.log(`[SSH ${agent.name}] stderr:`, line);
      // SSH often logs informational messages to stderr
      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('refused')) {
        emitStatus(agent.id, 'error', line);
      }
    });

    const child = await cmd.spawn();
    const state = tunnels.get(agent.id) || { status: 'connecting' };
    state.childProcess = child;
    tunnels.set(agent.id, state);

    // After a brief delay, assume the tunnel is up if no errors
    setTimeout(() => {
      const current = tunnels.get(agent.id);
      if (current && current.status === 'connecting') {
        emitStatus(agent.id, 'open');
      }
    }, 2000);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    emitStatus(agent.id, 'error', msg);
  }
}

export async function closeTunnel(agentId: string): Promise<void> {
  const state = tunnels.get(agentId);
  if (!state?.childProcess) {
    emitStatus(agentId, 'closed');
    return;
  }

  try {
    const child = state.childProcess as { kill: () => Promise<void> };
    await child.kill();
  } catch (e) {
    console.error('Failed to kill SSH process:', e);
  }

  emitStatus(agentId, 'closed');
}

export function getTunnelStatus(agentId: string): TunnelStatus {
  return tunnels.get(agentId)?.status || 'closed';
}

export async function closeAllTunnels(): Promise<void> {
  const ids = Array.from(tunnels.keys());
  await Promise.all(ids.map(closeTunnel));
}
