//// Lines

import {containsCaret} from "./xast-helper";
import {XAst, XInlineToken} from "./xast-types";

export const lastNonCaretToken = (line: XInlineToken[]): XInlineToken | undefined => {
    for (let i = line.length - 1; i >= 0; i--) {
        const token = line[i];
        if (token.type !== "caret") {
            return token;
        }
    }
    return undefined;
};

/** Here lines are supposed to contain no special other than 1space one, and  does not end with a special */
export const mergeNormalizedLines = (
    line1: XInlineToken[],
    line2: XInlineToken[]
): XInlineToken[] => {
    const mergedLine: XInlineToken[] = [...line1];
    // if line2 starts with a variable and line 1 is empty or ends with a variable, add a special before line2
    if (
        line2.length > 0 &&
        line2[0].type === "variable" &&
        // @ts-ignore
        (lastNonCaretToken(line1) === undefined || lastNonCaretToken(line1).type === "variable")
    ) {
        mergedLine.push({type: "special", content: [{type: "text", content: " "}]});
    }
    mergedLine.push(...line2);
    return mergedLine;
};

export const isSpecialSpace = (token: XInlineToken): boolean => {
    return (
        token.type === "special" &&
        token.content.length === 1 &&
        token.content[0].type === "text" &&
        (token.content[0].content === " " || token.content[0].content === "\xa0")
    );
};

/** Extract the different lines of an AST */
export const xastToLines = (ast: XAst): XInlineToken[][] => {
    const lines: XInlineToken[][] = [];

    let line: XInlineToken[] = [];
    /** Tell if the line is empty OR contains only carets */
    let is_line_empty = true;
    for (const token of ast) {
        if (token.type === "div") {
            if (!is_line_empty) {
                lines.push(line);
            }

            const divLines = xastToLines(token.content);
            lines.push(...divLines);
            line = [];
            continue;
        }
        line.push(token);
        if (token.type !== "caret") {
            is_line_empty = false;
        }
    }
    if (line.length > 0 || lines.length === 0) {
        lines.push(line);
    }
    return lines;
};

export const normalizeLine = (
    line: XInlineToken[],
    getVariableLabel: (id: string) => string
): XInlineToken[] => {
    let newLine: XInlineToken[] = [];
    for (const token of line) {
        if (token.type === "text" && token.content.length > 0) {
            newLine.push(token);
        }
        if (
            token.type === "text" &&
            token.content.length === 0 &&
            (token.endCaretOffset !== undefined || token.startCaretOffset !== undefined)
        ) {
            if (token.endCaretOffset !== undefined && token.startCaretOffset !== undefined) {
                newLine.push({type: "caret", direction: "both"});
            } else if (token.endCaretOffset === undefined) {
                newLine.push({type: "caret", direction: "start"});
            } else {
                newLine.push({type: "caret", direction: "end"});
            }
        }
        if (token.type === "variable") {
            const previousNonCaretToken = lastNonCaretToken(newLine);
            if (previousNonCaretToken === undefined || previousNonCaretToken.type === "variable") {
                if (containsCaret(token.content)) {
                    newLine.push({
                        type: "text",
                        content: " ",
                        startCaretOffset: 1,
                        endCaretOffset: 1,
                    });
                } else {
                    newLine.push({
                        type: "special",
                        content: [{type: "text", content: " "}],
                    });
                }
            } else if (previousNonCaretToken.type === "text" && containsCaret(token.content)) {
                previousNonCaretToken.endCaretOffset = previousNonCaretToken.content.length;
                previousNonCaretToken.startCaretOffset = previousNonCaretToken.content.length;
            }
            newLine.push({
                type: "variable",
                id: token.id,
                content: [{type: "text", content: getVariableLabel(token.id)}],
            });
        }
        if (token.type === "special") {
            // We don't keep specials unless there's content is not an the " " string
            // in which case we turn it into a text token.
            if (
                token.content.length === 0 ||
                (isSpecialSpace(token) && !containsCaret(token.content))
            ) {
                continue;
            }
            const normalizedContent = normalizeLine(token.content, getVariableLabel);
            newLine = mergeNormalizedLines(newLine, normalizedContent);
        }
        if (token.type === "caret") {
            newLine.push(token);
        }
    }
    return newLine;
};

export const finishNormalizingLine: (line: XInlineToken[]) => XInlineToken[] = (line) => {
    const newLine: XInlineToken[] = [...line];
    const lastToken = lastNonCaretToken(newLine);
    if (lastToken !== undefined && lastToken.type === "variable") {
        newLine.push({
            type: "special",
            content: [{type: "text", content: " "}],
        });
    }
    return newLine;
};

export const normalizeLines = (
    lines: XInlineToken[][],
    getVariableLabel: (id: string) => string
): XInlineToken[][] => {
    return lines.map((line) => finishNormalizingLine(normalizeLine(line, getVariableLabel)));
};

export const linesToXAst = (lines: XInlineToken[][]): XAst => {
    return lines.map((line) => ({type: "div", content: line}));
};

export const normalizeXAst = (xast: XAst, getVariableLabel: (id: string) => string): XAst => {
    return linesToXAst(normalizeLines(xastToLines(xast), getVariableLabel));
};

// TO STRING
const inlineTokenToString = (token: XInlineToken): string => {
    if (token.type === "caret") {
        switch (token.direction) {
            case "start":
                return "👉";
            case "end":
                return "👈";
            default:
                return "🖋";
        }
    }
    if (token.type === "text") {
        let content = token.content;
        if (token.startCaretOffset !== undefined) {
            let caret = "👉";
            if (token.endCaretOffset === token.startCaretOffset) {
                caret = "🖋";
            }
            content =
                content.substring(0, token.startCaretOffset) +
                caret +
                content.substring(token.startCaretOffset);
        }
        if (
            token.endCaretOffset !== undefined &&
            token.endCaretOffset !== token.startCaretOffset
        ) {
            let realOffset = token.endCaretOffset;
            if (
                token.startCaretOffset !== undefined &&
                token.startCaretOffset < token.endCaretOffset
            ) {
                realOffset += 1;
            }
            content = content.substring(0, realOffset) + "👈" + content.substring(realOffset);
        }
        return '"' + content + '"';
    }
    if (token.type === "variable") {
        return `🔹[${token.id}] ${token.content.map(inlineTokenToString).join("")}🔹`;
    }
    return `🔻${token.content.map(inlineTokenToString).join("")}🔻`;
};

export const linesToString = (lines: XInlineToken[][]): string => {
    return lines.map((line) => "• " + line.map(inlineTokenToString).join("")).join("\n");
};
export const xastToString = (ast: XAst): string => {
    const lines = xastToLines(ast);
    return linesToString(lines);
};
