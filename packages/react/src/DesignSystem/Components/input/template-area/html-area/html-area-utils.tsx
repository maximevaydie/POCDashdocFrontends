/**Escape html tags in a text to make sure that it will be just text in html.  */
export const escapeHtml = (unsafeText: string): string => {
    return unsafeText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(" ", "&nbsp;");
};

/** Turns an html text into a string with the same value. */
export const unEscapeHtml = (safeText: string): string => {
    return safeText
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x3A;/g, ":")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
};
