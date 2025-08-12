// a little english-centric utility
// to join members of an array with commas and "or"
export const joinWithOr = (arr, getPath) => {
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
