import { MODES } from "./constants";
export type RequiredPick<T, F extends keyof T> = Omit<T, F> & Required<Pick<T, F>>;
export type JSONPartialPointerData = {
    keyFrom: number;
    keyTo: number;
};
export type JSONPointerData = {
    keyFrom: number;
    keyTo: number;
    valueFrom: number;
    valueTo: number;
};
export type Side = -1 | 1 | 0 | undefined;
export type JSONPointersMap = Map<string, JSONPointerData | JSONPartialPointerData>;
export type JSONMode = (typeof MODES)[keyof typeof MODES];
