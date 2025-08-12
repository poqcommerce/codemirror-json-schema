"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJSONDocumentState = parseJSONDocumentState;
exports.parseJSONDocument = parseJSONDocument;
const lang_json_1 = require("@codemirror/lang-json");
const state_1 = require("@codemirror/state");
const best_effort_json_parser_1 = require("best-effort-json-parser");
const constants_1 = require("../constants");
const json_pointers_1 = require("../utils/json-pointers");
/**
 * Return parsed data and json pointers for a given codemirror EditorState
 * @group Utilities
 */
function parseJSONDocumentState(state) {
    let data = null;
    try {
        data = JSON.parse(state.doc.toString());
        // return pointers regardless of whether JSON.parse succeeds
    }
    catch (_a) {
        try {
            data = (0, best_effort_json_parser_1.parse)(state.doc.toString());
        }
        catch (_b) { }
    }
    const pointers = (0, json_pointers_1.getJsonPointers)(state, constants_1.MODES.JSON);
    return { data, pointers };
}
/**
 * Mimics the behavior of `json-source-map`'s `parseJSONDocument` function using codemirror EditorState
 * @group Utilities
 */
function parseJSONDocument(jsonString) {
    const state = state_1.EditorState.create({ doc: jsonString, extensions: [(0, lang_json_1.json)()] });
    return parseJSONDocumentState(state);
}
