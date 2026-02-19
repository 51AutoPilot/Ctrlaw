import type { AgentConfig } from './types';

const CONFIG_FILE = 'agents.json';
const BASE_PORT = 18790;

let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;
let tauriPath: typeof import('@tauri-apps/api/path') | null = null;

async function loadTauriModules() {
  if (!tauriFs) {
    try {
      tauriFs = await import('@tauri-apps/plugin-fs');
      tauriPath = await import('@tauri-apps/api/path');
    } catch {
      // Running outside Tauri (e.g., in browser dev mode)
      console.warn('Tauri FS plugin not available, using localStorage fallback');
    }
  }
}

async function getConfigPath(): Promise<string> {
  await loadTauriModules();
  if (tauriPath) {
    const configDir = await tauriPath.appConfigDir();
    return `${configDir}${CONFIG_FILE}`;
  }
  return CONFIG_FILE;
}

export async function loadAgents(): Promise<AgentConfig[]> {
  await loadTauriModules();

  if (tauriFs) {
    try {
      const path = await getConfigPath();
      const exists = await tauriFs.exists(path);
      if (!exists) return [];
      const content = await tauriFs.readTextFile(path);
      return JSON.parse(content) as AgentConfig[];
    } catch (e) {
      console.error('Failed to load agents config:', e);
      return [];
    }
  }

  // localStorage fallback for dev mode
  try {
    const data = localStorage.getItem('mission-control-agents');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveAgents(agents: AgentConfig[]): Promise<void> {
  await loadTauriModules();

  if (tauriFs && tauriPath) {
    try {
      const configDir = await tauriPath.appConfigDir();
      const dirExists = await tauriFs.exists(configDir);
      if (!dirExists) {
        await tauriFs.mkdir(configDir, { recursive: true });
      }
      const path = await getConfigPath();
      await tauriFs.writeTextFile(path, JSON.stringify(agents, null, 2));
    } catch (e) {
      console.error('Failed to save agents config:', e);
    }
    return;
  }

  // localStorage fallback
  localStorage.setItem('mission-control-agents', JSON.stringify(agents));
}

export function assignPort(agents: AgentConfig[]): number {
  const usedPorts = new Set(agents.map((a) => a.localPort));
  let port = BASE_PORT;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

export function createDefaultAgent(partial: Partial<AgentConfig> & Pick<AgentConfig, 'name' | 'ec2Ip' | 'ec2User' | 'pemPath'>, existingAgents: AgentConfig[]): AgentConfig {
  return {
    id: crypto.randomUUID(),
    role: 'Worker',
    avatar: partial.name.charAt(0).toUpperCase(),
    localPort: assignPort(existingAgents),
    enabled: true,
    ...partial,
  };
}
