import { $ } from "bun"

console.log("Building prbox binary...")

try {
  await $`bun build src/main.ts --compile --outfile prbox`
  console.log("✓ Built: ./prbox")
  console.log("  Run: ./prbox")
  console.log("  Install: make install")
} catch (e) {
  // bun build --compile may fail with native modules in some versions.
  // Fall back to a launcher shell script.
  console.warn("bun --compile failed, falling back to shell launcher...")
  const script = `#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bun run "$SCRIPT_DIR/src/main.ts" "$@"
`
  await Bun.write("prbox", script)
  await $`chmod +x prbox`
  console.log("✓ Created launcher script: ./prbox")
}
