import { JSONMode, JSONPointersMap } from "../types";
import { EditorState } from "@codemirror/state";
import { parseJSONDocumentState } from "./json-parser";

export const getDefaultParser = (mode: JSONMode): DocumentParser => {
  return parseJSONDocumentState;
};

export type DocumentParser = (state: EditorState) => {
  data: unknown;
  pointers: JSONPointersMap;
};
