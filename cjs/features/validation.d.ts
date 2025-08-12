import type { EditorView, ViewUpdate } from "@codemirror/view";
import { type Diagnostic } from "@codemirror/lint";
import { type JsonError } from "json-schema-library";
import { JSONMode } from "../types";
import { DocumentParser } from "../parsers";
export interface JSONValidationOptions {
    mode?: JSONMode;
    formatError?: (error: JsonError) => string;
    jsonParser?: DocumentParser;
}
export declare const handleRefresh: (vu: ViewUpdate) => boolean;
/**
 * Helper for simpler class instantiaton
 * @group Codemirror Extensions
 */
export declare function jsonSchemaLinter(options?: JSONValidationOptions): (view: EditorView) => Diagnostic[];
export declare class JSONValidation {
    private options?;
    private schema;
    private mode;
    private parser;
    constructor(options?: JSONValidationOptions | undefined);
    private get schemaTitle();
    private rewriteError;
    doValidation(view: EditorView): Diagnostic[];
}
