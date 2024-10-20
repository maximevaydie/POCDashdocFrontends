import styled from "@emotion/styled";
import React, {FunctionComponent, ReactNode} from "react";
import {PositionProps, compose, position} from "styled-system";

import {theme} from "../../../Elements/theme";
import {themeAwareCss} from "../../../Elements/utils";

type LabelProps = Omit<React.HTMLProps<HTMLLabelElement>, "as" | "ref" | "label"> &
    PositionProps & {
        label: ReactNode;
        error: string | boolean;
        warning?: boolean;
        success: boolean;
        disabled: boolean;
        required: boolean;
        filled: boolean;
        focused: boolean;
        withLeftIcon?: boolean;
    };

const StyledLabel = styled("label")<Omit<LabelProps, "label">>(
    ({focused, filled, error, warning, success, withLeftIcon}) =>
        themeAwareCss({
            fontFamily: "primary",
            fontSize: 2,
            lineHeight: 1,
            color: "grey.dark",
            padding: 0,
            margin: 0,
            position: "absolute",
            left: `${theme.space[3]}px`,
            top: `${theme.fontSizes[2]}px`,
            pointerEvents: "none",
            transition: "all 0.2s ease-out",
            ...((focused || filled) && {
                fontSize: 1,
                lineHeight: 0,
                top: `${theme.space[2]}px`,
            }),
            ...(focused && {
                color: "blue.default",
            }),
            ...(error && {
                color: "red.default",
            }),
            ...(warning && {
                color: "yellow.default",
            }),
            ...(success && {
                color: "green.default",
            }),
            ...(withLeftIcon && {
                left: `${theme.space[8]}px`,
            }),
        }),
    compose(position)
);

const RequiredStar = styled("span")<Pick<LabelProps, "error" | "success">>(({error, success}) =>
    themeAwareCss({
        fontFamily: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        color: "blue.default",
        ...(error && {
            color: "red.default",
        }),
        ...(success && {
            color: "green.default",
        }),
    })
);

export const Label: FunctionComponent<LabelProps> = ({label, ...props}) => (
    <StyledLabel {...props}>
        {label}
        {props.required && (
            <RequiredStar error={props.error} success={props.success}>
                &nbsp;*
            </RequiredStar>
        )}
    </StyledLabel>
);
