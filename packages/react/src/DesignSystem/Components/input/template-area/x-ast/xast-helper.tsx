import {theme} from "@dashdoc/web-ui";
import {Parser as HtmlParser} from "htmlparser2";

import {HtmlPosition, HtmlSelection} from "../html-area/html-area-helper";
import {escapeHtml, unEscapeHtml} from "../html-area/html-area-utils";

import {Ast, BlockToken, InlineToken, XAst, XInlineToken, XTextToken} from "./xast-types";

const specialElementHtml = (htmlContent: string, debug = false): string => {
    return `<span data-special="true" ${debug ? 'style="background-color: red;"' : ""}>${
        htmlContent === " " ? "&nbsp;" : htmlContent
    }</span>`;
};

/**Returns the html code of a variable component */
export const variableHtml = (
    variableId: string,
    label: string,
    escapeContent = true,
    withLabel = false,
    variableStyle = {
        color: theme.colors.blue.dark,
        backgroundColor: theme.colors.blue.ultralight,
        borderRadius: "5px",
    }
): string => {
    const style: [string, string][] = [
        ["display", "inline"],
        ["color", variableStyle.color],
        ["background-color", variableStyle.backgroundColor],
        ["border-radius", variableStyle.borderRadius],
        ["padding", withLabel ? "0px 12px" : "4px 12px"],
    ];
    const styleString = style.map(([key, value]) => `${key}: ${value}`).join(";");
    const props: [string, string][] = [
        ["contenteditable", "false"],
        ["style", styleString],
        ["data-variableid", escapeHtml(variableId)],
    ];
    const propString = props.map(([key, value]) => `${key}="${value}"`).join(" ");
    const content = escapeContent ? escapeHtml(label) : label;
    return `<span ${propString}>${content}</span>`;
};

export const mergeAdjacentTextNodes = (ast: Ast): Ast => {
    const newAst = [...ast];
    for (let i = 0; i < newAst.length; i++) {
        const token = newAst[i];
        if (token.type === "text") {
            if (i + 1 < newAst.length && newAst[i + 1].type === "text") {
                newAst[i + 1].content = token.content + newAst[i + 1].content;
                newAst.splice(i, 1);
                i--;
            }
        } else if (token.type === "div") {
            token.content = mergeAdjacentTextNodes(token.content);
        } else {
            token.content = mergeAdjacentTextNodes(token.content) as InlineToken[];
        }
    }
    return newAst;
};

export const htmlToAst = (html: string): Ast | undefined => {
    let ast: Ast = [];
    const stack: (InlineToken | BlockToken)[] = [];
    const top = () => (stack.length === 0 ? null : stack[stack.length - 1]);
    const parser = new HtmlParser({
        onopentag(name, attributes) {
            if (name === "div") {
                stack.push({type: "div", content: []});
                return;
            }
            if (name === "span" && attributes["data-variableid"]) {
                stack.push({
                    type: "variable",
                    id: unEscapeHtml(attributes["data-variableid"]),
                    content: [],
                });
                return;
            }
            if (name === "span" && attributes["data-special"]) {
                stack.push({type: "special", content: []});
                return;
            }
            if (name === "br") {
                //ignore
                return;
            }

            throw new Error(`Unknown tag ${name}`);
        },
        ontext(text) {
            const cleanText = unEscapeHtml(text);
            const stackTop = top();
            if (stackTop === null) {
                ast.push({type: "text", content: cleanText});
                return;
            }
            if (stackTop.type === "text") {
                throw new Error("Unreachable (text in the stack)");
            }
            stackTop.content.push({type: "text", content: cleanText});
        },
        onclosetag(tag) {
            if (tag === "br") {
                //ignore
                return;
            }
            if (top() === null) {
                throw new Error("More closing tags than opening tags: " + tag);
            }
            const token = stack.pop();
            const stackTop = top();
            if (stackTop === null) {
                // @ts-ignore
                ast.push(token);
                return;
            }
            if (stackTop.type === "text") {
                throw new Error("Unreachable (text in the stack)");
            }
            // @ts-ignore
            if (stackTop.type !== "div" && token.type !== "div") {
                throw new Error("Unexpected, putting a block in an inline");
            }
            stackTop.content.push(token as InlineToken);
        },
    });
    try {
        parser.write(html);
        parser.end();
    } catch (e) {
        return undefined;
    }
    const normalizedAst = mergeAdjacentTextNodes(ast);
    return normalizedAst;
};

export const astToHtml = (ast: Ast, withLabel = false): string => {
    let html = "";
    for (const token of ast) {
        if (token.type === "text") {
            html += escapeHtml(token.content);
        }
        if (token.type === "variable") {
            html += variableHtml(token.id, astToHtml(token.content, withLabel), false, withLabel);
        }
        if (token.type === "special") {
            html += specialElementHtml(astToHtml(token.content, withLabel));
        }
        if (token.type === "div") {
            if (token.content.length === 0) {
                html += "<div><br></div>";
            } else {
                html += `<div>${astToHtml(token.content, withLabel)}</div>`;
            }
        }
    }
    return html;
};

