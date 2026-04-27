import { BoxRenderable, TextRenderable, t, fg, bold, dim } from "@opentui/core"
import type { CliRenderer } from "@opentui/core"
import type { AppState, PullRequest } from "../types"
import { getStatusBadge, formatRelativeTime } from "../data"

const MAX_ROWS    = 50
const SELECTED_BG = "#1F3244"

const BADGE_FG: Record<string, string> = {
  draft:    "#888888",
  review:   "#E3B341",
  approved: "#57AB5A",
  changes:  "#E5534B",
}

export interface ListNodes {
  container: BoxRenderable
  rows: Array<{ box: BoxRenderable; text: TextRenderable }>
  message: TextRenderable
}

export function createList(renderer: CliRenderer): ListNodes {
  const container = new BoxRenderable(renderer, {
    id: "list",
    flexGrow: 1,
    width: "100%",
    flexDirection: "column",
  })

  // Pre-allocate MAX_ROWS row slots (shown/hidden via height)
  const rows: ListNodes["rows"] = []
  for (let i = 0; i < MAX_ROWS; i++) {
    const box = new BoxRenderable(renderer, {
      id: `row-${i}`,
      height: 0,
      width: "100%",
      paddingLeft: 1,
      paddingRight: 1,
    })
    const text = new TextRenderable(renderer, {
      id: `row-text-${i}`,
      content: "",
      width: "100%",
    })
    box.add(text)
    container.add(box)
    rows.push({ box, text })
  }

  // Single message node for loading / error / empty states
  const message = new TextRenderable(renderer, {
    id: "list-message",
    content: "",
    paddingLeft: 2,
    paddingTop: 1,
  })
  container.add(message)

  return { container, rows, message }
}

function formatRow(pr: PullRequest, termWidth: number): ReturnType<typeof t> | string {
  const badge      = getStatusBadge(pr)
  const badgeFg    = BADGE_FG[badge] ?? "#888888"
  const repo       = pr.repository.nameWithOwner
  const num        = `#${pr.number}`
  const author     = pr.author.login
  const time       = formatRelativeTime(pr.updatedAt)
  const badgeStr   = `[${badge}]`

  // Fixed-width portions: repo(+2) + num(+2) + author(+2) + time(+2) + badge(+2) + padding
  const fixedLen   = repo.length + num.length + author.length + time.length + badgeStr.length + 12
  const titleWidth = Math.max(8, termWidth - fixedLen)
  const title      = pr.title.length > titleWidth
    ? pr.title.slice(0, titleWidth - 1) + "…"
    : pr.title.padEnd(titleWidth)

  return t`${fg("#7DCFFF")(repo)}  ${fg("#555555")(num)}  ${title}  ${dim(author)}  ${dim(time)}  ${fg(badgeFg)(badgeStr)}`
}

export function updateList(nodes: ListNodes, state: AppState, termWidth: number): void {
  const { prs, loading, error, selectedIndex } = state

  // Update message row
  if (loading) {
    nodes.message.content = t`${fg("#E3B341")("Loading…")}`
  } else if (error) {
    nodes.message.content = t`${fg("#E5534B")(`Error: ${error}`)}`
  } else if (prs.length === 0) {
    nodes.message.content = t`${fg("#555555")("No pull requests")}`
  } else {
    nodes.message.content = ""
  }

  // Update PR row slots
  nodes.rows.forEach(({ box, text }, i) => {
    const visible = i < prs.length && !loading && !error
    box.height = visible ? 1 : 0
    if (visible) {
      box.backgroundColor = i === selectedIndex ? SELECTED_BG : undefined
      text.content = formatRow(prs[i], termWidth)
    } else {
      box.backgroundColor = undefined
      text.content = ""
    }
  })
}
