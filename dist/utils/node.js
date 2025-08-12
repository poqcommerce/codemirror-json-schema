import { COMPLEX_TYPES, TOKENS, PRIMITIVE_TYPES } from "../constants";
import { syntaxTree } from "@codemirror/language";
import { resolveTokenName } from "./json-pointers";
export const getNodeAtPosition = (state, pos, side = -1) => {
    return syntaxTree(state).resolveInner(pos, side);
};
export const stripSurroundingQuotes = (str) => {
    return str.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
};
export const surroundingDoubleQuotesToSingle = (str) => {
    return str.replace(/^"(.*)"$/, "'$1'");
};
export const getWord = (doc, node, stripQuotes = true, onlyEvenQuotes = true) => {
    const word = node ? doc.sliceString(node.from, node.to) : "";
    if (!stripQuotes) {
        return word;
    }
    if (onlyEvenQuotes) {
        return stripSurroundingQuotes(word);
    }
    return word.replace(/(^["'])|(["']$)/g, "");
};
export const isInvalidValueNode = (node, mode) => {
    var _a, _b, _c, _d;
    return (resolveTokenName(node.name, mode) === TOKENS.INVALID &&
        (resolveTokenName((_b = (_a = node.prevSibling) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "", mode) ===
            TOKENS.PROPERTY_NAME ||
            resolveTokenName((_d = (_c = node.prevSibling) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "", mode) ===
                TOKENS.PROPERTY_COLON));
};
export const isPrimitiveValueNode = (node, mode) => {
    return (PRIMITIVE_TYPES.includes(resolveTokenName(node.name, mode)) ||
        isInvalidValueNode(node, mode));
};
export const isValueNode = (node, mode) => {
    return ([...PRIMITIVE_TYPES, ...COMPLEX_TYPES].includes(resolveTokenName(node.name, mode)) || isInvalidValueNode(node, mode));
};
export const isPropertyNameNode = (node, mode) => {
    var _a, _b, _c, _d;
    return (resolveTokenName(node.name, mode) === TOKENS.PROPERTY_NAME ||
        (resolveTokenName(node.name, mode) === TOKENS.INVALID &&
            (resolveTokenName((_b = (_a = node.prevSibling) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "", mode) ===
                TOKENS.PROPERTY ||
                resolveTokenName((_d = (_c = node.prevSibling) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "", mode) === "{")));
};
export const getChildrenNodes = (node) => {
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
export const getMatchingChildrenNodes = (node, nodeName, mode) => {
    return getChildrenNodes(node).filter((n) => resolveTokenName(n.name, mode) === nodeName);
};
export const getMatchingChildNode = (node, nodeName, mode) => {
    var _a;
    return ((_a = getChildrenNodes(node).find((n) => resolveTokenName(n.name, mode) === nodeName)) !== null && _a !== void 0 ? _a : null);
};
export const getChildValueNode = (node, mode) => {
    return getChildrenNodes(node).find((n) => isPrimitiveValueNode(n, mode));
};
const getArrayNodeChildren = (node, mode) => {
    return getChildrenNodes(node).filter((n) => PRIMITIVE_TYPES.includes(resolveTokenName(n.name, mode)) ||
        COMPLEX_TYPES.includes(resolveTokenName(n.name, mode)));
};
export const findNodeIndexInArrayNode = (arrayNode, valueNode, mode) => {
    return getArrayNodeChildren(arrayNode, mode).findIndex((nd) => nd.from === valueNode.from && nd.to === valueNode.to);
};
export const getClosestNode = (node, nodeName, mode, depth = Infinity) => {
    let n = node;
    while (n && depth > 0) {
        if (resolveTokenName(n.name, mode) === nodeName) {
            return n;
        }
        n = n.parent;
        depth--;
    }
    return null;
};
