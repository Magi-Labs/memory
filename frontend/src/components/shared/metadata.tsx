import { Fragment } from 'react'
export function Metadata({
  values,
}: {
  values: [string, string | number | boolean | undefined | null][]
}) {
  return (
    <dl className="metadata">
      {values
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([label, value]) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd>{String(value)}</dd>
          </Fragment>
        ))}
    </dl>
  )
}
