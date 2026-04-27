import { BoxRenderable, TextRenderable, t, fg } from "@opentui/core"
import type { CliRenderer } from "@opentui/core"

export function createFooter(renderer: CliRenderer): BoxRenderable {
  const container = new BoxRenderable(renderer, {
    id: "footer",
    height: 1,
    width: "100%",
    backgroundColor: "#161B22",
    paddingLeft: 1,
    paddingRight: 1,
    flexDirection: "row",
    alignItems: "center",
  })

  const sep = fg("#333333")("·")
  const k = (s: string) => fg("#7DCFFF")(s)
  const d = (s: string) => fg("#555555")(s)

  const text = new TextRenderable(renderer, {
    id: "footer-text",
    content: t`${k("j/k")} ${d("move")} ${sep} ${k("enter")} ${d("open")} ${sep} ${k("c")} ${d("checkout")} ${sep} ${k("y")} ${d("copy url")} ${sep} ${k("r")} ${d("refresh")} ${sep} ${k("q")} ${d("quit")}`,
  })

  container.add(text)
  return container
}
