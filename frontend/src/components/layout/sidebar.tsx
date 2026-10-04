import type { View } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/shared/icon'
export const views: { id: View; title: string; icon: 'document' | 'graph' | 'handoff' | 'plug' }[] =
  [
    { id: 'memories', title: 'Memories', icon: 'document' },
    { id: 'graph', title: 'Memory graph', icon: 'graph' },
    { id: 'handoffs', title: 'Handoffs', icon: 'handoff' },
    { id: 'connections', title: 'Connections', icon: 'plug' },
  ]
export function Sidebar({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#memories" aria-label="Memory home">
        <img className="brand-mark" src="/assets/memory-mark.png" width={58} height={44} alt="" />
        <span>
          memory<small>by Magi Labs</small>
        </span>
      </a>
      <div className="eyebrow sidebar-label">PERSONAL SPACE</div>
      <nav aria-label="Main navigation">
        {views.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`nav${view === item.id ? ' active' : ''}`}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} />
            {item.title}
          </Button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-identity">
          <Icon name="user" />
          <div>
            Personal workspace<small>Self hosted</small>
          </div>
        </div>
        <a href="https://github.com/Magi-Labs/memory" target="_blank" rel="noopener noreferrer">
          Project & research <Icon name="external" />
        </a>
      </div>
    </aside>
  )
}
