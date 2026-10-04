import type { SourceDocument } from '@/lib/types'
import { date, sourceName } from '@/lib/format'
import { factStatusLabel } from '@/lib/fact-status'
import { Metadata } from '@/components/shared/metadata'
import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemDescription, ItemGroup } from '@/components/ui/item'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

export function DocumentContent({ source }: { source: SourceDocument }) {
  const observed = source.updatedAt || source.createdAt
  const facts = source.memories || []
  const originalText = source.content || source.raw
  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        {sourceName(source)}
        {observed && ` · ${date(observed, true)}`}
      </p>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {originalText ? 'Source text' : 'Original source text unavailable'}
          {!originalText && source.summary && ' · Showing a summary'}
        </p>
        <p className="whitespace-pre-wrap break-words text-sm leading-7">
          {originalText || source.summary || 'No source text available.'}
        </p>
      </div>
      <Separator />
      <Accordion type="multiple" defaultValue={['facts']}>
        <AccordionItem value="facts">
          <AccordionTrigger>Extracted facts ({facts.length})</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Latest describes version history, not independently verified truth.
            </p>
            <ItemGroup className="gap-2">
              {facts.map((fact, index) => (
                <Item variant="muted" key={fact.id || index}>
                  <ItemContent>
                    <p className="text-sm leading-6">{fact.memory}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{factStatusLabel(fact)}</Badge>
                      {fact.isInference && <Badge variant="secondary">Inferred</Badge>}
                      <Badge variant="outline">
                        {fact.version == null ? 'Version unknown' : `v${fact.version}`}
                      </Badge>
                    </div>
                  </ItemContent>
                </Item>
              ))}
              {!facts.length && (
                <Item>
                  <ItemContent>
                    <ItemDescription>
                      No extracted facts available for this document.
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )}
            </ItemGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="metadata">
          <AccordionTrigger>Document metadata</AccordionTrigger>
          <AccordionContent>
            <Metadata
              values={[
                ['Status', source.status],
                ['Created', source.createdAt ? date(source.createdAt) : null],
                ['Document ID', source.id],
              ]}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
