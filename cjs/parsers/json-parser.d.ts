import { EditorState } from "@codemirror/state";
/**
 * Return parsed data and json pointers for a given codemirror EditorState
 * @group Utilities
 */
export declare function parseJSONDocumentState(state: EditorState): {
    data: any;
    pointers: import("..").JSONPointersMap;
};
/**
 * Mimics the behavior of `json-source-map`'s `parseJSONDocument` function using codemirror EditorState
 * @group Utilities
 */
export declare function parseJSONDocument(jsonString: string): {
    data: any;
    pointers: import("..").JSONPointersMap;
};
