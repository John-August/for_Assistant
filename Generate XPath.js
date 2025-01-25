// SRT Generate XPath for an element
function getElementXPath(element) {
    if (element.id) {
        return `//*[@id='${element.id}']`;
    }
    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let siblingIndex = 0;
        let sibling = element;
        while ((sibling = sibling.previousElementSibling) != null) {
            siblingIndex++;
        }
        const tagName = element.tagName.toLowerCase();
        const pathIndex = siblingIndex ? `[${siblingIndex + 1}]` : "";
        parts.unshift(`${tagName}${pathIndex}`);
        element = element.parentNode;
    }
    return parts.length ? "/" + parts.join("/") : null;
}
// END Generate XPath for an element
