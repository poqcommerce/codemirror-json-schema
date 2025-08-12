import { JSONMode, JSONPointersMap } from "../types";
import { EditorState } from "@codemirror/state";
export declare const getDefaultParser: (mode: JSONMode) => DocumentParser;
export type DocumentParser = (state: EditorState) => {
    data: unknown;
    pointers: JSONPointersMap;
};
