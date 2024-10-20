import React, {forwardRef, useImperativeHandle, useRef} from "react";

import {HtmlSelection} from "../html-area/html-area-helper";
import {HtmlArea, HtmlAreaPartialProps} from "../html-area/HtmlArea";

import {xastToString} from "./normalisation-helper";
import {astToHtml, extractSelection, htmlToAst, injectSelection, xastToAst} from "./xast-helper";
import {XAst} from "./xast-types";

type XAstAreaProps = {
    xast: XAst;
    onChange: (xast: XAst) => unknown;
    _debug?: boolean;
} & Partial<HtmlAreaPartialProps>;

/** We control a tree of elements containing the selection */
export const XAstArea = forwardRef<{focus: () => void}, XAstAreaProps>(
    ({xast, onChange, _debug = false, label, ...props}, ref) => {
        const ast = xastToAst(xast);
        const html = astToHtml(ast, Boolean(label));
        const selection = extractSelection(xast);
        const htmlAreaRef = useRef<{focus: () => void}>();

        // @ts-ignore
        useImperativeHandle(ref, () => ({focus: htmlAreaRef?.current?.focus}));
        //Following states are for debug purposes only
        const [receivedHtml, setReceivedHtml] = React.useState("");
        const [receivedHtmlSelection, setReceivedHtmlSelection] = React.useState<
            HtmlSelection | undefined
        >();
        const [resultingXAst, setResultingXAst] = React.useState<XAst>();

        /** Returns a JSX element suited to debug the component */
        const _debugContent = () => (
            <>
                <div style={{marginTop: 10, marginBottom: 10, fontSize: 14, fontWeight: "bold"}}>
                    {"RECEIVED HTML FROM COMPONENT:"}
                </div>
                {receivedHtml
                    .split("<div>")
                    .map((divlessLine, index) =>
                        index === 0 ? divlessLine : "<div>" + divlessLine
                    )
                    .map((line) => (
                        <div key={"line" + line.toString()}>{line}</div>
                    ))}
                <div style={{marginTop: 10, marginBottom: 10, fontSize: 14, fontWeight: "bold"}}>
                    {"RECEIVED HTML SELECTION FROM COMPONENT:"}
                </div>
                {receivedHtmlSelection && JSON.stringify(receivedHtmlSelection)}
                <div style={{marginTop: 10, marginBottom: 10, fontSize: 14, fontWeight: "bold"}}>
                    {"RESULTING XAST:"}
                </div>
                {resultingXAst &&
                    xastToString(resultingXAst)
                        .split("\n")
                        .map((line, index) => (
                            <div key={"resulting-xAst-line-" + index.toString()}>{line}</div>
                        ))}
                <div style={{marginTop: 10, marginBottom: 10, fontSize: 14, fontWeight: "bold"}}>
                    {"RECEIVED XAST FROM PROPS:"}
                </div>
                {xastToString(xast)
                    .split("\n")
                    .map((line, index) => (
                        <div key={"received-xast-from-props-line-" + index.toString()}>{line}</div>
                    ))}
                <div style={{marginTop: 10, marginBottom: 10, fontSize: 14, fontWeight: "bold"}}>
                    {" RESULTING HTML:"}
                </div>
                {html
                    .split("<div>")
                    .map((divlessLine, index) =>
                        index === 0 ? divlessLine : "<div>" + divlessLine
                    )
                    .map((line) => (
                        <div key={"line" + line.toString()}>{line}</div>
                    ))}
                <div style={{marginTop: 10, marginBottom: 10, fontSize: 14, fontWeight: "bold"}}>
                    {"RESULTING HTML SELECTION:"}
                </div>
                {selection && JSON.stringify(receivedHtmlSelection)}
            </>
        );

        return (
            <>
                <HtmlArea
                    // @ts-ignore
                    ref={htmlAreaRef}
                    html={html}
                    selection={selection}
                    onChange={(html, selection) => {
                        setReceivedHtml(html);
                        setReceivedHtmlSelection(selection);
                        const ast = htmlToAst(html);
                        // @ts-ignore
                        const xast = injectSelection(ast, selection);
                        setResultingXAst(xast);
                        onChange(xast);
                    }}
                    label={label}
                    {...props}
                />
                {_debug && _debugContent()}
            </>
        );
    }
);

XAstArea.displayName = "XAstArea";
