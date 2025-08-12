"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchema = jsonSchema;
const lang_json_1 = require("@codemirror/lang-json");
const view_1 = require("@codemirror/view");
const completion_1 = require("../features/completion");
const validation_1 = require("../features/validation");
const hover_1 = require("../features/hover");
const state_1 = require("../features/state");
const lint_1 = require("@codemirror/lint");
/**
 * Full featured cm6 extension for json, including `@codemirror/lang-json`
 * @group Bundled Codemirror Extensions
 */
function jsonSchema(schema) {
    return [
        (0, lang_json_1.json)(),
        (0, lint_1.linter)((0, lang_json_1.jsonParseLinter)()),
        (0, lint_1.linter)((0, validation_1.jsonSchemaLinter)(), {
            needsRefresh: validation_1.handleRefresh,
        }),
        lang_json_1.jsonLanguage.data.of({
            autocomplete: (0, completion_1.jsonCompletion)(),
        }),
        (0, view_1.hoverTooltip)((0, hover_1.jsonSchemaHover)()),
        (0, state_1.stateExtensions)(schema),
    ];
}
