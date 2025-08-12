import { json } from "@codemirror/lang-json";
import { EditorState } from "@codemirror/state";
import { parse } from "best-effort-json-parser";
import { MODES } from "../constants";
import { getJsonPointers } from "../utils/json-pointers";
/**
 * Return parsed data and json pointers for a given codemirror EditorState
 * @group Utilities
 */
export function parseJSONDocumentState(state) {
    let data = null;
    try {
        data = JSON.parse(state.doc.toString());
        // return pointers regardless of whether JSON.parse succeeds
    }
    catch (_a) {
        try {
            data = parse(state.doc.toString());
        }
        catch (_b) { }
    }
    const pointers = getJsonPointers(state, MODES.JSON);
    return { data, pointers };
}
/**
 * Mimics the behavior of `json-source-map`'s `parseJSONDocument` function using codemirror EditorState
 * @group Utilities
 */
export function parseJSONDocument(jsonString) {
    const state = EditorState.create({ doc: jsonString, extensions: [json()] });
    return parseJSONDocumentState(state);
}
