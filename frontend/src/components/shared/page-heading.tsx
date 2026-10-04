import type { ReactNode } from 'react'
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string
  description: string
  eyebrow?: string
  action?: ReactNode
}) {
  return (
    <Item className="px-0">
      <ItemContent>
        <ItemTitle role="heading" aria-level={1} className="text-2xl font-semibold tracking-tight">
          {title}
        </ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      {action && <ItemActions>{action}</ItemActions>}
    </Item>
  )
}
