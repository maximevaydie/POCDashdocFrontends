import {Flex, Icon, IconProps, Text, themeAwareCss} from "@dashdoc/web-ui";
import {isSVG} from "@dashdoc/web-ui/src/base/icon/utils";
import styled from "@emotion/styled";
import React, {FunctionComponent} from "react";

const StyledFlex = styled(Flex)<{active: boolean}>(({active, flexGrow}) =>
    themeAwareCss({
        padding: 2,
        width: "128px",
        backgroundColor: "transparent",
        alignItems: "center",
        flexDirection: "column",
        flexGrow: flexGrow,
        justifyContent: "center",
        border: "1px solid",
        borderColor: "grey.light",
        borderRadius: "4px",
        color: "grey.dark",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "grey.light",
        },
        "&:disabled": {
            color: "grey.default",
            cursor: "not-allowed",
        },
        "&:focus": {
            i: {
                color: "blue.default",
            },
        },
        ...(active && {
            borderColor: "blue.default",
            backgroundColor: "blue.ultralight",
            cursor: "default",
            "&:hover": {
                backgroundColor: "blue.ultralight",
            },
            i: {
                color: "blue.default",
            },

            p: {
                color: "blue.default",
            },
        }),
    })
);

export type OutlinedBigIconAndTextButtonProps = {
    iconName: IconProps["name"];
    label: string;
    active?: boolean;
    onClick: () => unknown;
    dataTestId?: string;
    flexGrow?: number;
};

export const OutlinedBigIconAndTextButton: FunctionComponent<
    OutlinedBigIconAndTextButtonProps
> = ({iconName, label, active, onClick, dataTestId, flexGrow = 1}) => {
    const iconScaleProps = isSVG(iconName) ? {scale: 1.5} : {fontSize: 4}; // We have to do this because of this bug: https://linear.app/dashdoc/issue/TI-226
    return (
        // @ts-ignore
        <StyledFlex active={active} onClick={onClick} data-testid={dataTestId} flexGrow={flexGrow}>
            <Icon name={iconName} {...iconScaleProps} />
            <Text variant="caption" textAlign={"center"} lineHeight={"14px"} mt={2}>
                {label}
            </Text>
        </StyledFlex>
    );
};
