import { BoxRenderable, TextRenderable, t, fg, bold } from "@opentui/core"
import type { CliRenderer } from "@opentui/core"
import type { Tab } from "../types"

const TAB_DEFS: Array<{ id: Tab; label: string; key: string }> = [
  { id: "mine",   label: "Mine",   key: "1" },
  { id: "review", label: "Review", key: "2" },
  { id: "team",   label: "Team",   key: "3" },
]

const ACTIVE_FG   = "#FFFFFF"
const INACTIVE_FG = "#555555"
const ACTIVE_BG   = "#1F3244"

export interface TabNodes {
  container: BoxRenderable
  tabs: Array<{ box: BoxRenderable; text: TextRenderable; id: Tab }>
}

export function createTabs(renderer: CliRenderer): TabNodes {
  const container = new BoxRenderable(renderer, {
    id: "tabs",
    height: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    paddingLeft: 2,
    paddingTop: 0,
    paddingBottom: 0,
  })

  const tabs = TAB_DEFS.map(def => {
    const box = new BoxRenderable(renderer, {
      id: `tab-${def.id}`,
      paddingLeft: 2,
      paddingRight: 2,
      height: 1,
    })
    const text = new TextRenderable(renderer, {
      id: `tab-text-${def.id}`,
      content: `[${def.key}] ${def.label}`,
      fg: INACTIVE_FG,
    })
    box.add(text)
    container.add(box)
    return { box, text, id: def.id }
  })

  return { container, tabs }
}

export function updateTabs(nodes: TabNodes, currentTab: Tab): void {
  nodes.tabs.forEach(({ box, text, id }, i) => {
    const def = TAB_DEFS[i]
    const isActive = id === currentTab
    box.backgroundColor = isActive ? ACTIVE_BG : undefined
    text.fg = isActive ? ACTIVE_FG : INACTIVE_FG
    text.content = isActive
      ? t`${bold(`[${def.key}] ${def.label}`)}`
      : `[${def.key}] ${def.label}`
  })
}
