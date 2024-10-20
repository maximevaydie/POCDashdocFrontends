import {linesToXAst, xastToLines} from "./x-ast/normalisation-helper";
import {InlineToken, XAst, XInlineToken} from "./x-ast/xast-types";

const inlineTokenToTemplate = (token: XInlineToken): string => {
    if (token.type === "caret") {
        return "";
    }
    if (token.type === "text") {
        return token.content;
    }
    if (token.type === "variable") {
        return `[[${token.id}]]`;
    }
    // Normally "special" token must not contain any text characters
    // However in BUG-3337, a "special" token containing a character has been encountered, so we handle it here.
    if (token.type === "special") {
        return token.content.map((token) => inlineTokenToTemplate(token).trim()).join("");
    }
    return "";
};

export const linesToTemplate = (lines: XInlineToken[][]): string => {
    return lines.map((line) => line.map(inlineTokenToTemplate).join("")).join("\n");
};
export const xastToTemplate = (ast: XAst): string => {
    const lines = xastToLines(ast);
    return linesToTemplate(lines);
};

/** Read a line and parse the element surrounded by double bracket */
export const parseTemplateLine = (
    text: string,
    getVariableLabel = (id: string) => id
): InlineToken[] => {
    let content: InlineToken[] = [];
    let currentString = "";
    let seenFirstBracket = false;
    let parsingObject = false;
    for (let i = 0; i < text.length; i++) {
        const bracket = parsingObject ? "]" : "[";
        if (text[i] === bracket) {
            if (seenFirstBracket) {
                currentString = currentString.slice(0, -1);
                if (parsingObject) {
                    content.push({
                        type: "variable",
                        id: currentString,
                        content: [{type: "text", content: getVariableLabel(currentString)}],
                    });
                } else {
                    content.push({type: "text", content: currentString});
                }
                currentString = "";
                seenFirstBracket = false;
                parsingObject = !parsingObject;
            } else {
                seenFirstBracket = true;
                currentString += text[i];
            }
        } else {
            seenFirstBracket = false;
            currentString += text[i];
        }
    }
    if (currentString !== "") {
        content.push({type: "text", content: currentString});
    }
    return content;
};

/** Read a text and parse */
export const parseTemplate = (text: string): XInlineToken[][] => {
    const lines = text.split("\n");
    const tokenLines: InlineToken[][] = lines.map((line) => parseTemplateLine(line));
    // We're sure we have at least one line
    // We add a caret at the end of the last line (we know there's no caret elsewhere because tokenLines is of type InlineToken[][])
    const xTokenLines: XInlineToken[][] = tokenLines;
    xTokenLines[tokenLines.length - 1].push({type: "caret", direction: "both"});
    return xTokenLines;
};

export const templateToXast = (template: string): XAst => {
    const lines = parseTemplate(template);
    return linesToXAst(lines);
};

export const applyTemplate = (
    template: string,
    variableAssignment: Record<string, string | number | undefined | null>
): string => {
    return template.replace(/\[\[(.*?)\]\]/g, (text: string) => {
        const tagKey = text.substring(2, text.length - 2);
        return `${variableAssignment[tagKey]}`;
    });
};
