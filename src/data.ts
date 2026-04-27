import type { PullRequest, Tab } from "./types"

const GH_FIELDS = "number,title,author,repository,isDraft,reviewDecision,updatedAt,url"

export function getQuery(tab: Tab): string {
  switch (tab) {
    case "mine":   return "author:@me is:open is:pr"
    case "review": return "review-requested:@me is:open is:pr"
    case "team":   return ""  // team queries use fetchTeamPRs() directly
  }
}

export function formatRelativeTime(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diffSec < 60)            return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60)            return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24)           return `${diffHour}h ago`
  return `${Math.floor(diffHour / 24)}d ago`
}

export type StatusBadge = "draft" | "approved" | "changes" | "review"

export function getStatusBadge(pr: PullRequest): StatusBadge {
  if (pr.isDraft) return "draft"
  if (pr.reviewDecision === "APPROVED") return "approved"
  if (pr.reviewDecision === "CHANGES_REQUESTED") return "changes"
  return "review"
}

async function runGh(args: string[]): Promise<string> {
  const proc = Bun.spawn(["gh", ...args], { stdout: "pipe", stderr: "pipe" })
  const [stdout, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
  ])
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text()
    throw new Error(stderr.trim() || `gh exited with code ${exitCode}`)
  }
  return stdout
}

export async function fetchPRs(query: string): Promise<PullRequest[]> {
  const output = await runGh([
    "pr", "list",
    "--search", query,
    "--limit", "50",
    "--json", GH_FIELDS,
  ])
  return JSON.parse(output) as PullRequest[]
}

export async function fetchTeamPRs(teams: string[]): Promise<PullRequest[]> {
  if (teams.length === 0) return []
  const results = await Promise.all(
    teams.map(team =>
      fetchPRs(`team-review-requested:${team} is:open is:pr`).catch(() => [] as PullRequest[])
    )
  )
  const seen = new Set<string>()
  return results.flat().filter(pr => {
    if (seen.has(pr.url)) return false
    seen.add(pr.url)
    return true
  })
}

export async function fetchTeams(): Promise<string[]> {
  try {
    const output = await runGh(["api", "/user/teams"])
    const teams = JSON.parse(output) as Array<{ slug: string; organization: { login: string } }>
    return teams.map(t => `${t.organization.login}/${t.slug}`)
  } catch {
    return []
  }
}

export async function openPRInBrowser(pr: PullRequest): Promise<void> {
  const proc = Bun.spawn(
    ["gh", "pr", "view", String(pr.number), "--repo", pr.repository.nameWithOwner, "--web"],
    { stdout: "inherit", stderr: "inherit" },
  )
  await proc.exited
}

export async function checkoutPR(pr: PullRequest): Promise<void> {
  const proc = Bun.spawn(
    ["gh", "pr", "checkout", String(pr.number), "--repo", pr.repository.nameWithOwner],
    { stdout: "inherit", stderr: "inherit" },
  )
  const exitCode = await proc.exited
  if (exitCode !== 0) throw new Error(`gh pr checkout exited with code ${exitCode}`)
}
