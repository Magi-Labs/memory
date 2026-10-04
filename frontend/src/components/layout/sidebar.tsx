// Adapted from shadcn/ui dashboard-01. See frontend/licenses/shadcn-ui-MIT.txt.
import type { View } from '@/lib/types'
import { Icon } from '@/components/shared/icon'
import {
  Sidebar as SidebarPanel,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'

export const views: { id: View; title: string; icon: 'document' | 'graph' | 'handoff' | 'plug' }[] =
  [
    { id: 'memories', title: 'Memories', icon: 'document' },
    { id: 'graph', title: 'Memory graph', icon: 'graph' },
    { id: 'handoffs', title: 'Handoffs', icon: 'handoff' },
    { id: 'connections', title: 'Connections', icon: 'plug' },
  ]

export function Sidebar({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  const { setOpenMobile } = useSidebar()
  const navigate = (target: View) => {
    onNavigate(target)
    setOpenMobile(false)
  }
  return (
    <SidebarPanel variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="memory-brand" tooltip="Memory home">
              <a href="#memories" onClick={() => navigate('memories')} aria-label="Memory home">
                <img
                  className="brand-mark"
                  src="/assets/memory-mark.png"
                  width={32}
                  height={32}
                  alt=""
                />
                <span className="brand-copy">
                  memory<small>by Magi Labs</small>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <nav aria-label="Main navigation">
            <SidebarMenu>
              {views.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={view === item.id}
                    aria-current={view === item.id ? 'page' : undefined}
                    onClick={() => navigate(item.id)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Project & research">
                <a
                  href="https://github.com/Magi-Labs/memory"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="external" />
                  <span>Project & research</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="workspace-account">
          <div className="workspace-avatar">
            <Icon name="user" />
          </div>
          <div className="workspace-copy">
            Personal workspace<small>Self hosted · One owner</small>
          </div>
        </div>
      </SidebarFooter>
    </SidebarPanel>
  )
}
