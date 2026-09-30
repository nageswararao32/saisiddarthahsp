// Lightweight localStorage-backed persistence layer.
// Stands in for a real backend so every module supports full CRUD.

const NS = 'HMS'

function key(collection) {
  return `${NS}:${collection}`
}

export function readAll(collection, fallback = []) {
  try {
    const raw = localStorage.getItem(key(collection))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeAll(collection, data) {
  localStorage.setItem(key(collection), JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('HMS:change', { detail: { collection } }))
  return data
}

export function seedOnce(collection, seedData) {
  const raw = localStorage.getItem(key(collection))
  if (raw === null) {
    localStorage.setItem(key(collection), JSON.stringify(seedData))
  }
}

export function nextId(prefix, existing) {
  const nums = existing
    .map((r) => Number(String(r.id).split('-').pop()))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 1000
  return `${prefix}-${max + 1}`
}

export function subscribe(collection, handler) {
  const listener = (e) => {
    if (!collection || e.detail?.collection === collection) handler()
  }
  window.addEventListener('HMS:change', listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener('HMS:change', listener)
    window.removeEventListener('storage', listener)
  }
}
