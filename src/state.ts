import type { AppState, DirtyFlags } from "./types"

const INITIAL_STATE: AppState = {
  currentTab: "mine",
  prs: [],
  selectedIndex: 0,
  loading: false,
  teams: [],
  error: null,
}

let state: AppState = { ...INITIAL_STATE }
let dirty: DirtyFlags = { tabs: true, list: true }

export function getState(): Readonly<AppState> {
  return state
}

export function getDirty(): Readonly<DirtyFlags> {
  return dirty
}

export function resetDirty(): void {
  dirty = { tabs: false, list: false }
}

export function resetState(): void {
  state = { ...INITIAL_STATE }
}

export function setState(partial: Partial<AppState>, flags: Partial<DirtyFlags> = {}): void {
  state = { ...state, ...partial }
  // Clamp selectedIndex if prs array shrank
  if (state.prs.length === 0) {
    state = { ...state, selectedIndex: 0 }
  } else if (state.selectedIndex >= state.prs.length) {
    state = { ...state, selectedIndex: state.prs.length - 1 }
  }
  dirty = { ...dirty, ...flags }
}
