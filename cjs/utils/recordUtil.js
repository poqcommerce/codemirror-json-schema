"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecordEntries = getRecordEntries;
exports.replacePropertiesDeeply = replacePropertiesDeeply;
exports.removeUndefinedValuesOnRecord = removeUndefinedValuesOnRecord;
function getRecordEntries(record) {
    return Object.entries(record);
}
function replacePropertiesDeeply(object, getReplacement) {
    if (typeof object === "string") {
        return object;
    }
    if (typeof object !== "object" || object === null) {
        return object;
    }
    if (Array.isArray(object)) {
        return object.map((element) => replacePropertiesDeeply(element, getReplacement));
    }
    if (object instanceof Map) {
        const newMap = new Map();
        for (const [key, value] of object) {
            const newKey = key;
            const newValue = replacePropertiesDeeply(value, getReplacement);
            newMap.set(newKey, newValue);
        }
        return newMap;
    }
    if (object instanceof Set) {
        const newSet = new Set();
        for (const value of object) {
            const newValue = replacePropertiesDeeply(value, getReplacement);
            newSet.add(newValue);
        }
        return newSet;
    }
    // assertAlways(object instanceof Object);
    const newObject = {};
    function handleReplacementEntry(oldKey, oldValue, newKey, newValue) {
        if (newKey === oldKey && newValue === oldValue) {
            newObject[newKey] = replacePropertiesDeeply(oldValue, getReplacement);
        }
        else {
            newObject[newKey] = newValue;
        }
    }
    for (const [key, value] of getRecordEntries(object)) {
        const replacement = getReplacement(key, value);
        if (replacement.length === 2 && typeof replacement[0] === "string") {
            handleReplacementEntry(key, value, replacement[0], replacement[1]);
        }
        else {
            for (const [newKey, newValue] of replacement) {
                handleReplacementEntry(key, value, newKey, newValue);
            }
        }
    }
    return newObject;
}
function removeUndefinedValuesOnRecord(record) {
    const newRecord = {};
    for (const [key, value] of getRecordEntries(record)) {
        if (value === undefined) {
            continue;
        }
        newRecord[key] = value;
    }
    return newRecord;
}
