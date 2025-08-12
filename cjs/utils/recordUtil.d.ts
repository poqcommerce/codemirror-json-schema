export declare function getRecordEntries<K extends keyof any, V>(record: Record<K, V>): [K, V][];
export type PropertyReplacer = (key: string | symbol, value: unknown) => [string | symbol, unknown] | [string | symbol, unknown][];
export declare function replacePropertiesDeeply<T>(object: T, getReplacement: PropertyReplacer): T;
export declare function removeUndefinedValuesOnRecord<K extends keyof any, V>(record: Record<K, V | undefined>): Record<K, V>;
