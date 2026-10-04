import type { SourceDocument } from '@/lib/types'
import { date, sourceName } from '@/lib/format'
import { Icon } from '@/components/shared/icon'
import { Metadata } from '@/components/shared/metadata'

export function DocumentContent({ source }: { source: SourceDocument }) {
  const observed = source.updatedAt || source.createdAt
  const facts = source.memories || []
  return (
    <>
      <p className="document-byline">
        {sourceName(source)}
        {observed && ` · ${date(observed, true)}`}
      </p>
      <p className="document-body">
        {source.content || source.raw || source.summary || 'No source text available.'}
      </p>
      <section className="facts-section">
        <h3>Extracted facts</h3>
        <p className="facts-description">
          {facts.length ? 'From this document' : 'No extracted facts available for this document.'}
        </p>
        {facts.map((fact, index) => (
          <div className="fact" key={fact.id || index}>
            <Icon name="document" />
            <div className="fact-copy">
              {fact.memory}
              <small>
                {fact.isLatest === false ? 'Historical' : 'Current'}
                {fact.isInference && ' · Inferred'} · Version {fact.version || 1}
              </small>
            </div>
          </div>
        ))}
      </section>
      <details className="source-metadata">
        <summary>Document metadata</summary>
        <Metadata
          values={[
            ['Status', source.status],
            ['Created', source.createdAt ? date(source.createdAt) : null],
            ['Document ID', source.id],
          ]}
        />
      </details>
    </>
  )
}
