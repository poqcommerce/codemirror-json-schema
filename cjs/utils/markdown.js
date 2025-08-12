"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdown = renderMarkdown;
const md = require("markdown-it");
const renderer = md({
    linkify: true,
    typographer: true,
});
function renderMarkdown(markdown, inline = true) {
    if (!inline)
        return renderer.render(markdown);
    return renderer.renderInline(markdown);
}
