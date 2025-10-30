import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { JSONMode } from "../types";
import { DocumentParser } from "../parsers";
export interface JSONCompletionOptions {
    mode?: JSONMode;
    jsonParser?: DocumentParser;
}
export declare class JSONCompletion {
    private opts;
    private originalSchema;
    /**
     * Inlined (expanded) top-level $ref if present.
     */
    private schema;
    /**
     * Inlined (expanded) top-level $ref if present.
     * Does not contain any required properties and allows any additional properties everywhere.
     */
    private laxSchema;
    private mode;
    private parser;
    constantDescriptions: Map<string, string>;
    constructor(opts: JSONCompletionOptions);
    doComplete(ctx: CompletionContext): never[] | CompletionResult;
    private doCompleteForSchema;
    private applySnippetCompletion;
    private getPropertyCompletions;
    private getInsertTextForProperty;
    private getInsertTextForPropertyName;
    private getInsertTextForString;
    private getInsertTextForGuessedValue;
    private getInsertTextForPlainText;
    private getInsertTextForValue;
    private getValueCompletions;
    private addSchemaValueCompletions;
    private addDefaultValueCompletions;
    private addEnumValueCompletions;
    private addBooleanValueCompletion;
    private addNullValueCompletion;
    private collectTypes;
    private getSchemas;
    private getAppliedValue;
    private getValueFromLabel;
    private extendedRegExp;
}
/**
 * provides a JSON schema enabled autocomplete extension for codemirror
 * @group Codemirror Extensions
 */
export declare function jsonCompletion(opts?: JSONCompletionOptions): (ctx: CompletionContext) => never[] | CompletionResult;
