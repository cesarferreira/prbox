export type Tab = "mine" | "review" | "team"

export interface PullRequest {
  number: number
  title: string
  author: { login: string }
  isDraft: boolean
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | "" | null
  updatedAt: string
  url: string
}

export interface AppState {
  currentTab: Tab
  prs: PullRequest[]
  selectedIndex: number
  loading: boolean
  teams: string[]        // ["org/team-slug", ...]
  error: string | null
}

export interface DirtyFlags {
  tabs: boolean
  list: boolean
}

export interface Config {
  refresh_interval: number  // seconds
}
