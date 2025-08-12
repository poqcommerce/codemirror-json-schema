"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODES = exports.COMPLEX_TYPES = exports.PRIMITIVE_TYPES = exports.JSON5_TOKENS_MAPPING = exports.YAML_TOKENS_MAPPING = exports.TOKENS = void 0;
exports.TOKENS = {
    STRING: "String",
    NUMBER: "Number",
    TRUE: "True",
    FALSE: "False",
    NULL: "Null",
    OBJECT: "Object",
    ARRAY: "Array",
    PROPERTY: "Property",
    PROPERTY_NAME: "PropertyName",
    PROPERTY_COLON: "PropertyColon", // used in json5 grammar
    ITEM: "Item", // used in yaml grammar
    JSON_TEXT: "JsonText",
    INVALID: "⚠",
};
// TODO: To ensure that the YAML tokens are always mapped correctly,
// we should change the TOKENS values to some other values and also create
// mappings for the JSON tokens, which will force us to update all the token mappings whenever there is a change.
exports.YAML_TOKENS_MAPPING = {
    Pair: exports.TOKENS.PROPERTY,
    Key: exports.TOKENS.PROPERTY_NAME,
    BlockSequence: exports.TOKENS.ARRAY,
    BlockMapping: exports.TOKENS.OBJECT,
    FlowSequence: exports.TOKENS.ARRAY,
    FlowMapping: exports.TOKENS.OBJECT,
    QuotedLiteral: exports.TOKENS.STRING,
    Literal: exports.TOKENS.STRING, // best guess
    Stream: exports.TOKENS.JSON_TEXT,
    Document: exports.TOKENS.OBJECT,
};
exports.JSON5_TOKENS_MAPPING = {
    File: exports.TOKENS.JSON_TEXT,
};
exports.PRIMITIVE_TYPES = [
    exports.TOKENS.STRING,
    exports.TOKENS.NUMBER,
    exports.TOKENS.TRUE,
    exports.TOKENS.FALSE,
    exports.TOKENS.NULL,
];
exports.COMPLEX_TYPES = [exports.TOKENS.OBJECT, exports.TOKENS.ARRAY, exports.TOKENS.ITEM];
exports.MODES = {
    JSON: "json4",
};
