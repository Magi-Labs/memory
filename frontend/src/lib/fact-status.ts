import type { MemoryFact } from './types'

type FactStatus = Pick<MemoryFact, 'isLatest' | 'isForgotten'>

export function isLatestFact(fact: FactStatus) {
  return fact.isLatest === true && fact.isForgotten !== true
}

export function factStatusLabel(fact: FactStatus) {
  if (fact.isForgotten === true) return 'Forgotten'
  if (fact.isLatest === true) return 'Latest version'
  if (fact.isLatest === false) return 'Historical'
  return 'Version status unknown'
}
