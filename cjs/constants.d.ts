export declare const TOKENS: {
    readonly STRING: "String";
    readonly NUMBER: "Number";
    readonly TRUE: "True";
    readonly FALSE: "False";
    readonly NULL: "Null";
    readonly OBJECT: "Object";
    readonly ARRAY: "Array";
    readonly PROPERTY: "Property";
    readonly PROPERTY_NAME: "PropertyName";
    readonly PROPERTY_COLON: "PropertyColon";
    readonly ITEM: "Item";
    readonly JSON_TEXT: "JsonText";
    readonly INVALID: "⚠";
};
export declare const YAML_TOKENS_MAPPING: Record<string, (typeof TOKENS)[keyof typeof TOKENS]>;
export declare const JSON5_TOKENS_MAPPING: Record<string, (typeof TOKENS)[keyof typeof TOKENS]>;
export declare const PRIMITIVE_TYPES: ("String" | "Number" | "True" | "False" | "Null")[];
export declare const COMPLEX_TYPES: ("Object" | "Array" | "Item")[];
export declare const MODES: {
    readonly JSON: "json4";
};
