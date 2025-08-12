export function el(tagName, attributes, children = []) {
    const e = document.createElement(tagName);
    Object.entries(attributes).forEach(([k, v]) => {
        if (k === "text") {
            e.innerText = v;
            return;
        }
        if (k === "inner") {
            e.innerHTML = v;
            return;
        }
        e.setAttribute(k, v);
    });
    children.forEach((c) => e.appendChild(c));
    return e;
}
