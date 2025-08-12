"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONValidation = exports.handleRefresh = void 0;
exports.jsonSchemaLinter = jsonSchemaLinter;
const json_schema_library_1 = require("json-schema-library");
const state_1 = require("./state");
const formatting_1 = require("../utils/formatting");
const dom_1 = require("../utils/dom");
const markdown_1 = require("../utils/markdown");
const constants_1 = require("../constants");
const debug_1 = require("../utils/debug");
const parsers_1 = require("../parsers");
// return an object path that matches with the json-source-map pointer
const getErrorPath = (error) => {
    var _a, _b, _c;
    // if a pointer is present, return without #
    if (((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.pointer) && ((_b = error === null || error === void 0 ? void 0 : error.data) === null || _b === void 0 ? void 0 : _b.pointer) !== "#") {
        return error.data.pointer.slice(1);
    }
    // return plain data.property if present
    if ((_c = error === null || error === void 0 ? void 0 : error.data) === null || _c === void 0 ? void 0 : _c.property) {
        return `/${error.data.property}`;
    }
    // else, return the empty pointer to represent the whole document
    return "";
};
const handleRefresh = (vu) => {
    return (vu.startState.field(state_1.schemaStateField) !== vu.state.field(state_1.schemaStateField));
};
exports.handleRefresh = handleRefresh;
/**
 * Helper for simpler class instantiaton
 * @group Codemirror Extensions
 */
function jsonSchemaLinter(options) {
    const validation = new JSONValidation(options);
    return (view) => {
        return validation.doValidation(view);
    };
}
// all the error types that apply to a specific key or value
const positionalErrors = [
    "NoAdditionalPropertiesError",
    "RequiredPropertyError",
    "InvalidPropertyNameError",
    "ForbiddenPropertyError",
    "UndefinedValueError",
];
class JSONValidation {
    constructor(options) {
        var _a, _b, _c, _d;
        this.options = options;
        this.schema = null;
        this.mode = constants_1.MODES.JSON;
        // rewrite the error message to be more human readable
        this.rewriteError = (error) => {
            var _a, _b, _c, _d, _e;
            const errorData = error === null || error === void 0 ? void 0 : error.data;
            const errors = errorData === null || errorData === void 0 ? void 0 : errorData.errors;
            if (error.code === "one-of-error" && (errors === null || errors === void 0 ? void 0 : errors.length)) {
                return `Expected one of ${(0, formatting_1.joinWithOr)(errors, (data) => data.data.expected)}`;
            }
            if (error.code === "type-error") {
                return `Expected \`${((_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.expected) && Array.isArray((_b = error === null || error === void 0 ? void 0 : error.data) === null || _b === void 0 ? void 0 : _b.expected)
                    ? (0, formatting_1.joinWithOr)((_c = error === null || error === void 0 ? void 0 : error.data) === null || _c === void 0 ? void 0 : _c.expected)
                    : (_d = error === null || error === void 0 ? void 0 : error.data) === null || _d === void 0 ? void 0 : _d.expected}\` but received \`${(_e = error === null || error === void 0 ? void 0 : error.data) === null || _e === void 0 ? void 0 : _e.received}\``;
            }
            const message = error.message
                // don't mention root object
                .replaceAll("in `#` ", "")
                .replaceAll("at `#`", "")
                .replaceAll("/", ".")
                .replaceAll("#.", "");
            return message;
        };
        this.mode = (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.mode) !== null && _b !== void 0 ? _b : constants_1.MODES.JSON;
        this.parser = (_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.jsonParser) !== null && _d !== void 0 ? _d : (0, parsers_1.getDefaultParser)(this.mode);
        // TODO: support other versions of json schema.
        // most standard schemas are draft 4 for some reason, probably
        // backwards compatibility
        //
        // ajv did not support draft 4, so I used json-schema-library
    }
    get schemaTitle() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.schema) === null || _a === void 0 ? void 0 : _a.getSchema()) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : "json-schema";
    }
    // validate using view as the linter extension signature requires
    doValidation(view) {
        const schema = (0, state_1.getJSONSchema)(view.state);
        if (!schema) {
            return [];
        }
        this.schema = new json_schema_library_1.Draft04(schema);
        if (!this.schema)
            return [];
        const text = view.state.doc.toString();
        // ignore blank json strings
        if (!(text === null || text === void 0 ? void 0 : text.length))
            return [];
        const json = this.parser(view.state);
        // skip validation if parsing fails
        if (json.data == null)
            return [];
        let errors = [];
        try {
            errors = this.schema.validate(json.data);
        }
        catch (_a) { }
        debug_1.debug.log("xxx", "validation errors", errors, json.data);
        if (!errors.length)
            return [];
        // reduce() because we want to filter out errors that don't have a pointer
        return errors.reduce((acc, error) => {
            const pushRoot = () => {
                const errorString = this.rewriteError(error);
                acc.push({
                    from: 0,
                    to: 0,
                    message: errorString,
                    severity: "error",
                    source: this.schemaTitle,
                    renderMessage: () => {
                        const dom = (0, dom_1.el)("div", {});
                        dom.innerHTML = (0, markdown_1.renderMarkdown)(errorString);
                        return dom;
                    },
                });
            };
            const errorPath = getErrorPath(error);
            const pointer = json.pointers.get(errorPath);
            if (error.name === "MaxPropertiesError" ||
                error.name === "MinPropertiesError" ||
                errorPath === "" // root level type errors
            ) {
                pushRoot();
            }
            else if (pointer) {
                // if the error is a property error, use the key position
                const isKeyError = positionalErrors.includes(error.name);
                const errorString = this.rewriteError(error);
                const from = isKeyError ? pointer.keyFrom : pointer.valueFrom;
                const to = isKeyError ? pointer.keyTo : pointer.valueTo;
                // skip error if no from/to value is found
                if (to !== undefined && from !== undefined) {
                    acc.push({
                        from,
                        to,
                        message: errorString,
                        renderMessage: () => {
                            const dom = (0, dom_1.el)("div", {});
                            dom.innerHTML = (0, markdown_1.renderMarkdown)(errorString);
                            return dom;
                        },
                        severity: "error",
                        source: this.schemaTitle,
                    });
                }
            }
            else {
                pushRoot();
            }
            return acc;
        }, []);
    }
}
exports.JSONValidation = JSONValidation;
