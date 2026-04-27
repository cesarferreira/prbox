import { createCliRenderer, BoxRenderable, TextRenderable, t, fg, bold } from "@opentui/core"
import { loadConfig } from "./config"
import { fetchPRs, fetchTeamPRs, fetchTeams, openPRInBrowser, checkoutPR } from "./data"
import { getState, setState, getDirty, resetDirty } from "./state"
import { createTabs, updateTabs } from "./ui/tabs"
import { createList, updateList } from "./ui/list"
import { createFooter } from "./ui/footer"
import type { Tab } from "./types"

// ─── Config & Renderer ────────────────────────────────────────────────────────

const config = loadConfig()

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  screenMode: "alternate-screen",
  useMouse: false,
})

renderer.setTerminalTitle("prbox")

// ─── Layout ───────────────────────────────────────────────────────────────────

const rootBox = new BoxRenderable(renderer, {
  id: "root",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  backgroundColor: "#0D1117",
})
renderer.root.add(rootBox)

// Header bar
const headerBox = new BoxRenderable(renderer, {
  id: "header",
  height: 1,
  width: "100%",
  paddingLeft: 2,
  backgroundColor: "#161B22",
  flexDirection: "row",
  alignItems: "center",
})
const headerText = new TextRenderable(renderer, {
  id: "header-text",
  content: t`${bold(fg("#7DCFFF")("prbox"))}  ${fg("#333333")("your PR inbox")}`,
})
headerBox.add(headerText)

const tabNodes  = createTabs(renderer)
const listNodes = createList(renderer)
const footer    = createFooter(renderer)

rootBox.add(headerBox)
rootBox.add(tabNodes.container)
rootBox.add(listNodes.container)
rootBox.add(footer)

// ─── Render ───────────────────────────────────────────────────────────────────

function render(): void {
  const state = getState()
  const d     = getDirty()
  if (d.tabs) updateTabs(tabNodes, state.currentTab)
  if (d.list) updateList(listNodes, state, renderer.width)
  resetDirty()
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function loadTab(tab: Tab): Promise<void> {
  setState({ loading: true, error: null }, { list: true })
  render()
  try {
    const prs = tab === "team"
      ? await fetchTeamPRs(getState().teams)
      : await fetchPRs(tab === "mine"
          ? "author:@me is:open is:pr"
          : "review-requested:@me is:open is:pr")
    setState({ prs, loading: false, selectedIndex: 0 }, { list: true })
  } catch (err) {
    setState(
      { loading: false, error: err instanceof Error ? err.message : String(err) },
      { list: true },
    )
  }
  render()
}

// ─── Keyboard ────────────────────────────────────────────────────────────────

renderer.keyInput.on("keypress", async key => {
  const state = getState()

  // Ctrl+C — quit
  if (key.ctrl && key.name === "c") {
    renderer.destroy()
    process.exit(0)
  }

  switch (key.name) {
    case "q":
      renderer.destroy()
      process.exit(0)
      break

    // Movement
    case "j":
    case "down": {
      const next = Math.min(state.selectedIndex + 1, state.prs.length - 1)
      if (next !== state.selectedIndex) { setState({ selectedIndex: next }, { list: true }); render() }
      break
    }
    case "k":
    case "up": {
      const prev = Math.max(state.selectedIndex - 1, 0)
      if (prev !== state.selectedIndex) { setState({ selectedIndex: prev }, { list: true }); render() }
      break
    }
    case "g":
      setState({ selectedIndex: 0 }, { list: true }); render()
      break
    case "G":
      setState({ selectedIndex: Math.max(0, state.prs.length - 1) }, { list: true }); render()
      break

    // Tab switching
    case "1":
      if (state.currentTab !== "mine") {
        setState({ currentTab: "mine" }, { tabs: true, list: true }); render()
        await loadTab("mine")
      }
      break
    case "2":
      if (state.currentTab !== "review") {
        setState({ currentTab: "review" }, { tabs: true, list: true }); render()
        await loadTab("review")
      }
      break
    case "3":
      if (state.currentTab !== "team") {
        setState({ currentTab: "team" }, { tabs: true, list: true }); render()
        await loadTab("team")
      }
      break

    // Refresh
    case "r":
      await loadTab(state.currentTab)
      break

    // Open in browser
    case "return":
    case "o":
      if (state.prs.length > 0) await openPRInBrowser(state.prs[state.selectedIndex])
      break

    // Checkout
    case "c":
      if (state.prs.length > 0) {
        renderer.suspend()
        await checkoutPR(state.prs[state.selectedIndex])
        renderer.resume()
      }
      break

    // Copy URL to clipboard (OSC 52 — works across SSH)
    case "y":
      if (state.prs.length > 0) {
        renderer.copyToClipboardOSC52(state.prs[state.selectedIndex].url)
      }
      break
  }
})

// ─── Resize ───────────────────────────────────────────────────────────────────

renderer.on("resize", () => {
  setState({}, { list: true })
  render()
})

// ─── Startup ─────────────────────────────────────────────────────────────────

setState({ loading: true }, { tabs: true, list: true })
render()

const teams = await fetchTeams()
setState({ teams }, {})
await loadTab("mine")

// ─── Background polling ───────────────────────────────────────────────────────

setInterval(async () => {
  if (!getState().loading) await loadTab(getState().currentTab)
}, config.refresh_interval * 1000)
