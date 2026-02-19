import type { AgentConfig } from './types';

const CONFIG_FILE = 'agents.json';
const BASE_PORT = 18790;
const LS_KEY = 'mission-control-agents';

let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;
let BaseDir: typeof import('@tauri-apps/api/path').BaseDirectory | null = null;

async function loadTauriModules() {
  if (!tauriFs) {
    try {
      tauriFs = await import('@tauri-apps/plugin-fs');
      const pathMod = await import('@tauri-apps/api/path');
      BaseDir = pathMod.BaseDirectory;
    } catch {
      console.warn('Tauri FS plugin not available, using localStorage fallback');
    }
  }
}

export async function loadAgents(): Promise<AgentConfig[]> {
  await loadTauriModules();

  // Try Tauri FS first (persists across app restarts)
  if (tauriFs && BaseDir) {
    try {
      const fileExists = await tauriFs.exists(CONFIG_FILE, { baseDir: BaseDir.AppConfig });
      if (fileExists) {
        const content = await tauriFs.readTextFile(CONFIG_FILE, { baseDir: BaseDir.AppConfig });
        const agents = JSON.parse(content) as AgentConfig[];
        // Sync to localStorage as backup
        try { localStorage.setItem(LS_KEY, content); } catch {}
        return agents;
      }
    } catch (e) {
      console.error('Failed to load agents from Tauri FS:', e);
    }
  }

  // localStorage fallback
  try {
    const data = localStorage.getItem(LS_KEY);
    if (data) {
      const agents = JSON.parse(data) as AgentConfig[];
      // Try to migrate localStorage data to Tauri FS
      if (tauriFs && BaseDir && agents.length > 0) {
        saveTauriFs(agents).catch(() => {});
      }
      return agents;
    }
  } catch {}

  return [];
}

async function saveTauriFs(agents: AgentConfig[]): Promise<void> {
  if (!tauriFs || !BaseDir) return;
  try {
    // Ensure AppConfig directory exists
    const dirExists = await tauriFs.exists('', { baseDir: BaseDir.AppConfig });
    if (!dirExists) {
      await tauriFs.mkdir('', { baseDir: BaseDir.AppConfig, recursive: true });
    }
  } catch {
    // Directory might already exist, continue
  }
  await tauriFs.writeTextFile(CONFIG_FILE, JSON.stringify(agents, null, 2), {
    baseDir: BaseDir.AppConfig,
  });
}

export async function saveAgents(agents: AgentConfig[]): Promise<void> {
  await loadTauriModules();

  const json = JSON.stringify(agents, null, 2);

  // Always save to localStorage as backup
  try {
    localStorage.setItem(LS_KEY, json);
  } catch {}

  // Save to Tauri FS (persistent file)
  if (tauriFs && BaseDir) {
    try {
      await saveTauriFs(agents);
    } catch (e) {
      console.error('Failed to save agents to Tauri FS:', e);
    }
  }
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
    gatewayToken: '',
    localPort: assignPort(existingAgents),
    enabled: true,
    ...partial,
  };
}
