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
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3 text-sm">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4!" />
        <span className="hidden items-center gap-3 text-muted-foreground sm:flex">
          Personal space <span aria-hidden="true">/</span>
        </span>
        <span id="current-view">{views.find((item) => item.id === view)?.title}</span>
      </div>
      <Button
        id="theme-toggle"
        variant="ghost"
        size="icon"

        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={toggle}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </Button>
    </header>
  )
}
