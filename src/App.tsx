import { useState } from 'react';
import CanvasPage from './pages/CanvasPage';
import ComponentsPage from './pages/ComponentsPage';
import WorkflowsPage from './pages/WorkflowsPage';

type Page = 'canvas' | 'components' | 'workflows';

const VERSION = '0.1.0';

export default function App() {
  const [page, setPage] = useState<Page>('canvas');
  const [canvasWorkflowId, setCanvasWorkflowId] = useState<string | undefined>();

  const handleEditWorkflow = (id: string) => {
    setCanvasWorkflowId(id);
    setPage('canvas');
  };

  const handleNavClick = (p: Page) => {
    setPage(p);
    if (p !== 'canvas') setCanvasWorkflowId(undefined);
  };

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
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 版本號 */}
        <span className="text-xs" style={{ color: '#52525b' }}>
          v{VERSION}
        </span>
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
