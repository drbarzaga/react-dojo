import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useList } from "../use-list.fn"

describe("useList", () => {
  it("initializes with empty array by default", () => {
    const { result } = renderHook(() => useList())
    expect(result.current.list).toEqual([])
  })

  it("initializes with the provided list", () => {
    const { result } = renderHook(() => useList([1, 2, 3]))
    expect(result.current.list).toEqual([1, 2, 3])
  })

  it("push adds items to the end", () => {
    const { result } = renderHook(() => useList([1, 2]))
    act(() => result.current.push(3, 4))
    expect(result.current.list).toEqual([1, 2, 3, 4])
  })

  it("insert adds an item at the given index", () => {
    const { result } = renderHook(() => useList([1, 3]))
    act(() => result.current.insert(1, 2))
    expect(result.current.list).toEqual([1, 2, 3])
  })

  it("update replaces the item at the given index", () => {
    const { result } = renderHook(() => useList([1, 2, 3]))
    act(() => result.current.update(1, 99))
    expect(result.current.list).toEqual([1, 99, 3])
  })

  it("remove deletes the item at the given index", () => {
    const { result } = renderHook(() => useList([1, 2, 3]))
    act(() => result.current.remove(1))
    expect(result.current.list).toEqual([1, 3])
  })

  it("filter keeps only matching items", () => {
    const { result } = renderHook(() => useList([1, 2, 3, 4, 5]))
    act(() => result.current.filter((n) => n % 2 === 0))
    expect(result.current.list).toEqual([2, 4])
  })

  it("sort orders items with a comparator", () => {
    const { result } = renderHook(() => useList([3, 1, 2]))
    act(() => result.current.sort((a, b) => a - b))
    expect(result.current.list).toEqual([1, 2, 3])
  })

  it("sort does not mutate the original array", () => {
    const initial = [3, 1, 2]
    const { result } = renderHook(() => useList(initial))
    act(() => result.current.sort((a, b) => a - b))
    expect(initial).toEqual([3, 1, 2])
  })

  it("clear empties the list", () => {
    const { result } = renderHook(() => useList([1, 2, 3]))
    act(() => result.current.clear())
    expect(result.current.list).toEqual([])
  })

  it("reset restores the initial list", () => {
    const { result } = renderHook(() => useList([1, 2, 3]))
    act(() => result.current.push(4))
    act(() => result.current.reset())
    expect(result.current.list).toEqual([1, 2, 3])
  })

  it("set replaces the entire list", () => {
    const { result } = renderHook(() => useList([1, 2, 3]))
    act(() => result.current.set([10, 20]))
    expect(result.current.list).toEqual([10, 20])
  })
})
