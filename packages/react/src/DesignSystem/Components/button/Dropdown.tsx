import styled from "@emotion/styled";
import React, {CSSProperties, FunctionComponent, ReactNode} from "react";

import {Icon, IconProps} from "../base/icon";
import {Box, BoxProps} from "../layout/Box";
import {ClickOutside} from "../layout/ClickOutside";
import {themeAwareCss} from "../utils";

import {Button} from "./Button";

export type DropdownProps = BoxProps & {
    leftIcon?: IconProps["name"] | null;
    rightContent?: ReactNode;
    label?: ReactNode;
    isOpen: boolean;
    disabled?: boolean;
    contentStyle?: CSSProperties;
    onOpen: () => void;
    onClose: () => void;
};

export const DropdownContent = styled(Box)<{
    customStyle?: CSSProperties;
}>(({customStyle}) =>
    themeAwareCss({
        width: "100%",
        border: "1px solid",
        borderColor: "grey.light",
        backgroundColor: "grey.white",
        boxShadow: "medium",
        borderRadius: 1,
        marginTop: 2,
        ...customStyle,
    })
);

export const Dropdown: FunctionComponent<DropdownProps> = ({
    leftIcon,
    rightContent,
    label,
    isOpen,
    disabled,
    contentStyle,
    onOpen,
    onClose,
    "data-testid": dataTestId,
    children,
    ...props
}) => {
    return (
        <Box position="relative" data-testid={dataTestId} {...props}>
            <ClickOutside onClickOutside={onClose}>
                <Button
                    type="button"
                    variant="secondary"
                    width={1}
                    display="flex"
                    justifyContent="space-between"
                    disabled={disabled}
                    onClick={isOpen ? onClose : onOpen}
                    data-testid={dataTestId ? dataTestId + "-button" : undefined}
                >
                    {leftIcon && <Icon name={leftIcon} mr={2} />}
                    {label}
                    {rightContent}
                    <Icon name="arrowDown" color={isOpen ? "blue.dark" : undefined} ml={4} />
                </Button>
                {isOpen && (
                    <DropdownContent
                        position="absolute"
                        zIndex="dropdown"
                        customStyle={contentStyle}
                        data-testid={dataTestId ? dataTestId + "-content" : undefined}
                    >
                        {children}
                    </DropdownContent>
                )}
            </ClickOutside>
        </Box>
    );
};
