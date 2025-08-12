"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultParser = void 0;
const json_parser_1 = require("./json-parser");
const getDefaultParser = (mode) => {
    return json_parser_1.parseJSONDocumentState;
};
exports.getDefaultParser = getDefaultParser;
