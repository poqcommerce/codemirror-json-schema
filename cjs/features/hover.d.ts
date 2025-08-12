import { type EditorView, Tooltip } from "@codemirror/view";
import { type Draft, JsonSchema } from "json-schema-library";
import { JSONMode, Side } from "../types";
export type CursorData = {
    schema?: JsonSchema;
    pointer: string;
};
export type FoundCursorData = Required<CursorData>;
export type HoverTexts = {
    message: string;
    typeInfo: string;
};
export type HoverOptions = {
    mode?: JSONMode;
    /**
     * Generate the text to display in the hover tooltip
     */
    getHoverTexts?: (data: FoundCursorData) => HoverTexts;
    /**
     * Generate the hover tooltip HTML
     */
    formatHover?: (data: HoverTexts) => HTMLElement;
    /**
     * Provide a custom parser for the document
     * @default JSON.parse
     */
    parser?: (text: string) => any;
};
/**
 * provides a JSON schema enabled tooltip extension for codemirror
 * @group Codemirror Extensions
 */
export declare function jsonSchemaHover(options?: HoverOptions): (view: EditorView, pos: number, side: Side) => Promise<Tooltip | null>;
export declare class JSONHover {
    private opts?;
    private schema;
    private mode;
    constructor(opts?: HoverOptions | undefined);
    getDataForCursor(view: EditorView, pos: number, side: Side): CursorData | null;
    private formatMessage;
    getHoverTexts(data: FoundCursorData, draft: Draft): HoverTexts;
    doHover(view: EditorView, pos: number, side: Side): Promise<Tooltip | null>;
}
