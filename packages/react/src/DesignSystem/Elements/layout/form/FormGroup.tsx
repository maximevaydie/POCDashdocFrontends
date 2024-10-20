import React from "react";

import {Box} from "../Box";

export interface FormGroupProps {
    noCols?: boolean;
    className?: string;
    error?: any;
    htmlFor?: string;
    wideLabel?: boolean;
    label?: string;
    mandatory?: boolean;
    blueMandatory?: boolean;
    children: React.ReactNode;
    rightChildren?: React.ReactNode;
}

/**
 * @deprecated used on old forms
 */
export const FormGroup = (props: FormGroupProps) => {
    let formGroupClasses = `form-group ${props.className || ""} ${props.error ? "has-error" : ""}`;

    let errorHint;
    if (props.error) {
        errorHint = <span className="help-block">{props.error}</span>;
    }

    const labelProps = {
        className: `control-label ${!props.noCols && !props.wideLabel ? "col-sm-4" : ""} ${
            props.wideLabel ? "col-sm-5" : ""
        }`,
        htmlFor: props.htmlFor,
    };

    return (
        <Box className={formGroupClasses} mb={2}>
            {props.label && (
                <label {...labelProps}>
                    {props.label}
                    {(props.mandatory || props.blueMandatory) && (
                        <span>
                            {" "}
                            <b className={props.blueMandatory ? "text-info" : "text-danger"}>*</b>
                        </span>
                    )}
                </label>
            )}
            <div
                className={
                    props.label
                        ? `${props.wideLabel ? "col-sm-7" : ""} ${
                              !props.noCols && !props.wideLabel ? "col-sm-6" : ""
                          }`
                        : ""
                }
            >
                {props.children}
                {errorHint}
            </div>
            {props.rightChildren && (
                <div
                    style={{
                        lineHeight: "38px",
                        height: "0px", // Fix for margin bug in form-groups.
                    }}
                >
                    {props.rightChildren}
                </div>
            )}
        </Box>
    );
};
