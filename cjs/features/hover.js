"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONHover = void 0;
exports.jsonSchemaHover = jsonSchemaHover;
const json_schema_library_1 = require("json-schema-library");
const json_pointers_1 = require("../utils/json-pointers");
const formatting_1 = require("../utils/formatting");
const debug_1 = require("../utils/debug");
const dom_1 = require("../utils/dom");
const state_1 = require("./state");
const constants_1 = require("../constants");
const markdown_1 = require("../utils/markdown");
/**
 * provides a JSON schema enabled tooltip extension for codemirror
 * @group Codemirror Extensions
 */
function jsonSchemaHover(options) {
    const hover = new JSONHover(options);
    return async function jsonDoHover(view, pos, side) {
        return hover.doHover(view, pos, side);
    };
}
function formatType(data) {
    if (data.type) {
        if (data.$ref) {
            return `${data.$ref} (${data.type})`;
        }
        return data.type;
    }
    if (data.$ref) {
        return `${data.$ref}`;
    }
}
function formatComplexType(schema, complexType, draft) {
    return `${complexType}: ${(0, formatting_1.joinWithOr)(schema[complexType].map((s) => {
        try {
            const { data } = draft.resolveRef({ data: s, pointer: s.$ref });
            if (data) {
                return formatType(data);
            }
            return formatType(s);
        }
        catch (err) {
            return s.type;
        }
    }))}`;
}
class JSONHover {
    constructor(opts) {
        var _a, _b;
        this.opts = opts;
        this.schema = null;
        this.mode = constants_1.MODES.JSON;
        this.opts = Object.assign({ parser: JSON.parse }, this.opts);
        this.mode = (_b = (_a = this.opts) === null || _a === void 0 ? void 0 : _a.mode) !== null && _b !== void 0 ? _b : constants_1.MODES.JSON;
    }
    getDataForCursor(view, pos, side) {
        const schema = (0, state_1.getJSONSchema)(view.state);
        if (!schema) {
            // todo: should we even do anything without schema
            // without taking over the existing mode responsibilties?
            return null;
        }
        this.schema = new json_schema_library_1.Draft04(schema);
        const pointer = (0, json_pointers_1.jsonPointerForPosition)(view.state, pos, side, this.mode);
        let data = undefined;
        // TODO: use the AST tree to return the right hand, data so that we don't have to parse the doc
        try {
            data = this.opts.parser(view.state.doc.toString());
        }
        catch (_a) { }
        if (!pointer) {
            return null;
        }
        // if the data is valid, we can infer a type for complex types
        let subSchema = this.schema.getSchema({
            pointer,
            data,
            withSchemaWarning: true,
        });
        if ((0, json_schema_library_1.isJsonError)(subSchema)) {
            if (subSchema === null || subSchema === void 0 ? void 0 : subSchema.data.schema["$ref"]) {
                subSchema = this.schema.resolveRef(subSchema);
            }
            else {
                subSchema = subSchema === null || subSchema === void 0 ? void 0 : subSchema.data.schema;
            }
        }
        return { schema: subSchema, pointer };
    }
    formatMessage(texts) {
        const { message, typeInfo } = texts;
        if (message) {
            return (0, dom_1.el)("div", { class: "cm6-json-schema-hover" }, [
                (0, dom_1.el)("div", {
                    class: "cm6-json-schema-hover--description",
                    inner: (0, markdown_1.renderMarkdown)(message, false),
                }),
                (0, dom_1.el)("div", { class: "cm6-json-schema-hover--code-wrapper" }, [
                    (0, dom_1.el)("div", {
                        class: "cm6-json-schema-hover--code",
                        inner: (0, markdown_1.renderMarkdown)(typeInfo, false),
                    }),
                ]),
            ]);
        }
        return (0, dom_1.el)("div", { class: "cm6-json-schema-hover" }, [
            (0, dom_1.el)("div", { class: "cm6-json-schema-hover--code-wrapper" }, [
                (0, dom_1.el)("code", {
                    class: "cm6-json-schema-hover--code",
                    inner: (0, markdown_1.renderMarkdown)(typeInfo, false),
                }),
            ]),
        ]);
    }
    getHoverTexts(data, draft) {
        let typeInfo = "";
        let message = null;
        const { schema } = data;
        if (schema.oneOf) {
            typeInfo = formatComplexType(schema, "oneOf", draft);
        }
        if (schema.anyOf) {
            typeInfo = formatComplexType(schema, "anyOf", draft);
        }
        if (schema.allOf) {
            typeInfo = formatComplexType(schema, "allOf", draft);
        }
        if (schema.type) {
            typeInfo = Array.isArray(schema.type)
                ? (0, formatting_1.joinWithOr)(schema.type)
                : schema.type;
        }
        if (schema.$ref) {
            typeInfo = ` Reference: ${schema.$ref}`;
        }
        if (schema.enum) {
            typeInfo = `\`enum\`: ${(0, formatting_1.joinWithOr)(schema.enum)}`;
        }
        if (schema.format) {
            typeInfo += `\`format\`: ${schema.format}`;
        }
        if (schema.pattern) {
            typeInfo += `\`pattern\`: ${schema.pattern}`;
        }
        if (schema.description) {
            message = schema.description;
        }
        return { message, typeInfo };
    }
    // return hover state for the current json schema property
    async doHover(view, pos, side) {
        var _a, _b, _c, _d;
        const start = pos, end = pos;
        try {
            const cursorData = this.getDataForCursor(view, pos, side);
            debug_1.debug.log("cursorData", cursorData);
            // if we don't have a (sub)schema, we can't show anything
            if (!(cursorData === null || cursorData === void 0 ? void 0 : cursorData.schema))
                return null;
            const getHoverTexts = (_b = (_a = this.opts) === null || _a === void 0 ? void 0 : _a.getHoverTexts) !== null && _b !== void 0 ? _b : this.getHoverTexts;
            const hoverTexts = getHoverTexts(cursorData, this.schema);
            // allow users to override the hover
            const formatter = (_d = (_c = this.opts) === null || _c === void 0 ? void 0 : _c.formatHover) !== null && _d !== void 0 ? _d : this.formatMessage;
            const formattedDom = formatter(hoverTexts);
            return {
                pos: start,
                end,
                arrow: true,
                // to mimic similar modes for other editors
                // otherwise, it gets into a z-index battle with completion/etc
                above: true,
                create: (view) => {
                    return {
                        dom: formattedDom,
                    };
                },
            };
        }
        catch (err) {
            debug_1.debug.log(err);
            return null;
        }
    }
}
exports.JSONHover = JSONHover;
