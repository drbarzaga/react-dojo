import { useState, useCallback } from "react"

interface UseListReturn<T> {
  list: T[]
  set: (list: T[]) => void
  push: (...items: T[]) => void
  insert: (index: number, item: T) => void
  update: (index: number, item: T) => void
  remove: (index: number) => void
  filter: (predicate: (item: T, index: number) => boolean) => void
  sort: (compareFn?: (a: T, b: T) => number) => void
  clear: () => void
  reset: () => void
}

export function useList<T>(initialList: T[] = []): UseListReturn<T> {
  const [list, setList] = useState<T[]>(initialList)

  const set = useCallback((newList: T[]) => setList(newList), [])

  const push = useCallback((...items: T[]) => setList((l) => [...l, ...items]), [])

  const insert = useCallback(
    (index: number, item: T) => setList((l) => [...l.slice(0, index), item, ...l.slice(index)]),
    []
  )

  const update = useCallback(
    (index: number, item: T) => setList((l) => l.map((el, i) => (i === index ? item : el))),
    []
  )

  const remove = useCallback((index: number) => setList((l) => l.filter((_, i) => i !== index)), [])

  const filter = useCallback(
    (predicate: (item: T, index: number) => boolean) => setList((l) => l.filter(predicate)),
    []
  )

  const sort = useCallback(
    (compareFn?: (a: T, b: T) => number) => setList((l) => [...l].sort(compareFn)),
    []
  )

  const clear = useCallback(() => setList([]), [])

  const reset = useCallback(() => setList(initialList), [initialList])

  return { list, set, push, insert, update, remove, filter, sort, clear, reset }
}
