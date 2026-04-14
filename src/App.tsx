import { useState, useEffect } from 'react';
import CanvasPage from './pages/CanvasPage';
import ComponentsPage from './pages/ComponentsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import LoginPage from './pages/LoginPage';
import { isAuthenticated, setAuth, clearAuth, getApiKey } from './hooks/useAuth';
import { setApiKey, logAction } from './api';

type Page = 'canvas' | 'components' | 'workflows';

const VERSION = '0.1.0';

// 動態載入 Web Components（導覽列用）
if (typeof window !== 'undefined') {
  void import(/* @vite-ignore */ '@u6u-wc/u6u-btn').catch(() => {});
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [page, setPage] = useState<Page>('canvas');
  const [canvasWorkflowId, setCanvasWorkflowId] = useState<string | undefined>();

  // 初始化：若已有 sessionStorage key 則注入 api module
  useEffect(() => {
    const key = getApiKey();
    if (key) setApiKey(key);
  }, []);

  const handleLogin = (apiKey: string, orgNamespace: string) => {
    setAuth(apiKey, orgNamespace);
    setApiKey(apiKey);
    setAuthed(true);
    logAction('NAVIGATE', { page: 'canvas' });
  };

  const handleLogout = () => {
    clearAuth();
    setApiKey('');
    setAuthed(false);
    setPage('canvas');
    setCanvasWorkflowId(undefined);
  };

  const handleEditWorkflow = (id: string) => {
    setCanvasWorkflowId(id);
    setPage('canvas');
  };

  const handleNavClick = (p: Page) => {
    setPage(p);
    if (p !== 'canvas') setCanvasWorkflowId(undefined);
    logAction('NAVIGATE', { page: p });
  };

  if (!authed) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navItems: { id: Page; label: string }[] = [
    { id: 'canvas', label: '畫布' },
    { id: 'components', label: '零件庫' },
    { id: 'workflows', label: 'Workflow' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0f0f', color: '#e4e4e7' }}>
      {/* 頂部導覽列 */}
      <header
        className="h-12 flex items-center px-6 gap-6 border-b flex-shrink-0"
        style={{ borderColor: '#27272a' }}
      >
        {/* Logo */}
        <span className="text-base font-bold tracking-tight" style={{ color: '#a78bfa' }}>
          u6u
        </span>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                background: page === item.id ? '#27272a' : 'transparent',
                color: page === item.id ? '#f4f4f5' : '#71717a',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 右側：版本號 + 登出 */}
        <span className="text-xs" style={{ color: '#52525b' }}>v{VERSION}</span>
        <button
          onClick={handleLogout}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{ color: '#52525b', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
        >
          登出
        </button>
      </header>

      {/* 主內容 */}
      <main className="flex-1 overflow-auto px-6 py-6 max-w-6xl w-full mx-auto">
        {page === 'canvas' && (
          <CanvasPage key={canvasWorkflowId} initialWorkflowId={canvasWorkflowId} />
        )}
        {page === 'components' && <ComponentsPage />}
        {page === 'workflows' && <WorkflowsPage onEditWorkflow={handleEditWorkflow} />}
      </main>
    </div>
  );
}
