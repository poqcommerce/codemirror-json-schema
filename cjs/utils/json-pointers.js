"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonPointers = exports.jsonPointerForPosition = exports.resolveTokenName = void 0;
exports.getJsonPointerAt = getJsonPointerAt;
const language_1 = require("@codemirror/language");
const constants_1 = require("../constants");
const node_1 = require("./node");
const resolveTokenName = (nodeName, mode) => {
    return nodeName;
};
exports.resolveTokenName = resolveTokenName;
// adapted from https://discuss.codemirror.net/t/json-pointer-at-cursor-seeking-implementation-critique/4793/3
// this could be useful for other things later!
function getJsonPointerAt(docText, node, mode) {
    const path = [];
    for (let n = node; n === null || n === void 0 ? void 0 : n.parent; n = n.parent) {
        switch ((0, exports.resolveTokenName)(n.parent.name, mode)) {
            case constants_1.TOKENS.PROPERTY: {
                const name = (0, node_1.getMatchingChildNode)(n.parent, constants_1.TOKENS.PROPERTY_NAME, mode);
                if (name) {
                    let word = (0, node_1.getWord)(docText, name).replace(/[/~]/g, (v) => v === "~" ? "~0" : "~1");
                    // TODO generally filter out pointers to objects being started?
                    // if (word !== '') {
                    path.unshift(word);
                    // }
                }
                break;
            }
            case constants_1.TOKENS.ARRAY: {
                if ((0, node_1.isValueNode)(n, mode)) {
                    const index = (0, node_1.findNodeIndexInArrayNode)(n.parent, n, mode);
                    path.unshift(`${index}`);
                }
                break;
            }
        }
    }
    if (path.length === 0) {
        // TODO json-schema-library does not seem to like / as root pointer (it probably just uses split and it will return two empty strings). So is this fine? And why is it not prefixed with #?
        return "";
    }
    return "/" + path.join("/");
}
/**
 * retrieve a JSON pointer for a given position in the editor
 * @group Utilities
 */
const jsonPointerForPosition = (state, pos, side = -1, mode) => {
    return getJsonPointerAt(state.doc, (0, language_1.syntaxTree)(state).resolve(pos, side), mode);
};
exports.jsonPointerForPosition = jsonPointerForPosition;
/**
 * retrieve a Map of all the json pointers in a document
 * @group Utilities
 */
const getJsonPointers = (state, mode) => {
    const tree = (0, language_1.syntaxTree)(state);
    const pointers = new Map();
    tree.iterate({
        enter: (type) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if ([constants_1.TOKENS.PROPERTY_NAME, constants_1.TOKENS.OBJECT].includes((0, exports.resolveTokenName)(type.name, mode))) {
                const pointer = getJsonPointerAt(state.doc, type.node, mode);
                const { from: keyFrom, to: keyTo } = type.node;
                // if there's no value, we can't get the valueFrom/to
                if (!((_b = (_a = type.node) === null || _a === void 0 ? void 0 : _a.nextSibling) === null || _b === void 0 ? void 0 : _b.node)) {
                    pointers.set(pointer, { keyFrom, keyTo });
                    return true;
                }
                // TODO: Make this generic enough to avoid mode-specific checks
                const nextNode = mode === constants_1.MODES.JSON
                    ? (_d = (_c = type.node) === null || _c === void 0 ? void 0 : _c.nextSibling) === null || _d === void 0 ? void 0 : _d.node
                    : (_h = (_g = (_f = (_e = type.node) === null || _e === void 0 ? void 0 : _e.nextSibling) === null || _f === void 0 ? void 0 : _f.node) === null || _g === void 0 ? void 0 : _g.nextSibling) === null || _h === void 0 ? void 0 : _h.node;
                if (!nextNode) {
                    pointers.set(pointer, { keyFrom, keyTo });
                    return true;
                }
                const { from: valueFrom, to: valueTo } = nextNode;
                pointers.set(pointer, { keyFrom, keyTo, valueFrom, valueTo });
                return true;
            }
        },
    });
    return pointers;
};
exports.getJsonPointers = getJsonPointers;
