import { describe, it, expect } from "bun:test"
import { parseConfig, DEFAULT_CONFIG } from "./config"

describe("parseConfig", () => {
  it("returns defaults when given empty string", () => {
    const result = parseConfig("")
    expect(result.refresh_interval).toBe(60)
  })

  it("parses refresh_interval from [ui] section", () => {
    const result = parseConfig(`
[ui]
refresh_interval = 120
`)
    expect(result.refresh_interval).toBe(120)
  })

  it("falls back to default for unknown keys", () => {
    const result = parseConfig(`
[ui]
unknown_key = "foo"
`)
    expect(result.refresh_interval).toBe(DEFAULT_CONFIG.refresh_interval)
  })

  it("falls back to default on malformed TOML", () => {
    const result = parseConfig("not valid toml ===")
    expect(result.refresh_interval).toBe(DEFAULT_CONFIG.refresh_interval)
  })

  it("clamps refresh_interval to minimum 5 seconds", () => {
    const result = parseConfig(`
[ui]
refresh_interval = 0
`)
    expect(result.refresh_interval).toBe(5)
  })
})
