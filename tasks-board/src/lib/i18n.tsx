'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Locale = 'en' | 'zh-TW';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.tasks': 'Tasks',
    'nav.calendar': 'Calendar',
    'nav.memory': 'Memory',
    'nav.content': 'Content',
    'nav.team': 'Team',
    'nav.office': 'Office',
    'nav.settings': 'Settings',
    'app.title': 'Ctrlaw - AI Operations System',
    'nav.noAgents': 'No Agents',
    'nav.agentCount': '{connected}/{total} Agents',

    // Home
    'home.title': 'Ctrlaw Dashboard',
    'home.subtitle': 'AI Agent Operations Dashboard',
    'home.agentsOnline': '{count} Agents online',
    'home.allOffline': 'All Agents offline',
    'home.noAgentsConfigured': 'No Agents configured',
    'home.quickStats': 'Quick Stats',
    'home.sessions': 'Sessions',
    'home.active': 'Active',
    'home.connected': 'Connected',
    'home.totalAgents': 'Total Agents',
    'home.agentStatus': 'Agent Status',
    'home.noAgentsYet': 'No Agents configured.',
    'home.addAgent': 'Add Agent',
    'home.sys.taskBoard': 'Task Board',
    'home.sys.taskBoardDesc': 'Track all tasks and statuses',
    'home.sys.calendar': 'Calendar',
    'home.sys.calendarDesc': 'Session activity timeline',
    'home.sys.memory': 'Memory',
    'home.sys.memoryDesc': 'Session conversation history',
    'home.sys.pipeline': 'Content Pipeline',
    'home.sys.pipelineDesc': 'Content creation workflow',
    'home.sys.team': 'Team',
    'home.sys.teamDesc': 'Agent organization',
    'home.sys.office': 'Office',
    'home.sys.officeDesc': 'Real-time Agent status',

    // Tasks
    'tasks.title': 'Task Board',
    'tasks.pending': 'Pending',
    'tasks.inProgress': 'In Progress',
    'tasks.completed': 'Completed',
    'tasks.failed': 'Failed',
    'tasks.sessionCount': '{sessions} Sessions from {agents} Agents',
    'tasks.noSessions': 'Connected to {count} Agents, but no Sessions found.',
    'tasks.placeholder': 'Connect Agents to view real-time Session tasks.',

    // Calendar
    'calendar.title': 'Calendar',
    'calendar.unknown': 'Unknown',
    'calendar.sun': 'Sun',
    'calendar.mon': 'Mon',
    'calendar.tue': 'Tue',
    'calendar.wed': 'Wed',
    'calendar.thu': 'Thu',
    'calendar.fri': 'Fri',
    'calendar.sat': 'Sat',
    'calendar.sessionLog': 'Session Activity Log',
    'calendar.noSessions': 'No Sessions found from connected Agents.',
    'calendar.placeholder': 'Connect Agents to view Session activity timeline.',

    // Memory
    'memory.title': 'Memory',
    'memory.search': 'Search Sessions and conversation history...',
    'memory.loading': 'Loading conversation history...',
    'memory.sessionStatus': 'Session status: {status}',
    'memory.noSessions': 'No Sessions available from connected Agents.',
    'memory.noResults': 'No results match your search.',
    'memory.messageCount': '{count} messages',
    'memory.placeholder': 'Connect Agents to browse Session conversation history.',

    // Content
    'content.title': 'Content Pipeline',
    'content.pending': 'Pending',
    'content.active': 'Active',
    'content.running': 'Running',
    'content.completed': 'Completed',
    'content.failed': 'Failed',
    'content.sessionCount': '{sessions} Sessions from {agents} Agents',
    'content.placeholder': 'Connect Agents to view Sessions flowing through pipeline stages.',

    // Team
    'team.title': 'Team',
    'team.activeSessions': '{count} active Sessions',
    'team.placeholder': 'Add Agents in Settings to view team members.',

    // Office
    'office.title': 'Digital Office',
    'office.activeSessions': '{count} active Sessions',
    'office.uptime': 'Up {minutes} min',
    'office.status': 'Office Status',
    'office.onlineAgents': 'Online Agents: {active}/{total}',
    'office.placeholder': 'Add Agents in Settings to view office view.',

    // Settings
    'settings.title': 'Settings',
    'settings.connectAll': 'Connect All',
    'settings.disconnectAll': 'Disconnect All',
    'settings.addAgent': '+ Add Agent',
    'settings.editAgent': 'Edit Agent',
    'settings.newAgent': 'Add Agent',
    'settings.name': 'Name *',
    'settings.role': 'Role',
    'settings.avatar': 'Avatar (single character or Emoji)',
    'settings.ec2Ip': 'EC2 IP *',
    'settings.sshUser': 'SSH User',
    'settings.pemPath': 'PEM Key Path *',
    'settings.gatewayToken': 'Gateway Token',
    'settings.gatewayTokenPlaceholder': 'OpenClaw Gateway auth token (leave empty to skip)',
    'settings.save': 'Save Changes',
    'settings.cancel': 'Cancel',
    'settings.connect': 'Connect',
    'settings.disconnect': 'Disconnect',
    'settings.edit': 'Edit',
    'settings.remove': 'Remove',
    'settings.confirmRemove': 'Remove this Agent?',
    'settings.noAgents': 'No Agents configured.',
    'settings.noAgentsHint': 'Click "Add Agent" to connect your first OpenClaw instance.',
    'settings.instructions': 'Instructions',
    'settings.inst1': 'Enter your EC2 host info (IP, SSH user, PEM key path)',
    'settings.inst2': 'Click "Connect" to establish an SSH tunnel to OpenClaw Gateway (port 18789)',
    'settings.inst3': 'The dashboard will automatically fetch real-time data via WebSocket',
    'settings.inst4': 'All pages will update live with Agent Sessions, Nodes, and health status',
    'settings.roleCommander': 'Commander',
    'settings.roleResearcher': 'Researcher',
    'settings.roleWorker': 'Worker',
    'settings.roleAdvisor': 'Advisor',
    'settings.roleTrader': 'Trader',
    'settings.roleMonitor': 'Monitor',

    // Status badges
    'status.disconnected': 'Offline',
    'status.connecting': 'Connecting...',
    'status.tunnel_up': 'Tunnel Up',
    'status.ws_connected': 'Connected',
    'status.error': 'Error',

    // NoAgentsPlaceholder
    'placeholder.title': 'No Agents Configured',
    'placeholder.default': 'Connect your OpenClaw Agents to view real-time data on this page.',
    'placeholder.goSettings': 'Go to Settings',
  },
  'zh-TW': {
    // Nav
    'nav.home': '首頁',
    'nav.tasks': '任務',
    'nav.calendar': '行事曆',
    'nav.memory': '記憶',
    'nav.content': '內容',
    'nav.team': '團隊',
    'nav.office': '辦公室',
    'nav.settings': '設定',
    'app.title': 'Ctrlaw - AI 智能作業系統',
    'nav.noAgents': '尚無 Agent',
    'nav.agentCount': '{connected}/{total} 個 Agent',

    // Home
    'home.title': 'Ctrlaw 控制台',
    'home.subtitle': 'AI Agent 作業系統儀表板',
    'home.agentsOnline': '{count} 個 Agent 在線',
    'home.allOffline': '所有 Agent 離線',
    'home.noAgentsConfigured': '尚未設定 Agent',
    'home.quickStats': '快速統計',
    'home.sessions': 'Sessions',
    'home.active': '進行中',
    'home.connected': '已連線',
    'home.totalAgents': 'Agent 總數',
    'home.agentStatus': 'Agent 狀態',
    'home.noAgentsYet': '尚未設定 Agent。',
    'home.addAgent': '新增 Agent',
    'home.sys.taskBoard': '任務看板',
    'home.sys.taskBoardDesc': '追蹤所有任務與狀態',
    'home.sys.calendar': '行事曆',
    'home.sys.calendarDesc': 'Session 活動時間線',
    'home.sys.memory': '記憶庫',
    'home.sys.memoryDesc': 'Session 對話紀錄',
    'home.sys.pipeline': '內容管線',
    'home.sys.pipelineDesc': '內容創作工作流程',
    'home.sys.team': '團隊',
    'home.sys.teamDesc': 'Agent 組織架構',
    'home.sys.office': '辦公室',
    'home.sys.officeDesc': '即時 Agent 狀態',

    // Tasks
    'tasks.title': '任務看板',
    'tasks.pending': '待處理',
    'tasks.inProgress': '進行中',
    'tasks.completed': '已完成',
    'tasks.failed': '失敗',
    'tasks.sessionCount': '來自 {agents} 個 Agent 的 {sessions} 個 Session',
    'tasks.noSessions': '已連接 {count} 個 Agent，但未找到任何 Session。',
    'tasks.placeholder': '連接 Agent 即可查看即時 Session 任務。',

    // Calendar
    'calendar.title': '行事曆',
    'calendar.unknown': '未知',
    'calendar.sun': '日',
    'calendar.mon': '一',
    'calendar.tue': '二',
    'calendar.wed': '三',
    'calendar.thu': '四',
    'calendar.fri': '五',
    'calendar.sat': '六',
    'calendar.sessionLog': 'Session 活動紀錄',
    'calendar.noSessions': '已連線的 Agent 中未找到任何 Session。',
    'calendar.placeholder': '連接 Agent 即可查看 Session 活動時間線。',

    // Memory
    'memory.title': '記憶庫',
    'memory.search': '搜尋 Session 與對話紀錄...',
    'memory.loading': '正在載入對話紀錄...',
    'memory.sessionStatus': 'Session 狀態：{status}',
    'memory.noSessions': '已連線的 Agent 中沒有可用的 Session。',
    'memory.noResults': '沒有符合搜尋條件的結果。',
    'memory.messageCount': '{count} 則訊息',
    'memory.placeholder': '連接 Agent 即可瀏覽 Session 對話紀錄。',

    // Content
    'content.title': '內容管線',
    'content.pending': '待處理',
    'content.active': '進行中',
    'content.running': '執行中',
    'content.completed': '已完成',
    'content.failed': '失敗',
    'content.sessionCount': '來自 {agents} 個 Agent 共 {sessions} 個 Session',
    'content.placeholder': '連接 Agent 即可查看 Session 流經各管線階段。',

    // Team
    'team.title': '團隊',
    'team.activeSessions': '{count} 個進行中的 Session',
    'team.placeholder': '在設定中新增 Agent 即可查看團隊成員。',

    // Office
    'office.title': '數位辦公室',
    'office.activeSessions': '{count} 個進行中的 Session',
    'office.uptime': '運行 {minutes} 分鐘',
    'office.status': '辦公室狀態',
    'office.onlineAgents': '在線 Agent：{active}/{total}',
    'office.placeholder': '在設定中新增 Agent 即可查看辦公室檢視。',

    // Settings
    'settings.title': '設定',
    'settings.connectAll': '全部連線',
    'settings.disconnectAll': '全部斷線',
    'settings.addAgent': '+ 新增 Agent',
    'settings.editAgent': '編輯 Agent',
    'settings.newAgent': '新增 Agent',
    'settings.name': '名稱 *',
    'settings.role': '角色',
    'settings.avatar': '頭像（單一字元或 Emoji）',
    'settings.ec2Ip': 'EC2 IP *',
    'settings.sshUser': 'SSH 使用者',
    'settings.pemPath': 'PEM 金鑰路徑 *',
    'settings.gatewayToken': 'Gateway Token',
    'settings.gatewayTokenPlaceholder': 'OpenClaw Gateway 認證 Token（留空則不驗證）',
    'settings.save': '儲存變更',
    'settings.cancel': '取消',
    'settings.connect': '連線',
    'settings.disconnect': '斷線',
    'settings.edit': '編輯',
    'settings.remove': '移除',
    'settings.confirmRemove': '確定要移除此 Agent？',
    'settings.noAgents': '尚未設定任何 Agent。',
    'settings.noAgentsHint': '點擊「新增 Agent」來連接你的第一個 OpenClaw 實例。',
    'settings.instructions': '使用說明',
    'settings.inst1': '填入你的 EC2 主機資訊（IP、SSH 使用者、PEM 金鑰路徑）',
    'settings.inst2': '點擊「連線」建立 SSH 通道連接 OpenClaw Gateway（port 18789）',
    'settings.inst3': '儀表板將自動透過 WebSocket 取得即時資料',
    'settings.inst4': '所有頁面會即時更新 Agent 的 Sessions、Nodes 及健康狀態',
    'settings.roleCommander': '指揮官',
    'settings.roleResearcher': '研究員',
    'settings.roleWorker': '工作者',
    'settings.roleAdvisor': '顧問',
    'settings.roleTrader': '交易員',
    'settings.roleMonitor': '監控員',

    // Status badges
    'status.disconnected': '離線',
    'status.connecting': '連線中...',
    'status.tunnel_up': '通道已建立',
    'status.ws_connected': '已連線',
    'status.error': '錯誤',

    // NoAgentsPlaceholder
    'placeholder.title': '尚未設定 Agent',
    'placeholder.default': '請先連接你的 OpenClaw Agent，即可在此頁面查看即時資料。',
    'placeholder.goSettings': '前往設定',
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW');

  useEffect(() => {
    const saved = localStorage.getItem('ctrlaw-locale') as Locale | null;
    if (saved && (saved === 'en' || saved === 'zh-TW')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('ctrlaw-locale', l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let str = translations[locale][key] || translations['en'][key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within <I18nProvider>');
  return ctx;
}
