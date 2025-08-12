import { parseJSONDocumentState } from "./json-parser";
export const getDefaultParser = (mode) => {
    return parseJSONDocumentState;
};
