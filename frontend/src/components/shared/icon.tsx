import {
  FileTextIcon,
  GraphIcon,
  ArrowsLeftRightIcon,
  PlugIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  ArrowClockwiseIcon,
  XIcon,
  UserIcon,
  MoonIcon,
  SunIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
const icons = {
  document: FileTextIcon,
  graph: GraphIcon,
  handoff: ArrowsLeftRightIcon,
  plug: PlugIcon,
  external: ArrowUpRightIcon,
  search: MagnifyingGlassIcon,
  refresh: ArrowClockwiseIcon,
  close: XIcon,
  user: UserIcon,
  moon: MoonIcon,
  sun: SunIcon,
}
export function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
  const Component = icons[name]
  return <Component weight="regular" className={cn('icon', className)} aria-hidden="true" />
}
