"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdown = renderMarkdown;
const markdown_it_1 = __importDefault(require("markdown-it"));
const renderer = (0, markdown_it_1.default)({
    linkify: true,
    typographer: true,
});
function renderMarkdown(markdown, inline = true) {
    if (!inline)
        return renderer.render(markdown);
    return renderer.renderInline(markdown);
}
