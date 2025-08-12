"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdown = renderMarkdown;
const markdown_it_1 = __importDefault(require("markdown-it"));
const core_1 = require("@shikijs/markdown-it/core");
const core_2 = require("shiki/core");
// const defaultPlugins = [
//   "markdown-it-abbr",
//   "markdown-it-deflist",
//   "markdown-it-emoji",
//   "markdown-it-footnote",
//   "markdown-it-ins",
//   "markdown-it-mark",
//   "markdown-it-sub",
//   "markdown-it-sup",
//   "markdown-it-task-lists",
//   "markdown-it-toc",
//   "markdown-it-attrs",
//   "markdown-it-katex",
//   "markdown-it-external-links",
//   "markdown-it-table-of-contents",
//   "markdown-it-anchor",
//   "markdown-it-implicit-figures",
//   "markdown-it-video",
//   "markdown-it-highlightjs",
// ];
const renderer = (0, markdown_it_1.default)({
    linkify: true,
    typographer: true,
});
(async () => {
    const highlighter = (await (0, core_2.createHighlighterCore)({
        themes: [
            Promise.resolve().then(() => __importStar(require("shiki/themes/vitesse-light.mjs"))),
            Promise.resolve().then(() => __importStar(require("shiki/themes/vitesse-dark.mjs"))),
        ],
        langs: [Promise.resolve().then(() => __importStar(require("shiki/langs/javascript.mjs")))],
    }));
    renderer.use((0, core_1.fromHighlighter)(highlighter, {
        themes: {
            light: "vitesse-light",
            dark: "vitesse-dark",
        },
    }));
})();
function renderMarkdown(markdown, inline = true) {
    if (!inline)
        return renderer.render(markdown);
    return renderer.renderInline(markdown);
}
