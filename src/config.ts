import { existsSync, readFileSync } from "fs"
import { homedir } from "os"
import type { Config } from "./types"

export const DEFAULT_CONFIG: Config = {
  refresh_interval: 60,
}

export function parseConfig(tomlContent: string): Config {
  if (!tomlContent.trim()) return { ...DEFAULT_CONFIG }
  try {
    const parsed = Bun.TOML.parse(tomlContent) as { ui?: { refresh_interval?: unknown } }
    const ui = parsed?.ui ?? {}
    return {
      refresh_interval:
        typeof ui.refresh_interval === "number"
          ? Math.max(5, ui.refresh_interval)
          : DEFAULT_CONFIG.refresh_interval,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function loadConfig(): Config {
  const configPath = `${homedir()}/.config/prbox/config.toml`
  if (!existsSync(configPath)) return { ...DEFAULT_CONFIG }
  try {
    const content = readFileSync(configPath, "utf-8")
    return parseConfig(content)
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}
