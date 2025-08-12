"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWithOr = void 0;
// a little english-centric utility
// to join members of an array with commas and "or"
const joinWithOr = (arr, getPath) => {
    const needsComma = arr.length > 2;
    let data = arr.map((err, i) => {
        const result = `\`` + (getPath ? getPath(err) : err) + `\``;
        if (i === arr.length - 1)
            return "or " + result;
        return result;
    });
    if (needsComma) {
        return data.join(", ");
    }
    return data.join(" ");
};
exports.joinWithOr = joinWithOr;
