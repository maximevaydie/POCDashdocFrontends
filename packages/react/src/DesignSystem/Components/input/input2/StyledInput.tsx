import styled from "@emotion/styled";
import React, {ComponentProps} from "react";

import {Box, BoxProps} from "../../../Elements/layout/Box";
import {resetCSS, themeAwareCss} from "../../../Elements/utils";

export type StyledInputSpecificProps = BoxProps &
    Omit<React.HTMLProps<HTMLInputElement>, "as"> & {
        error?: string | boolean;
        warning?: boolean;
        success?: boolean;
        withLabel?: boolean;
        withLeftIcon?: boolean;
        withRightIcon?: boolean;
        withUnits?: boolean;
    };

export const getInputStylesFromProps = ({
    width,
    type,
    withLabel,
    withLeftIcon,
    withRightIcon,
    withUnits,
    error,
    disabled,
    warning,
    success,
    fontSize,
    lineHeight,
}: Partial<StyledInputSpecificProps> = {}) => {
    const isButton = type === "button" || type === "submit";
    return {
        width: width ? width : isButton ? "auto" : "100%",
        paddingX: 3,
        backgroundColor: "grey.white",
        color: "grey.ultradark",
        fontFamily: "primary",
        fontSize: fontSize || 2,
        lineHeight: lineHeight || "38px",
        border: "1px solid",
        borderColor: "grey.light",
        borderRadius: 1,
        ...(withUnits && {
            borderRight: 0,
            borderRadius: "4px 0 0 4px",
        }),
        ...(error && {
            backgroundColor: "red.ultralight",
            borderColor: "red.default",
        }),
        ...(warning && {
            backgroundColor: "yellow.ultralight",
            borderColor: "yellow.default",
        }),
        ...(success && {
            borderColor: "green.default",
        }),
        "::placeholder": {
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            color: "grey.dark",
            ...(withLabel && {
                color: "transparent",
            }),
        },
        ...(!disabled && {
            "&:hover": {
                border: "1px solid",
                borderColor: "grey.light",
                boxShadow: "small",
                ...(error && {
                    borderColor: "red.default",
                }),
                ...(warning && {
                    borderColor: "yellow.default",
                }),
                ...(success && {
                    borderColor: "green.default",
                }),
                ...(withUnits && {
                    borderRight: 0,
                    borderRadius: "4px 0 0 4px",
                }),
            },
        }),
        "&:hover+#unitsContainer": {
            borderColor: "grey.light",
            boxShadow: "small",
            ...(error && {
                borderColor: "red.default",
            }),
            ...(warning && {
                borderColor: "yellow.default",
            }),
            ...(success && {
                borderColor: "green.default",
            }),
        },
        "&:focus": {
            border: "1px solid",
            borderColor: "blue.default",
            boxShadow: "small",
            ...(error && {
                borderColor: "red.default",
            }),
            ...(warning && {
                borderColor: "yellow.default",
            }),
            ...(success && {
                borderColor: "green.default",
            }),
            ...(withUnits && {
                borderRight: 0,
                borderRadius: "4px 0 0 4px",
            }),
            "::placeholder": {
                color: "grey.dark",
            },
        },
        "&:focus+#unitsContainer": {
            borderColor: "blue.default",
            boxShadow: "small",
            ...(error && {
                borderColor: "red.default",
            }),
            ...(warning && {
                borderColor: "yellow.default",
            }),
            ...(success && {
                borderColor: "green.default",
            }),
            "::placeholder": {
                color: "grey.dark",
            },
        },
        "&:disabled": {
            backgroundColor: "grey.ultralight",
            color: "grey.dark",
            "&:active": {
                border: "1px solid",
                borderColor: "grey.light",
            },
        },
        "&:disabled+#unitsContainer": {
            backgroundColor: "grey.ultralight",
        },
        ...(type === "number" && {
            paddingY: "9px",
            lineHeight: "20px",
        }),
        ...(withLabel && {
            paddingTop: "22px",
            paddingBottom: "6px",
            lineHeight: "20px",
        }),
        ...(withLabel &&
            isButton && {
                paddingTop: "44px",
                paddingBottom: "6px",
            }),
        ...(withLeftIcon && {
            paddingLeft: 8,
        }),
        ...(withRightIcon && {
            paddingRight: 8,
        }),
    };
};

export const StyledInput = styled(Box.withComponent("input"))<StyledInputSpecificProps>(
    resetCSS,
    (props) => themeAwareCss(getInputStylesFromProps(props))
);

export const StyledButton = styled(Box.withComponent("button"))<StyledInputSpecificProps>(
    resetCSS,
    (props) => themeAwareCss(getInputStylesFromProps(props))
);

export const StyledBox = styled(Box)<StyledInputSpecificProps>(resetCSS, (props) =>
    themeAwareCss(getInputStylesFromProps(props))
);

export type StyledInputProps = ComponentProps<typeof StyledInput>;