export const injectCaretAtPosition = (
    ast: XAst,
    caretType: "start" | "end" | "both",
    position: HtmlPosition
): XAst => {
    const newAst = [...ast];
    if (position.successors.length === 0) {
        let offset = position.offset;
        if (position.offset > ast.length) {
            offset = ast.length;
        }
        newAst.splice(offset, 0, {type: "caret", direction: caretType});
        return newAst;
    }
    let [child, ...childSuccesors] = position.successors;
    if (child >= newAst.length) {
        child = newAst.length - 1;
    }
    if (ast[child].type === "text") {
        let newToken = {...ast[child]} as XTextToken;
        let offset = position.offset;
        if (offset > newToken.content.length) {
            offset = newToken.content.length;
        }
        if (caretType === "start" || caretType === "both") {
            newToken.startCaretOffset = offset;
        }
        if (caretType === "end" || caretType === "both") {
            newToken.endCaretOffset = offset;
        }
        newAst[child] = newToken;
        return newAst;
    }
    const newChild = {...ast[child]} as any;
    newChild.content = injectCaretAtPosition(newChild.content, caretType, {
        successors: childSuccesors,
        offset: position.offset,
    });
    newAst[child] = newChild;
    return newAst;
};

export const injectSelection = (ast: Ast, selection: HtmlSelection): XAst => {
    if (selection === undefined) {
        return ast;
    }
    if (selection.type === "position") {
        return injectCaretAtPosition(ast, "both", selection.position);
    }
    let newAst = injectCaretAtPosition(ast, "start", selection.positions[0]);
    return injectCaretAtPosition(newAst, "end", selection.positions[1]);
};

//Extract all the caret positions in an xast from a selection
export const extractPositions = (xast: XAst): HtmlPosition[] => {
    const positions: HtmlPosition[] = [];
    let childCaretCount = 0;
    for (let i = 0; i < xast.length; i++) {
        const token = xast[i];
        let realPosition = i - childCaretCount;
        if (token.type === "caret") {
            positions.push({
                successors: [],
                offset: realPosition,
            });
            childCaretCount++;
        } else if (token.type === "text") {
            if (token.startCaretOffset !== undefined) {
                positions.push({
                    successors: [realPosition],
                    offset: token.startCaretOffset,
                });
            }
            if (
                token.endCaretOffset !== undefined &&
                token.endCaretOffset !== token.startCaretOffset
            ) {
                positions.push({
                    successors: [realPosition],
                    offset: token.endCaretOffset,
                });
            }
        } else {
            const childPositions = extractPositions(token.content);
            const resultingPositions = childPositions.map((position) => {
                return {
                    successors: [realPosition, ...position.successors],
                    offset: position.offset,
                };
            });
            positions.push(...resultingPositions);
        }
    }
    return positions;
};

export const extractSelection = (xast: XAst): HtmlSelection | undefined => {
    const positions = extractPositions(xast);
    if (positions.length === 0) {
        return undefined;
    }
    if (positions.length === 1) {
        return {
            type: "position",
            position: positions[0],
        };
    }
    return {
        type: "range",
        positions: [positions[0], positions[1]],
    };
};

export const containsCaret = (xast: XAst): boolean => {
    return extractPositions(xast).length > 0;
};

export const xastToAst = (xast: XAst): Ast => {
    const ast: Ast = [];
    for (const token of xast) {
        if (token.type === "text") {
            ast.push({
                type: "text",
                content: token.content,
            });
        } else if (token.type === "caret") {
            continue;
        } else if (token.type === "variable") {
            ast.push({
                type: "variable",
                id: token.id,
                content: xastToAst(token.content) as InlineToken[],
            });
        } else if (token.type === "div") {
            ast.push({
                type: "div",
                content: xastToAst(token.content) as InlineToken[],
            });
        } else {
            ast.push({
                type: "special",
                content: xastToAst(token.content) as InlineToken[],
            });
        }
    }
    return ast;
};

const insertVariableAtCaretRecursive = (
    xast: XAst,
    id: string,
    label: string
): [XAst, boolean] => {
    const NewAst: XAst = [];
    for (const token of xast) {
        if (token.type === "caret") {
            const tokenToPush: XInlineToken = {
                type: "variable",
                id: id,
                content: [
                    {
                        type: "text",
                        content: label,
                    },
                ],
            };
            NewAst.push(tokenToPush);
            NewAst.push(token);
            return [NewAst, true];
        }
        if (token.type === "text") {
            if (token.startCaretOffset !== undefined || token.endCaretOffset !== undefined) {
                const position = token.startCaretOffset ?? token.endCaretOffset;
                NewAst.push({
                    type: "text",
                    content: token.content.slice(0, position),
                });
                const variableTokenToPush: XInlineToken = {
                    type: "variable",
                    id: id,
                    content: [
                        {
                            type: "text",
                            content: label,
                        },
                    ],
                };
                NewAst.push(variableTokenToPush);
                // @ts-ignore
                if (position < token.content.length) {
                    NewAst.push({
                        type: "text",
                        content: token.content.slice(position),
                        startCaretOffset: 0,
                        endCaretOffset: 0,
                    });
                } else {
                    NewAst.push({
                        type: "caret",
                        direction: "both",
                    });
                }
            } else {
                NewAst.push(token);
            }
            continue;
        }
        if (token.type === "div") {
            const [newContent, succeded] = insertVariableAtCaretRecursive(
                token.content,
                id,
                label
            );
            NewAst.push({
                type: "div",
                content: newContent,
            });
            if (succeded) {
                return [NewAst, true];
            }
            continue;
        }
        if (token.type === "variable") {
            NewAst.push(token);
            continue;
        } else {
            const [newContent, succeded] = insertVariableAtCaretRecursive(
                token.content,
                id,
                label
            );
            NewAst.push({
                type: "special",
                content: newContent as InlineToken[],
            });
            if (succeded) {
                return [NewAst, true];
            }
            continue;
        }
    }
    return [NewAst, false];
};

export const insertVariableAtCaret = (xast: XAst, id: string, label: string): XAst => {
    const [newAst] = insertVariableAtCaretRecursive(xast, id, label);
    return newAst;
};
