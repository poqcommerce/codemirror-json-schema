const md = require("markdown-it");

const renderer = md({
  linkify: true,
  typographer: true,
});

export function renderMarkdown(markdown: string, inline: boolean = true) {
  if (!inline) return renderer.render(markdown);
  return renderer.renderInline(markdown);
}
