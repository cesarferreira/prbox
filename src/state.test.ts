import { describe, it, expect, beforeEach } from "bun:test"
import { getState, setState, getDirty, resetDirty, resetState } from "./state"

describe("state", () => {
  beforeEach(() => {
    resetState()
    resetDirty()
  })

  it("has correct initial values", () => {
    const s = getState()
    expect(s.currentTab).toBe("mine")
    expect(s.prs).toEqual([])
    expect(s.selectedIndex).toBe(0)
    expect(s.loading).toBe(false)
    expect(s.error).toBeNull()
  })

  it("setState merges partial updates without clobbering other fields", () => {
    setState({ loading: true })
    expect(getState().loading).toBe(true)
    expect(getState().currentTab).toBe("mine")
  })

  it("setState sets dirty flags", () => {
    setState({ currentTab: "review" }, { tabs: true })
    expect(getDirty().tabs).toBe(true)
    expect(getDirty().list).toBe(false)
  })

  it("resetDirty clears all flags", () => {
    setState({}, { tabs: true, list: true })
    resetDirty()
    expect(getDirty().tabs).toBe(false)
    expect(getDirty().list).toBe(false)
  })

  it("clamps selectedIndex when prs array shrinks", () => {
    setState({ prs: [{} as any, {} as any, {} as any], selectedIndex: 2 })
    setState({ prs: [{} as any] })
    expect(getState().selectedIndex).toBe(0)
  })

  it("resets selectedIndex to 0 when prs becomes empty", () => {
    setState({ prs: [{} as any], selectedIndex: 0 })
    setState({ prs: [] })
    expect(getState().selectedIndex).toBe(0)
  })
})
