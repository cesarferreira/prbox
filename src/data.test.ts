import { describe, it, expect } from "bun:test"
import { getQuery, formatRelativeTime, getStatusBadge } from "./data"
import type { PullRequest } from "./types"

describe("getQuery", () => {
  it("returns author query for mine tab", () => {
    expect(getQuery("mine")).toBe("author:@me is:open is:pr")
  })

  it("returns review-requested query for review tab", () => {
    expect(getQuery("review")).toBe("review-requested:@me is:open is:pr")
  })

  it("returns empty string for team tab (handled by fetchTeamPRs)", () => {
    expect(getQuery("team")).toBe("")
  })
})

describe("formatRelativeTime", () => {
  it("formats seconds as 'just now'", () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe("just now")
  })

  it("formats minutes", () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(past)).toBe("5m ago")
  })

  it("formats hours", () => {
    const past = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(past)).toBe("2h ago")
  })

  it("formats days", () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(past)).toBe("3d ago")
  })
})

describe("getStatusBadge", () => {
  const base: PullRequest = {
    number: 1,
    title: "Test",
    author: { login: "user" },
    isDraft: false,
    reviewDecision: null,
    updatedAt: new Date().toISOString(),
    url: "https://github.com/org/repo/pull/1",
  }

  it("returns 'draft' for draft PRs", () => {
    expect(getStatusBadge({ ...base, isDraft: true })).toBe("draft")
  })

  it("returns 'approved' when reviewDecision is APPROVED", () => {
    expect(getStatusBadge({ ...base, reviewDecision: "APPROVED" })).toBe("approved")
  })

  it("returns 'changes' when reviewDecision is CHANGES_REQUESTED", () => {
    expect(getStatusBadge({ ...base, reviewDecision: "CHANGES_REQUESTED" })).toBe("changes")
  })

  it("returns 'review' for null or REVIEW_REQUIRED", () => {
    expect(getStatusBadge({ ...base, reviewDecision: null })).toBe("review")
    expect(getStatusBadge({ ...base, reviewDecision: "REVIEW_REQUIRED" })).toBe("review")
  })
})
