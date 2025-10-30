"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONCompletion = void 0;
exports.jsonCompletion = jsonCompletion;
const autocomplete_1 = require("@codemirror/autocomplete");
const language_1 = require("@codemirror/language");
const debug_1 = require("../utils/debug");
const node_1 = require("../utils/node");
const state_1 = require("./state");
const json_schema_library_1 = require("json-schema-library");
const json_pointers_1 = require("../utils/json-pointers");
const constants_1 = require("../constants");
const dom_1 = require("../utils/dom");
const markdown_1 = require("../utils/markdown");
const parsers_1 = require("../parsers");
const recordUtil_1 = require("../utils/recordUtil");
class CompletionCollector {
    constructor() {
        this.completions = new Map();
        this.reservedKeys = new Set();
    }
    reserve(key) {
        this.reservedKeys.add(key);
    }
    add(completion) {
        if (this.reservedKeys.has(completion.label)) {
            return;
        }
        this.completions.set(completion.label, completion);
    }
}
function isRealSchema(subSchema) {
    return !(!subSchema ||
        (0, json_schema_library_1.isJsonError)(subSchema) ||
        subSchema.name === "UnknownPropertyError" ||
        subSchema.type === "undefined");
}
class JSONCompletion {
    // private lastKnownValidData: object | null = null;
    constructor(opts) {
        var _a, _b, _c;
        this.opts = opts;
        this.originalSchema = null;
        /**
         * Inlined (expanded) top-level $ref if present.
         */
        this.schema = null;
        /**
         * Inlined (expanded) top-level $ref if present.
         * Does not contain any required properties and allows any additional properties everywhere.
         */
        this.laxSchema = null;
        this.mode = constants_1.MODES.JSON;
        // For enum cases to show description per enum we might want to handle cache description here during the completion process
        this.constantDescriptions = new Map();
        this.mode = (_a = opts.mode) !== null && _a !== void 0 ? _a : constants_1.MODES.JSON;
        this.parser = (_c = (_b = this.opts) === null || _b === void 0 ? void 0 : _b.jsonParser) !== null && _c !== void 0 ? _c : (0, parsers_1.getDefaultParser)(this.mode);
    }
    doComplete(ctx) {
        var _a;
        const schemaFromState = (0, state_1.getJSONSchema)(ctx.state);
        if (this.originalSchema !== schemaFromState) {
            // only process schema when it changed (could be huge)
            this.schema =
                (_a = expandSchemaProperty(schemaFromState, schemaFromState)) !== null && _a !== void 0 ? _a : schemaFromState;
            this.laxSchema = makeSchemaLax(this.schema);
        }
        if (!this.schema || !this.laxSchema) {
            // todo: should we even do anything without schema
            // without taking over the existing mode responsibilties?
            return [];
        }
        // first attempt to complete with the original schema
        debug_1.debug.log("xxx", "trying with original schema");
        const completionResultForOriginalSchema = this.doCompleteForSchema(ctx, this.schema);
        if (completionResultForOriginalSchema.options.length !== 0) {
            return completionResultForOriginalSchema;
        }
        // if there are no completions, try with the lax schema (because json-schema-library would otherwise not provide schemas if invalid properties are present)
        debug_1.debug.log("xxx", "no completions with original schema, trying with lax schema");
        return this.doCompleteForSchema(ctx, this.laxSchema);
    }
    doCompleteForSchema(ctx, rootSchema) {
        var _a, _b;
        const result = {
            from: ctx.pos,
            to: ctx.pos,
            options: [],
            filter: false, // will be handled manually
        };
        const text = ctx.state.doc.sliceString(0);
        let node = (0, node_1.getNodeAtPosition)(ctx.state, ctx.pos);
        // position node word prefix (without quotes) for matching
        let prefix = ctx.state.sliceDoc(node.from, ctx.pos).replace(/^(["'])/, "");
        debug_1.debug.log("xxx", "node", node, "prefix", prefix, "ctx", ctx);
        // Only show completions if we are filling out a word or right after the starting quote, or if explicitly requested
        if (!((0, node_1.isPrimitiveValueNode)(node, this.mode) ||
            (0, node_1.isPropertyNameNode)(node, this.mode)) &&
            !ctx.explicit) {
            debug_1.debug.log("xxx", "no completions for non-word/primitive", node);
            return result;
        }
        const currentWord = (0, node_1.getWord)(ctx.state.doc, node);
        const rawWord = (0, node_1.getWord)(ctx.state.doc, node, false);
        // Calculate overwrite range
        if (node &&
            ((0, node_1.isPrimitiveValueNode)(node, this.mode) ||
                (0, node_1.isPropertyNameNode)(node, this.mode))) {
            result.from = node.from;
            result.to = node.to;
        }
        else {
            const word = ctx.matchBefore(/[A-Za-z0-9._]*/);
            const overwriteStart = ctx.pos - currentWord.length;
            debug_1.debug.log("xxx", "overwriteStart after", overwriteStart, "ctx.pos", ctx.pos, "word", word, "currentWord", currentWord, "=>", text[overwriteStart - 1], "..", text[overwriteStart], "..", text);
            result.from =
                node.name === constants_1.TOKENS.INVALID ? ((_a = word === null || word === void 0 ? void 0 : word.from) !== null && _a !== void 0 ? _a : ctx.pos) : overwriteStart;
            result.to = ctx.pos;
        }
        const collector = new CompletionCollector();
        let addValue = true;
        const closestPropertyNameNode = (0, node_1.getClosestNode)(node, constants_1.TOKENS.PROPERTY_NAME, this.mode);
        // if we are inside a property name node, we need to get the parent property name node
        // The only reason we would be inside a property name node is if the current node is invalid or a literal/primitive node
        if (closestPropertyNameNode) {
            debug_1.debug.log("xxx", "closestPropertyNameNode", closestPropertyNameNode, "node", node);
            node = closestPropertyNameNode;
        }
        if ((0, node_1.isPropertyNameNode)(node, this.mode)) {
            debug_1.debug.log("xxx", "isPropertyNameNode", node);
            const parent = node.parent;
            if (parent) {
                // get value node from parent
                const valueNode = (0, node_1.getChildValueNode)(parent, this.mode);
                addValue =
                    !valueNode ||
                        (valueNode.name === constants_1.TOKENS.INVALID &&
                            valueNode.from - valueNode.to === 0) ||
                        // TODO: Verify this doesn't break anything else
                        (valueNode.parent
                            ? (0, node_1.getChildrenNodes)(valueNode.parent).length <= 1
                            : false);
                debug_1.debug.log("xxx", "addValue", addValue, (0, node_1.getChildValueNode)(parent, this.mode), node);
                // find object node
                node = (_b = (0, node_1.getClosestNode)(parent, constants_1.TOKENS.OBJECT, this.mode)) !== null && _b !== void 0 ? _b : null;
            }
        }
        debug_1.debug.log("xxx", node, currentWord, ctx, "node at pos", (0, node_1.getNodeAtPosition)(ctx.state, ctx.pos));
        // proposals for properties
        if (node &&
            [constants_1.TOKENS.OBJECT, constants_1.TOKENS.JSON_TEXT].includes((0, json_pointers_1.resolveTokenName)(node.name, this.mode)) &&
            ((0, node_1.isPropertyNameNode)((0, node_1.getNodeAtPosition)(ctx.state, ctx.pos), this.mode) ||
                closestPropertyNameNode)) {
            // don't suggest keys when the cursor is just before the opening curly brace
            if (node.from === ctx.pos) {
                debug_1.debug.log("xxx", "no completions for just before opening brace");
                return result;
            }
            // property proposals with schema
            this.getPropertyCompletions(rootSchema, ctx, node, collector, addValue, rawWord);
        }
        else {
            // proposals for values
            const types = {};
            // value proposals with schema
            const res = this.getValueCompletions(rootSchema, ctx, types, collector);
            debug_1.debug.log("xxx", "getValueCompletions res", res);
            if (res) {
                // TODO: While this works, we also need to handle the completion from and to positions to use it
                // // use the value node to calculate the prefix
                // prefix = res.valuePrefix;
                // debug.log("xxx", "using valueNode prefix", prefix);
            }
        }
        // handle filtering
        result.options = Array.from(collector.completions.values()).filter((v) => (0, node_1.stripSurroundingQuotes)(v.label).startsWith(prefix));
        debug_1.debug.log("xxx", "result", result, "prefix", prefix, "collector.completions", collector.completions, "reservedKeys", collector.reservedKeys);
        return result;
    }
    applySnippetCompletion(completion) {
        return (0, autocomplete_1.snippetCompletion)(typeof completion.apply !== "string"
            ? completion.label
            : completion.apply, completion);
    }
    getPropertyCompletions(rootSchema, ctx, node, collector, addValue, rawWord) {
        // don't suggest properties that are already present
        const properties = (0, node_1.getMatchingChildrenNodes)(node, constants_1.TOKENS.PROPERTY, this.mode);
        debug_1.debug.log("xxx", "getPropertyCompletions", node, ctx, properties);
        properties.forEach((p) => {
            const key = (0, node_1.getWord)(ctx.state.doc, (0, node_1.getMatchingChildNode)(p, constants_1.TOKENS.PROPERTY_NAME, this.mode));
            collector.reserve((0, node_1.stripSurroundingQuotes)(key));
        });
        // TODO: Handle separatorAfter
        // Get matching schemas
        const schemas = this.getSchemas(rootSchema, ctx);
        debug_1.debug.log("xxx", "propertyCompletion schemas", schemas);
        schemas.forEach((s) => {
            if (typeof s !== "object") {
                return;
            }
            const properties = s.properties;
            if (properties) {
                Object.entries(properties).forEach(([key, value]) => {
                    var _a, _b;
                    if (typeof value === "object") {
                        const description = (_a = value.description) !== null && _a !== void 0 ? _a : "";
                        const type = (_b = value.type) !== null && _b !== void 0 ? _b : "";
                        const typeStr = Array.isArray(type) ? type.toString() : type;
                        const completion = {
                            // label is the unquoted key which will be displayed.
                            label: key,
                            apply: this.getInsertTextForProperty(key, addValue, rawWord, rootSchema, value),
                            type: "property",
                            detail: typeStr,
                            info: () => (0, dom_1.el)("div", {
                                inner: (0, markdown_1.renderMarkdown)(description),
                            }),
                        };
                        collector.add(this.applySnippetCompletion(completion));
                    }
                });
            }
            const propertyNames = s.propertyNames;
            if (typeof propertyNames === "object") {
                if (propertyNames.enum) {
                    propertyNames.enum.forEach((v) => {
                        const label = v === null || v === void 0 ? void 0 : v.toString();
                        if (label) {
                            const completion = {
                                label,
                                apply: this.getInsertTextForProperty(label, addValue, rawWord, rootSchema),
                                type: "property",
                            };
                            collector.add(this.applySnippetCompletion(completion));
                        }
                    });
                }
                if (propertyNames.const) {
                    const label = propertyNames.const.toString();
                    const completion = {
                        label,
                        apply: this.getInsertTextForProperty(label, addValue, rawWord, rootSchema),
                        type: "property",
                    };
                    collector.add(this.applySnippetCompletion(completion));
                }
            }
        });
    }
    // apply is the quoted key which will be applied.
    // Normally the label needs to match the token
    // prefix i.e. if the token begins with `"to`, then the
    // label needs to have the quotes as well for it to match.
    // However we are manually filtering the results so we can
    // just use the unquoted key as the label, which is nicer
    // and gives us more control.
    // If no property value is present, then we add the colon as well.
    // Use snippetCompletion to handle insert value + position cursor e.g. "key": "#{}"
    // doc: https://codemirror.net/docs/ref/#autocomplete.snippetCompletion
    // idea: https://discuss.codemirror.net/t/autocomplete-cursor-position-in-apply-function/4088/3
    getInsertTextForProperty(key, addValue, rawWord, rootSchema, propertySchema) {
        // expand schema property if it is a reference
        propertySchema = propertySchema
            ? expandSchemaProperty(propertySchema, rootSchema)
            : propertySchema;
        let resultText = this.getInsertTextForPropertyName(key, rawWord);
        if (!addValue) {
            return resultText;
        }
        resultText += ": ";
        let value;
        let nValueProposals = 0;
        if (typeof propertySchema === "object") {
            if (typeof propertySchema.default !== "undefined") {
                if (!value) {
                    value = this.getInsertTextForGuessedValue(propertySchema.default, "");
                }
                nValueProposals++;
            }
            else {
                if (propertySchema.enum) {
                    if (!value && propertySchema.enum.length === 1) {
                        value = this.getInsertTextForGuessedValue(propertySchema.enum[0], "");
                    }
                    nValueProposals += propertySchema.enum.length;
                }
                if (typeof propertySchema.const !== "undefined") {
                    if (!value) {
                        value = this.getInsertTextForGuessedValue(propertySchema.const, "");
                    }
                    nValueProposals++;
                }
                if (Array.isArray(propertySchema.examples) &&
                    propertySchema.examples.length) {
                    if (!value) {
                        value = this.getInsertTextForGuessedValue(propertySchema.examples[0], "");
                    }
                    nValueProposals += propertySchema.examples.length;
                }
                if (value === undefined && nValueProposals === 0) {
                    let type = Array.isArray(propertySchema.type)
                        ? propertySchema.type[0]
                        : propertySchema.type;
                    if (!type) {
                        if (propertySchema.properties) {
                            type = "object";
                        }
                        else if (propertySchema.items) {
                            type = "array";
                        }
                    }
                    switch (type) {
                        case "boolean":
                            value = "#{}";
                            break;
                        case "string":
                            value = this.getInsertTextForString("");
                            break;
                        case "object":
                            value = "{#{}}";
                            break;
                        case "array":
                            value = "[#{}]";
                            break;
                        case "number":
                        case "integer":
                            value = "#{0}";
                            break;
                        case "null":
                            value = "#{null}";
                            break;
                        default:
                            // always advance the cursor after completing a property
                            value = "#{}";
                            break;
                    }
                }
            }
        }
        if (!value || nValueProposals > 1) {
            debug_1.debug.log("xxx", "value", value, "nValueProposals", nValueProposals, propertySchema);
            value = "#{}";
        }
        return resultText + value;
    }
    getInsertTextForPropertyName(key, rawWord) {
        return `"${key}"`;
    }
    getInsertTextForString(value, prf = "#") {
        return `"${prf}{${value}}"`;
    }
    // TODO: Is this actually working?
    getInsertTextForGuessedValue(value, separatorAfter = "") {
        switch (typeof value) {
            case "object":
                if (value === null) {
                    return "${null}" + separatorAfter;
                }
                return this.getInsertTextForValue(value, separatorAfter);
            case "string": {
                let snippetValue = JSON.stringify(value);
                snippetValue = snippetValue.substr(1, snippetValue.length - 2); // remove quotes
                snippetValue = this.getInsertTextForPlainText(snippetValue); // escape \ and }
                return this.getInsertTextForString(snippetValue, "$") + separatorAfter;
            }
            case "number":
            case "boolean":
                return "${" + JSON.stringify(value) + "}" + separatorAfter;
        }
        return this.getInsertTextForValue(value, separatorAfter);
    }
    getInsertTextForPlainText(text) {
        return text.replace(/[\\$}]/g, "\\$&"); // escape $, \ and }
    }
    getInsertTextForValue(value, separatorAfter) {
        const text = JSON.stringify(value, null, "\t");
        if (text === "{}") {
            return "{#{}}" + separatorAfter;
        }
        else if (text === "[]") {
            return "[#{}]" + separatorAfter;
        }
        return this.getInsertTextForPlainText(text + separatorAfter);
    }
    getValueCompletions(rootSchema, ctx, types, collector) {
        let node = (0, language_1.syntaxTree)(ctx.state).resolveInner(ctx.pos, -1);
        let valueNode = null;
        let parentKey = undefined;
        debug_1.debug.log("xxx", "getValueCompletions", node, ctx);
        if (node && (0, node_1.isPrimitiveValueNode)(node, this.mode)) {
            valueNode = node;
            node = node.parent;
        }
        if (!node) {
            this.addSchemaValueCompletions(rootSchema, types, collector);
            return;
        }
        if ((0, json_pointers_1.resolveTokenName)(node.name, this.mode) === constants_1.TOKENS.PROPERTY) {
            const keyNode = (0, node_1.getMatchingChildNode)(node, constants_1.TOKENS.PROPERTY_NAME, this.mode);
            if (keyNode) {
                parentKey = (0, node_1.getWord)(ctx.state.doc, keyNode);
                node = node.parent;
            }
        }
        debug_1.debug.log("xxx", "node", node, "parentKey", parentKey);
        if (node &&
            (parentKey !== undefined ||
                (0, json_pointers_1.resolveTokenName)(node.name, this.mode) === constants_1.TOKENS.ARRAY)) {
            // Get matching schemas
            const schemas = this.getSchemas(rootSchema, ctx);
            for (const s of schemas) {
                if (typeof s !== "object") {
                    return;
                }
                if ((0, json_pointers_1.resolveTokenName)(node.name, this.mode) === constants_1.TOKENS.ARRAY &&
                    s.items) {
                    let c = collector;
                    if (s.uniqueItems) {
                        c = Object.assign(Object.assign({}, c), { add(completion) {
                                if (!c.completions.has(completion.label)) {
                                    collector.add(completion);
                                }
                            },
                            reserve(key) {
                                collector.reserve(key);
                            } });
                    }
                    if (Array.isArray(s.items)) {
                        let arrayIndex = 0;
                        if (valueNode) {
                            // get index of next node in array
                            const foundIdx = (0, node_1.findNodeIndexInArrayNode)(node, valueNode, this.mode);
                            if (foundIdx >= 0) {
                                arrayIndex = foundIdx;
                            }
                        }
                        const itemSchema = s.items[arrayIndex];
                        if (itemSchema) {
                            this.addSchemaValueCompletions(itemSchema, types, c);
                        }
                    }
                    else {
                        this.addSchemaValueCompletions(s.items, types, c);
                    }
                }
                if (s.type == null || s.type !== "object") {
                    this.addSchemaValueCompletions(s, types, collector);
                }
                if (parentKey !== undefined) {
                    let propertyMatched = false;
                    if (s.properties) {
                        const propertySchema = s.properties[parentKey];
                        if (propertySchema) {
                            propertyMatched = true;
                            this.addSchemaValueCompletions(propertySchema, types, collector);
                        }
                    }
                    if (s.patternProperties && !propertyMatched) {
                        for (const pattern of Object.keys(s.patternProperties)) {
                            const regex = this.extendedRegExp(pattern);
                            if (regex === null || regex === void 0 ? void 0 : regex.test(parentKey)) {
                                propertyMatched = true;
                                const propertySchema = s.patternProperties[pattern];
                                if (propertySchema) {
                                    this.addSchemaValueCompletions(propertySchema, types, collector);
                                }
                            }
                        }
                    }
                    if (s.additionalProperties && !propertyMatched) {
                        const propertySchema = s.additionalProperties;
                        this.addSchemaValueCompletions(propertySchema, types, collector);
                    }
                }
                if (types["boolean"]) {
                    this.addBooleanValueCompletion(true, collector);
                    this.addBooleanValueCompletion(false, collector);
                }
                if (types["null"]) {
                    this.addNullValueCompletion(collector);
                }
            }
        }
        // TODO: We need to pass the from and to for the value node as well
        // TODO: What should be the from and to when the value node is null?
        // TODO: (NOTE: if we pass a prefix but no from and to, it will autocomplete the value but replace
        // TODO: the entire property nodewhich isn't what we want). Instead we need to change the from and to
        // TODO: based on the corresponding (relevant) value node
        const valuePrefix = valueNode
            ? (0, node_1.getWord)(ctx.state.doc, valueNode, true, false)
            : "";
        return {
            valuePrefix,
        };
    }
    addSchemaValueCompletions(schema, 
    // TODO this is buggy because it does not resolve refs, should hand down rootSchema and expand each ref
    // rootSchema: JSONSchema7,
    types, collector) {
        if (typeof schema === "object") {
            this.addEnumValueCompletions(schema, collector);
            this.addDefaultValueCompletions(schema, collector);
            this.collectTypes(schema, types);
            if (Array.isArray(schema.allOf)) {
                schema.allOf.forEach((s) => this.addSchemaValueCompletions(s, types, collector));
            }
            if (Array.isArray(schema.anyOf)) {
                schema.anyOf.forEach((s) => this.addSchemaValueCompletions(s, types, collector));
            }
            if (Array.isArray(schema.oneOf)) {
                schema.oneOf.forEach((s) => this.addSchemaValueCompletions(s, types, collector));
            }
        }
    }
    addDefaultValueCompletions(schema, collector, arrayDepth = 0) {
        let hasProposals = false;
        if (typeof schema.default !== "undefined") {
            let type = schema.type;
            let value = schema.default;
            for (let i = arrayDepth; i > 0; i--) {
                value = [value];
                type = "array";
            }
            const completionItem = Object.assign(Object.assign({ type: type === null || type === void 0 ? void 0 : type.toString() }, this.getAppliedValue(value)), { detail: "Default value" });
            collector.add(completionItem);
            hasProposals = true;
        }
        if (Array.isArray(schema.examples)) {
            schema.examples.forEach((example) => {
                let type = schema.type;
                let value = example;
                for (let i = arrayDepth; i > 0; i--) {
                    value = [value];
                    type = "array";
                }
                collector.add(Object.assign({ type: type === null || type === void 0 ? void 0 : type.toString() }, this.getAppliedValue(value)));
                hasProposals = true;
            });
        }
        if (!hasProposals &&
            typeof schema.items === "object" &&
            !Array.isArray(schema.items) &&
            arrayDepth < 5 /* beware of recursion */) {
            this.addDefaultValueCompletions(schema.items, collector, arrayDepth + 1);
        }
    }
    addEnumValueCompletions(schema, collector) {
        var _a, _b, _c;
        if (typeof schema.const !== "undefined") {
            collector.add(Object.assign(Object.assign({ type: (_a = schema.type) === null || _a === void 0 ? void 0 : _a.toString() }, this.getAppliedValue(schema.const)), { info: schema.description }));
        }
        if (Array.isArray(schema.enum)) {
            for (let i = 0, length = schema.enum.length; i < length; i++) {
                const enm = schema.enum[i];
                const appliedValue = this.getAppliedValue(enm);
                collector.add(Object.assign({ type: (_b = schema.type) === null || _b === void 0 ? void 0 : _b.toString(), info: (_c = this.constantDescriptions.get(appliedValue.label)) !== null && _c !== void 0 ? _c : schema.description }, appliedValue));
            }
        }
    }
    addBooleanValueCompletion(value, collector) {
        collector.add({
            type: "boolean",
            label: value ? "true" : "false",
        });
    }
    addNullValueCompletion(collector) {
        collector.add({
            type: "null",
            label: "null",
        });
    }
    collectTypes(schema, types) {
        if (Array.isArray(schema.enum) || typeof schema.const !== "undefined") {
            return;
        }
        const type = schema.type;
        if (Array.isArray(type)) {
            type.forEach((t) => (types[t] = true));
        }
        else if (type) {
            types[type] = true;
        }
    }
    getSchemas(rootSchema, ctx) {
        var _a, _b, _c;
        const { data: documentData } = this.parser(ctx.state);
        const draft = new json_schema_library_1.Draft07(rootSchema);
        let pointer = (0, json_pointers_1.jsonPointerForPosition)(ctx.state, ctx.pos, -1, this.mode);
        // TODO make jsonPointer consistent and compatible with json-schema-library by default (root path '/' or ' ' or undefined or '#', idk)
        if (pointer === "")
            pointer = undefined;
        if (pointer != null && pointer.endsWith("/")) {
            // opening new property under pointer
            // the property name is empty but json-schema-library would puke itself with a trailing slash, so we shouldn't even call it with that
            pointer = pointer.substring(0, pointer.length - 1);
            // when adding a new property, we just wanna return the possible properties if possible
            const effectiveSchemaOfPointer = getEffectiveObjectWithPropertiesSchema(this, rootSchema, documentData, pointer);
            if (effectiveSchemaOfPointer != null) {
                return [effectiveSchemaOfPointer];
            }
        }
        let parentPointer = pointer != null ? pointer.replace(/\/[^/]*$/, "") : undefined;
        if (parentPointer === "")
            parentPointer = undefined;
        // Pass parsed data to getSchema to get the correct schema based on the data context (e.g. for anyOf or if-then)
        const effectiveSchemaOfParent = getEffectiveObjectWithPropertiesSchema(this, rootSchema, documentData, parentPointer);
        const deepestPropertyKey = pointer === null || pointer === void 0 ? void 0 : pointer.split("/").pop();
        const pointerPointsToKnownProperty = deepestPropertyKey == null ||
            deepestPropertyKey in ((_a = effectiveSchemaOfParent === null || effectiveSchemaOfParent === void 0 ? void 0 : effectiveSchemaOfParent.properties) !== null && _a !== void 0 ? _a : {});
        // TODO upgrade json-schema-library, so this actually returns undefined if data and schema are incompatible (currently it sometimes pukes itself with invalid data and imagines schemas on-the-fly)
        let subSchema = draft.getSchema({
            pointer,
            data: documentData !== null && documentData !== void 0 ? documentData : undefined,
        });
        debug_1.debug.log("xxxx", "draft.getSchema", subSchema, "data", documentData, "pointer", pointer, "pointerPointsToKnownProperty", pointerPointsToKnownProperty);
        if ((0, json_schema_library_1.isJsonError)(subSchema)) {
            subSchema = (_b = subSchema.data) === null || _b === void 0 ? void 0 : _b.schema;
        }
        // if we don't have a schema for the current pointer, try the parent pointer with data to get a list of possible properties
        if (!isRealSchema(subSchema)) {
            if (effectiveSchemaOfParent) {
                return [effectiveSchemaOfParent];
            }
        }
        // then try the parent pointer without data
        if (!isRealSchema(subSchema)) {
            subSchema = draft.getSchema({ pointer: parentPointer });
            // TODO should probably only change pointer if it actually found a schema there, but i left it as-is
            pointer = parentPointer;
        }
        debug_1.debug.log("xxx", "pointer..", JSON.stringify(pointer));
        // For some reason, it returns undefined schema for the root pointer
        // We use the root schema in that case as the relevant (sub)schema
        if (!isRealSchema(subSchema) && (!pointer || pointer === "/")) {
            subSchema = (_c = expandSchemaProperty(rootSchema, rootSchema)) !== null && _c !== void 0 ? _c : rootSchema;
        }
        // const subSchema = new Draft07(this.dirtyCtx.rootSchema).getSchema(pointer);
        debug_1.debug.log("xxx", "subSchema..", subSchema);
        if (!subSchema) {
            return [];
        }
        if (Array.isArray(subSchema.allOf)) {
            return [
                subSchema,
                ...subSchema.allOf.map((s) => expandSchemaProperty(s, rootSchema)),
            ];
        }
        if (Array.isArray(subSchema.oneOf)) {
            return [
                subSchema,
                ...subSchema.oneOf.map((s) => expandSchemaProperty(s, rootSchema)),
            ];
        }
        if (Array.isArray(subSchema.anyOf)) {
            return [
                subSchema,
                ...subSchema.anyOf.map((s) => expandSchemaProperty(s, rootSchema)),
            ];
        }
        return [subSchema];
    }
    getAppliedValue(value) {
        const stripped = (0, node_1.stripSurroundingQuotes)(JSON.stringify(value));
        return {
            label: stripped,
            apply: JSON.stringify(value),
        };
    }
    getValueFromLabel(value) {
        return JSON.parse(value);
    }
    extendedRegExp(pattern) {
        let flags = "";
        if (pattern.startsWith("(?i)")) {
            pattern = pattern.substring(4);
            flags = "i";
        }
        try {
            return new RegExp(pattern, flags + "u");
        }
        catch (e) {
            // could be an exception due to the 'u ' flag
            try {
                return new RegExp(pattern, flags);
            }
            catch (e) {
                // invalid pattern
                return undefined;
            }
        }
    }
}
exports.JSONCompletion = JSONCompletion;
/**
 * provides a JSON schema enabled autocomplete extension for codemirror
 * @group Codemirror Extensions
 */
function jsonCompletion(opts = {}) {
    const completion = new JSONCompletion(opts);
    return function jsonDoCompletion(ctx) {
        return completion.doComplete(ctx);
    };
}
/**
 * removes required properties and allows additional properties everywhere
 * @param schema
 */
function makeSchemaLax(schema) {
    return (0, recordUtil_1.replacePropertiesDeeply)(schema, (key, value) => {
        if (key === "additionalProperties" && value === false) {
            return [];
        }
        if (key === "required" && Array.isArray(value)) {
            return [];
        }
        if (key === "unevaluatedProperties" && value === false) {
            return [];
        }
        if (key === "unevaluatedItems" && value === false) {
            return [];
        }
        // TODO remove dependencies and other restrictions
        // if (key === 'dependencies' && typeof value === 'object') {
        //   return Object.keys(value).reduce((acc: any, depKey) => {
        //     const depValue = value[depKey];
        //     if (Array.isArray(depValue)) {
        //       return acc;
        //     }
        //     return { ...acc, [depKey]: depValue };
        //   }, {});
        // }
        return [key, value];
    });
}
/**
 * determines effective object schema for given data
 * TODO support patternProperties, etc.
 * @param schema
 * @param data
 * @param pointer
 */
function getEffectiveObjectWithPropertiesSchema(jsonCompletionInstance, schema, data, pointer) {
    // TODO (unimportant): [performance] cache Draft07 in case it does some pre-processing? but does not seem to be significant
    const draft = new json_schema_library_1.Draft07(schema);
    const subSchema = draft.getSchema({
        pointer,
        data: data !== null && data !== void 0 ? data : undefined,
    });
    if (!isRealSchema(subSchema)) {
        return undefined;
    }
    const possibleDirectPropertyNames = getAllPossibleDirectStaticPropertyNames(jsonCompletionInstance, draft, subSchema);
    const effectiveProperties = {};
    for (let possibleDirectPropertyName of possibleDirectPropertyNames) {
        let propertyPointer = extendJsonPointer(pointer, possibleDirectPropertyName);
        const subSchemaForPropertyConsideringData = draft.getSchema({
            // TODO [performance] use subSchema and only check it's sub-properties
            pointer: propertyPointer,
            data: data !== null && data !== void 0 ? data : undefined,
            // pointer: `/${possibleDirectPropertyName}`,
            // schema: subSchema
        });
        if (isRealSchema(subSchemaForPropertyConsideringData)) {
            Object.assign(effectiveProperties, {
                [possibleDirectPropertyName]: subSchemaForPropertyConsideringData,
            });
        }
    }
    if (possibleDirectPropertyNames.length === 0 ||
        Object.keys(effectiveProperties).length === 0) {
        // in case json-schema-library behaves too weirdly and returns nothing, just return no schema too to let other cases handle this edge-case
        return undefined;
    }
    // TODO also resolve patternProperties of allOf, anyOf, oneOf
    const _a = subSchema, { allOf, anyOf, oneOf } = _a, subSchemaRest = __rest(_a, ["allOf", "anyOf", "oneOf"]);
    return Object.assign(Object.assign({}, subSchemaRest), { properties: effectiveProperties });
}
/**
 * static means not from patternProperties
 * @param rootDraft
 * @param schema
 */
function getAllPossibleDirectStaticPropertyNames(jsonCompletionInstance, rootDraft, schema) {
    var _a;
    schema = expandSchemaProperty(schema, rootDraft.rootSchema);
    if (typeof schema !== "object" || schema == null) {
        return [];
    }
    const possiblePropertyNames = [];
    function addFrom(subSchema) {
        const possiblePropertyNamesOfSubSchema = getAllPossibleDirectStaticPropertyNames(jsonCompletionInstance, rootDraft, subSchema);
        possiblePropertyNames.push(...possiblePropertyNamesOfSubSchema);
    }
    if (typeof schema.if === "object" && schema.if != null && ((_a = schema.if) === null || _a === void 0 ? void 0 : _a.properties) != null) {
        const propertyEntries = Object.values(schema.if.properties);
        for (const value of propertyEntries) {
            if (typeof value === "object" && value.const && value.description) {
                jsonCompletionInstance.constantDescriptions.set(value.const.toString(), value.description);
            }
        }
    }
    if (typeof schema.properties === "object" && schema.properties != null) {
        possiblePropertyNames.push(...Object.keys(schema.properties));
    }
    if (typeof schema.then === "object" && schema.then != null) {
        addFrom(schema.then);
    }
    if (Array.isArray(schema.allOf)) {
        for (const subSchema of schema.allOf) {
            addFrom(subSchema);
        }
    }
    if (Array.isArray(schema.anyOf)) {
        for (const subSchema of schema.anyOf) {
            addFrom(subSchema);
        }
    }
    if (Array.isArray(schema.oneOf)) {
        for (const subSchema of schema.oneOf) {
            addFrom(subSchema);
        }
    }
    return possiblePropertyNames;
}
function expandSchemaProperty(propertySchema, rootSchema) {
    if (typeof propertySchema === "object" && propertySchema.$ref) {
        const refSchema = getReferenceSchema(rootSchema, propertySchema.$ref);
        if (typeof refSchema === "object") {
            const dereferenced = Object.assign(Object.assign({}, propertySchema), refSchema);
            Reflect.deleteProperty(dereferenced, "$ref");
            return dereferenced;
        }
    }
    return propertySchema;
}
function getReferenceSchema(schema, ref) {
    const refPath = ref.split("/");
    let curReference = schema;
    refPath.forEach((cur) => {
        if (!cur) {
            return;
        }
        if (cur === "#") {
            curReference = schema;
            return;
        }
        if (typeof curReference === "object") {
            curReference = curReference[cur];
        }
    });
    return curReference;
}
function extendJsonPointer(pointer, key) {
    return pointer === undefined ? `/${key}` : `${pointer}/${key}`;
}
