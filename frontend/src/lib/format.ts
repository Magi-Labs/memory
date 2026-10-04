import type { SearchMatch, SourceDocument } from './types'
export function date(value?: string, short = false) {
  if (!value) return short ? '' : 'Not yet observed'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) return short ? '' : value
  return short
    ? parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : parsed.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
export function sourceName(item: SourceDocument) {
  return item.metadata?.source || 'Personal memory'
}
export function resultText(item: SearchMatch) {
  if (typeof item.memory === 'string') return item.memory
  return (
    item.memory?.memory ||
    (typeof item.chunk === 'string' ? item.chunk : item.chunk?.content) ||
    item.content ||
    item.summary ||
    item.title ||
    'Open to inspect this result'
  )
}
export function excerpt(item: SourceDocument) {
  const text =
    item.summary || item.content || item.title || 'Open to read the source and extracted facts.'
  const title = item.title || ''
  const prefix = title.replace(/(?:\.{3}|…)$/, '')
  if (prefix && text.startsWith(prefix)) {
    const rest = text.slice(prefix.length)
    const preview = prefix !== title ? rest.replace(/^\S*\s*/, '') : rest.trim()
    if (preview) return preview
    return 'Open to read the source and extracted facts.'
  }
  return text
}
export function lines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
