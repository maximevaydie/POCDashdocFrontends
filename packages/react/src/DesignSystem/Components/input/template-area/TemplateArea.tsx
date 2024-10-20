import {Box, Button, Flex, theme} from "@dashdoc/web-ui";
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";

import {HtmlAreaPartialProps} from "./html-area/HtmlArea";
import {templateToXast, xastToTemplate} from "./template-helper";
import {normalizeXAst} from "./x-ast/normalisation-helper";
import {insertVariableAtCaret} from "./x-ast/xast-helper";
import {XAst} from "./x-ast/xast-types";
import {XAstArea} from "./x-ast/XAstArea";

//TODO:
//    - Disable shorcuts ctr-B / meta-B, ctr-I / meta-I, ctr-U / meta-U...
//    - Prevent pasting html
//    - Better Caret handling (e.g. on new line, caret is at the end of the previous line)
//    - Prevent weird caret going at the end of the text (due to the library rerendering or something like that)
//    - When updating the html, check that the last element in a div is not a non editable span, otherwise we cannot put the caret at the end and remove it

type TemplateAreaProps = {
    variableList: {id: string; label: string}[];
    initialTemplate?: string;
    onChange?: (template: string) => unknown;
    displayBuiltInVariablePicker?: boolean;
    variableStyle?: {
        backgroundColor: string;
        color: string;
        borderRadius: string;
    };
    _debug?: boolean;
} & Partial<HtmlAreaPartialProps>;

/** A Text area in which one can add some variables from a given variablelist.
 *
 * Note that this is an [**uncontrolled**](https://en.reactjs.org/docs/uncontrolled-components.html) input component.

 * The `ref` prop provides a way for the `TemplateArea` to pass to its parent component the power to
 * put an instance of a variable in the text area.
 * The parent component provides a mutable object (in a react ref format) via this prop to TemplateArea.
 * Then, on render, `TemplateArea` puts inside this object an `addVariable` method.
 *
 * Here is a usage illustration:
 * ```javascript
 * const ParentComponent = () => {
 *      const templateAreaRef = useRef(); //templateAreaRef.current will be populated by TemplateArea on render
 *      return(
 *          <>
 *              <Button onClick={() => {templateAreaRef.current.addVariable("myVar");}}>
 *                  Click me to add a myVar variable in the TemplateArea
 *              </Button>
 *              <TemplateArea
 *                  variableList={[{id:"myVar", label:"My Var"}]}
 *                  ref={toolboxRef}
 *                  displayBuiltInVariablePicker={false} //We create our own variable picker so we don't need the built-in one
 *              />
 *          </>
 *      );
 * };
 * ```
 *
 */
export const TemplateArea = forwardRef<
    {addVariable: (variableId: string) => void},
    TemplateAreaProps
>(
    (
        {
            initialTemplate = "",
            onChange = () => {},
            variableList,
            displayBuiltInVariablePicker = true,
            variableStyle = {
                color: theme.colors.blue.dark,
                backgroundColor: theme.colors.blue.ultralight,
                borderRadius: "5px",
            },
            _debug = false,
            ...props
        },
        ref
    ) => {
        const getVariableLabel = (variableId: string): string => {
            const variable = variableList.find((v) => v.id === variableId);
            return variable ? variable.label : variableId;
        };
        const xAstAreaRef = useRef<{focus: () => void}>();
        const [xast, setXast] = useState<XAst>([
            {
                type: "caret",
                direction: "both",
            },
        ]);

        useEffect(() => {
            setXast(normalizeXAst(templateToXast(initialTemplate), getVariableLabel));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initialTemplate]);

        // Add a variable to the template
        const addVariable = (variableId: string) => {
            const xastWithInsertedVariable = insertVariableAtCaret(
                xast,
                variableId,
                getVariableLabel(variableId)
            );
            const normalizedXast = normalizeXAst(xastWithInsertedVariable, getVariableLabel);
            setXast(normalizedXast);
            onChange(xastToTemplate(normalizedXast));
            xAstAreaRef?.current?.focus();
        };

        //Pass the addVariable method to the parent component
        useImperativeHandle(ref, () => ({
            addVariable,
        }));

        return (
            <Box>
                {displayBuiltInVariablePicker && (
                    <Flex flexDirection={"row"} style={{gap: 5}} mb={2}>
                        {variableList.map(({id: key, label}) => (
                            <Button
                                style={{
                                    paddingTop: "4px",
                                    paddingBottom: "4px",
                                    paddingLeft: "12px",
                                    paddingRight: "12px",
                                    backgroundColor: variableStyle.backgroundColor,
                                    color: variableStyle.color,
                                    borderRadius: variableStyle.borderRadius,
                                }}
                                key={key}
                                onClick={() => {
                                    addVariable(key);
                                }}
                            >
                                {label}
                            </Button>
                        ))}
                    </Flex>
                )}
                <XAstArea
                    // @ts-ignore
                    ref={xAstAreaRef}
                    xast={xast}
                    onChange={(xast) => {
                        const normalizedAst = normalizeXAst(xast, getVariableLabel);
                        setXast(normalizedAst);
                        onChange(xastToTemplate(xast));
                    }}
                    _debug={_debug}
                    {...props}
                />
            </Box>
        );
    }
);

TemplateArea.displayName = "TemplateArea";
