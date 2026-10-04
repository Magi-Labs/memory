import type { View } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/shared/icon'
import { useTheme } from '@/hooks/use-theme'
import { views } from './sidebar'
export function Topbar({ view }: { view: View }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="topbar">
      <span>
        Personal space{' '}
        <span className="breadcrumb-divider" aria-hidden="true">
          /
        </span>{' '}
        <span id="current-view">{views.find((item) => item.id === view)?.title}</span>
      </span>
      <Button
        id="theme-toggle"
        variant="outline"
        className="theme-toggle"
        aria-pressed={theme === 'dark'}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={toggle}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        <span>Dark mode</span>
      </Button>
    </header>
  )
}
