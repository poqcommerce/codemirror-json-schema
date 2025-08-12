"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClosestNode = exports.findNodeIndexInArrayNode = exports.getChildValueNode = exports.getMatchingChildNode = exports.getMatchingChildrenNodes = exports.getChildrenNodes = exports.isPropertyNameNode = exports.isValueNode = exports.isPrimitiveValueNode = exports.isInvalidValueNode = exports.getWord = exports.surroundingDoubleQuotesToSingle = exports.stripSurroundingQuotes = exports.getNodeAtPosition = void 0;
const constants_1 = require("../constants");
const language_1 = require("@codemirror/language");
const json_pointers_1 = require("./json-pointers");
const getNodeAtPosition = (state, pos, side = -1) => {
    return (0, language_1.syntaxTree)(state).resolveInner(pos, side);
};
exports.getNodeAtPosition = getNodeAtPosition;
const stripSurroundingQuotes = (str) => {
    return str.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
};
exports.stripSurroundingQuotes = stripSurroundingQuotes;
const surroundingDoubleQuotesToSingle = (str) => {
    return str.replace(/^"(.*)"$/, "'$1'");
};
exports.surroundingDoubleQuotesToSingle = surroundingDoubleQuotesToSingle;
const getWord = (doc, node, stripQuotes = true, onlyEvenQuotes = true) => {
    const word = node ? doc.sliceString(node.from, node.to) : "";
    if (!stripQuotes) {
        return word;
    }
    if (onlyEvenQuotes) {
        return (0, exports.stripSurroundingQuotes)(word);
    }
    return word.replace(/(^["'])|(["']$)/g, "");
};
exports.getWord = getWord;
const isInvalidValueNode = (node, mode) => {
    var _a, _b, _c, _d;
    return ((0, json_pointers_1.resolveTokenName)(node.name, mode) === constants_1.TOKENS.INVALID &&
        ((0, json_pointers_1.resolveTokenName)((_b = (_a = node.prevSibling) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "", mode) ===
            constants_1.TOKENS.PROPERTY_NAME ||
            (0, json_pointers_1.resolveTokenName)((_d = (_c = node.prevSibling) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "", mode) ===
                constants_1.TOKENS.PROPERTY_COLON));
};
exports.isInvalidValueNode = isInvalidValueNode;
const isPrimitiveValueNode = (node, mode) => {
    return (constants_1.PRIMITIVE_TYPES.includes((0, json_pointers_1.resolveTokenName)(node.name, mode)) ||
        (0, exports.isInvalidValueNode)(node, mode));
};
exports.isPrimitiveValueNode = isPrimitiveValueNode;
const isValueNode = (node, mode) => {
    return ([...constants_1.PRIMITIVE_TYPES, ...constants_1.COMPLEX_TYPES].includes((0, json_pointers_1.resolveTokenName)(node.name, mode)) || (0, exports.isInvalidValueNode)(node, mode));
};
exports.isValueNode = isValueNode;
const isPropertyNameNode = (node, mode) => {
    var _a, _b, _c, _d;
    return ((0, json_pointers_1.resolveTokenName)(node.name, mode) === constants_1.TOKENS.PROPERTY_NAME ||
        ((0, json_pointers_1.resolveTokenName)(node.name, mode) === constants_1.TOKENS.INVALID &&
            ((0, json_pointers_1.resolveTokenName)((_b = (_a = node.prevSibling) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "", mode) ===
                constants_1.TOKENS.PROPERTY ||
                (0, json_pointers_1.resolveTokenName)((_d = (_c = node.prevSibling) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "", mode) === "{")));
};
exports.isPropertyNameNode = isPropertyNameNode;
const getChildrenNodes = (node) => {
    const children = [];
    let child = node.firstChild;
    while (child) {
        if (child) {
            children.push(child);
        }
        child = child === null || child === void 0 ? void 0 : child.nextSibling;
    }
    return children;
};
exports.getChildrenNodes = getChildrenNodes;
const getMatchingChildrenNodes = (node, nodeName, mode) => {
    return (0, exports.getChildrenNodes)(node).filter((n) => (0, json_pointers_1.resolveTokenName)(n.name, mode) === nodeName);
};
exports.getMatchingChildrenNodes = getMatchingChildrenNodes;
const getMatchingChildNode = (node, nodeName, mode) => {
    var _a;
    return ((_a = (0, exports.getChildrenNodes)(node).find((n) => (0, json_pointers_1.resolveTokenName)(n.name, mode) === nodeName)) !== null && _a !== void 0 ? _a : null);
};
exports.getMatchingChildNode = getMatchingChildNode;
const getChildValueNode = (node, mode) => {
    return (0, exports.getChildrenNodes)(node).find((n) => (0, exports.isPrimitiveValueNode)(n, mode));
};
exports.getChildValueNode = getChildValueNode;
const getArrayNodeChildren = (node, mode) => {
    return (0, exports.getChildrenNodes)(node).filter((n) => constants_1.PRIMITIVE_TYPES.includes((0, json_pointers_1.resolveTokenName)(n.name, mode)) ||
        constants_1.COMPLEX_TYPES.includes((0, json_pointers_1.resolveTokenName)(n.name, mode)));
};
const findNodeIndexInArrayNode = (arrayNode, valueNode, mode) => {
    return getArrayNodeChildren(arrayNode, mode).findIndex((nd) => nd.from === valueNode.from && nd.to === valueNode.to);
};
exports.findNodeIndexInArrayNode = findNodeIndexInArrayNode;
const getClosestNode = (node, nodeName, mode, depth = Infinity) => {
    let n = node;
    while (n && depth > 0) {
        if ((0, json_pointers_1.resolveTokenName)(n.name, mode) === nodeName) {
            return n;
        }
        n = n.parent;
        depth--;
    }
    return null;
};
exports.getClosestNode = getClosestNode;
