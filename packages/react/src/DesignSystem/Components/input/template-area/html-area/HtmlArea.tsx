import {ErrorMessage, Flex, Label, Text, theme} from "@dashdoc/web-ui";
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";

import {
    containsRange,
    elementSelectionToRange,
    rangeToElementSelection,
    HtmlSelection,
} from "./html-area-helper";

export type HtmlAreaPartialProps = {
    onFocus: () => void;
    onBlur: () => void;
    "data-testid": string;
    disabled: boolean;
    label: string;
    placeholder: string;
    error: string;
};

type HtmlAreaProps = {
    html: string;
    selection: HtmlSelection | undefined;
    onChange: (html: string, selection: HtmlSelection | undefined) => unknown;
} & Partial<HtmlAreaPartialProps>;

/** A component to control an html area.
 *
 * ⚠️ ***Beware as this component allows to inject direct html into the html area.***⚠️
 */
export const HtmlArea = forwardRef<{focus: () => void}, HtmlAreaProps>(
    ({html, selection, onChange, disabled, label, placeholder, error, ...props}, ref) => {
        const divRef = useRef<HTMLDivElement>();
        const [lastKnownSelection, setLastKnownSelection] = useState<HtmlSelection | undefined>();
        const [isControlPressed, setIsControlKeyPressed] = useState(false);
        const [isMetaPressed, setIsMetaKeyPressed] = useState(false);
        const [isHovered, setIsHovered] = React.useState(false);
        const [isFocused, setIsFocused] = React.useState(false);

        const borderColor = {
            default: theme.colors.grey.light,
            hover: theme.colors.grey.light,
            focus: theme.colors.blue.default,
            error: theme.colors.red.default,
        };
        const boxShadow = {
            default: "none",
            hover: `0 0 0 1px ${theme.colors.grey.light}`,
            focus: "none",
            error: "none",
        };
        const backgroundColor = {
            default: undefined,
            hover: theme.colors.grey.ultralight,
            focus: undefined,
            error: theme.colors.red.ultralight,
        };
        const borderState = error
            ? "error"
            : disabled
            ? "default"
            : isFocused
            ? "focus"
            : isHovered
            ? "hover"
            : "default";

        const isModifierKeyPressed = isControlPressed || isMetaPressed;

        /** Create a selection in the navigator based on the given one */
        const setActualSelection = (selection: HtmlSelection | undefined) => {
            if (selection !== undefined && divRef.current?.contains(document.activeElement)) {
                const range = elementSelectionToRange(divRef.current, selection);
                if (range) {
                    window.getSelection()?.removeAllRanges();
                    window.getSelection()?.addRange(range);
                }
            }
        };

        useEffect(() => {
            //if the div is focused, set the selection to the provided one
            if (selection !== undefined) {
                setLastKnownSelection(selection);
                setActualSelection(selection);
            }
        }, [selection]);

        useImperativeHandle(ref, () => ({focus: () => divRef.current?.focus()}));

        const getCurrentSelection = () => {
            const range = window.getSelection()?.getRangeAt(0);
            const div = divRef.current;
            if (div && range && containsRange(div, range)) {
                return rangeToElementSelection(div, range);
            }
            return undefined;
        };

        const getCurrentHtml = () => {
            const div = divRef.current;
            // @ts-ignore
            return div.innerHTML;
        };

        const handleChange = () => {
            let selection = getCurrentSelection();
            const html = getCurrentHtml();
            if (selection) {
                setLastKnownSelection(selection);
            } else {
                selection = lastKnownSelection;
            }
            onChange(html, selection);
        };

        const value = divRef?.current?.textContent;
        const filled = value !== null && value !== undefined && value !== "";

        const statusProps = {
            error,
            // warning,
            // success,
            disabled,
            // required,
            focused: isFocused,
            filled,
        };

        return (
            <>
                <Flex alignItems={"stretch"} position="relative">
                    <div
                        // @ts-ignore
                        ref={divRef}
                        id={"templateArea"}
                        contentEditable={disabled ? "false" : "true"}
                        spellCheck={false}
                        autoCorrect={"off"}
                        autoCapitalize={"off"}
                        data-testid={props["data-testid"]}
                        style={{
                            borderStyle: "solid",
                            borderWidth: "1px",
                            borderColor: borderColor[borderState],
                            boxShadow: boxShadow[borderState],
                            padding: "10px",
                            borderRadius: "5px",
                            lineHeight: "30px",
                            minHeight: "40px",
                            outline: "none",
                            backgroundColor: backgroundColor[borderState],
                            color: disabled ? theme.colors.grey.dark : undefined,
                            width: "100%",
                            ...(label && {
                                paddingTop: "22px",
                                paddingBottom: "6px",
                                lineHeight: "20px",
                            }),
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                        }}
                        onDrag={(e) => {
                            e.preventDefault();
                        }}
                        onPaste={(e) => {
                            e.preventDefault();
                            // insert text manually to paste as plain text (without formatting)
                            const pastedText = e.clipboardData.getData("text/plain");
                            document.execCommand("insertHTML", false, pastedText);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Meta") {
                                setIsMetaKeyPressed(true);
                            }
                            if (e.key === "Control") {
                                setIsControlKeyPressed(true);
                            }
                            if (isModifierKeyPressed && (e.key === "b" || e.key === "i")) {
                                e.preventDefault();
                            }
                        }}
                        onMouseUp={handleChange}
                        onFocus={() => {
                            setActualSelection(lastKnownSelection);
                            props.onFocus?.();
                            setIsFocused(true);
                        }}
                        onBlur={() => {
                            props.onBlur?.();
                            setIsFocused(false);
                        }}
                        onKeyUp={(e) => {
                            if (e.key === "Meta") {
                                setIsMetaKeyPressed(false);
                            }
                            if (e.key === "Control") {
                                setIsControlKeyPressed(false);
                            }
                            handleChange();
                        }}
                        onMouseEnter={() => {
                            setIsHovered(true);
                        }}
                        onMouseLeave={() => {
                            setIsHovered(false);
                        }}
                        dangerouslySetInnerHTML={{__html: html}} // nosemgrep react-dangerouslysetinnerhtml
                    />
                    {label && (
                        // @ts-ignore
                        <Label
                            label={label}
                            htmlFor={"templateArea"}
                            withLeftIcon={false}
                            {...statusProps}
                        />
                    )}
                    {/* This component is custom, it does not support placeholder without label */}
                    {label && placeholder && isFocused && !filled && (
                        <Text position={"absolute"} color="grey.dark" mt="22px" ml="12px">
                            {placeholder}
                        </Text>
                    )}
                </Flex>
                {error && typeof error === "string" && <ErrorMessage error={error} />}
            </>
        );
    }
);

HtmlArea.displayName = "HtmlArea";
