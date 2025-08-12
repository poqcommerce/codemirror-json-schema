import { EditorState, Text } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";
import { JSONMode, JSONPointersMap, Side } from "../types";
export declare const resolveTokenName: (nodeName: string, mode: JSONMode) => string;
export declare function getJsonPointerAt(docText: Text, node: SyntaxNode, mode: JSONMode): string;
/**
 * retrieve a JSON pointer for a given position in the editor
 * @group Utilities
 */
export declare const jsonPointerForPosition: (state: EditorState, pos: number, side: Side, mode: JSONMode) => string;
/**
 * retrieve a Map of all the json pointers in a document
 * @group Utilities
 */
export declare const getJsonPointers: (state: EditorState, mode: JSONMode) => JSONPointersMap;
