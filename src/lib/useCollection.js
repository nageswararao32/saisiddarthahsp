import { useCallback, useEffect, useState } from 'react'
import { readAll, writeAll, subscribe } from './storage'

// Generic CRUD hook over a localStorage-backed collection.
export function useCollection(collection, fallback = []) {
  const [rows, setRows] = useState(() => readAll(collection, fallback))

  useEffect(() => subscribe(collection, () => setRows(readAll(collection, fallback))), [collection])

  const create = useCallback(
    (record) => {
      const current = readAll(collection, fallback)
      const updated = [...current, record]
      writeAll(collection, updated)
      return record
    },
    [collection]
  )

  const update = useCallback(
    (id, patch) => {
      const current = readAll(collection, fallback)
      const updated = current.map((r) => (r.id === id ? { ...r, ...patch } : r))
      writeAll(collection, updated)
    },
    [collection]
  )

  const remove = useCallback(
    (id) => {
      const current = readAll(collection, fallback)
      writeAll(
        collection,
        current.filter((r) => r.id !== id)
      )
    },
    [collection]
  )

  const replaceAll = useCallback(
    (data) => {
      writeAll(collection, data)
    },
    [collection]
  )

  return { rows, create, update, remove, replaceAll }
}

// Generic hook for a single-object (non-list) record, e.g. credit policy settings.
export function useRecord(collection, fallback = {}) {
  const [value, setValue] = useState(() => readAll(collection, fallback))

  useEffect(() => subscribe(collection, () => setValue(readAll(collection, fallback))), [collection])

  const save = useCallback(
    (patch) => {
      const current = readAll(collection, fallback)
      const updated = { ...current, ...patch }
      writeAll(collection, updated)
    },
    [collection]
  )

  return [value, save]
}
