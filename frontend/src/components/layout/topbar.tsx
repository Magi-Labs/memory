import type { View } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Icon } from '@/components/shared/icon'
import { useTheme } from '@/hooks/use-theme'
import { views } from './sidebar'

export function Topbar({ view }: { view: View }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="topbar">
      <div className="topbar-path">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4!" />
        <span className="breadcrumb-parent">
          Personal space <span aria-hidden="true">/</span>
        </span>
        <span id="current-view">{views.find((item) => item.id === view)?.title}</span>
      </div>
      <Button
        id="theme-toggle"
        variant="ghost"
        size="icon"
        className="theme-toggle"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={toggle}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </Button>
    </header>
  )
}
