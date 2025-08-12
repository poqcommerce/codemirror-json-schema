import { JSONSchema7 } from "json-schema";
/**
 * Full featured cm6 extension for json, including `@codemirror/lang-json`
 * @group Bundled Codemirror Extensions
 */
export declare function jsonSchema(schema?: JSONSchema7): ({
    extension: import("@codemirror/state").Extension;
} | readonly import("@codemirror/state").Extension[])[];
