import {ConfirmationModal, Flex, ModalProps, resetCSS} from "@dashdoc/web-ui";
import {keyframes} from "@emotion/react";
import styled from "@emotion/styled";
import {useToggle} from "dashdoc-utils";
import debounce from "lodash.debounce";
import React, {ComponentProps, FunctionComponent, ReactNode, Ref} from "react";
import {variant} from "styled-system";

type ButtonStyle = {
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
    padding?: number;
    border?: number;
    "&:hover"?: {
        borderColor?: string;
        backgroundColor?: string;
        boxShadow?: string;
        border?: number;
    };
    "&:focus"?: {
        borderColor?: string;
        border?: number;
    };
    "&:disabled"?: {
        color?: string;
        backgroundColor?: string;
    };
};
export const buttonVariants: {
    primary: ButtonStyle;
    secondary: ButtonStyle;
    plain: ButtonStyle;
    destructive: ButtonStyle;
    none: ButtonStyle;
} = {
    primary: {
        backgroundColor: "blue.default",
        color: "grey.white",
        "&:hover": {
            backgroundColor: "blue.dark",
            boxShadow: "small",
        },
        "&:focus": {
            borderColor: "blue.dark",
        },
        "&:disabled": {
            backgroundColor: "blue.light",
        },
    },
    secondary: {
        backgroundColor: "grey.white",
        color: "grey.ultradark",
        borderColor: "grey.light",
        "&:hover": {
            borderColor: "grey.light",
            boxShadow: "small",
        },
        "&:focus": {
            borderColor: "blue.default",
        },
        "&:disabled": {
            backgroundColor: "grey.light",
        },
    },
    plain: {
        backgroundColor: "transparent",
        color: "blue.default",
        "&:hover": {
            backgroundColor: "grey.light",
        },
        "&:disabled": {
            color: "grey.default",
        },
    },
    destructive: {
        backgroundColor: "red.default",
        color: "grey.white",
        "&:hover": {
            backgroundColor: "red.dark",
        },
        "&:disabled": {
            backgroundColor: "red.light",
        },
        "&:focus": {
            borderColor: "red.dark",
        },
    },
    none: {
        padding: 0,
        border: 0,
        "&:hover": {
            border: 0,
        },
        "&:focus": {
            border: 0,
        },
    },
};

export const allSeverities = {
    danger: {
        backgroundColor: "red.default",
        color: "grey.white",
        "&:hover": {
            backgroundColor: "red.dark",
        },
        "&:disabled": {
            backgroundColor: "red.light",
        },
        "&:focus": {
            borderColor: "red.dark",
        },
    },
    dangerPlain: {
        color: "red.dark",
    },
    warning: {
        backgroundColor: "yellow.default",
        color: "grey.ultradark",
        "&:hover": {
            backgroundColor: "yellow.dark",
        },
        "&:disabled": {
            backgroundColor: "yellow.light",
        },
        "&:focus": {
            borderColor: "yellow.dark",
        },
    },
    warningPlain: {
        color: "yellow.dark",
    },
};
const otherSeverities = {...allSeverities};
// @ts-ignore
delete otherSeverities.dangerPlain;
// @ts-ignore
delete otherSeverities.warningPlain;

export const severities = otherSeverities;

const sizes = {
    xsmall: {
        paddingY: 1,
        paddingX: 1,
        fontSize: 1,
    },
    small: {
        paddingY: 2,
        paddingX: 4,
        fontSize: 2,
    },
};

type StyledButtonProps = {
    variant?: keyof typeof buttonVariants;
    severity?: keyof typeof allSeverities;
    size?: keyof typeof sizes;
    tracking?: string;
    loading?: boolean;
};

const loadingAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }`;

export const loadingStyle = ({loading}: {loading?: boolean}) =>
    loading && {
        animation: `${loadingAnimation} 1s infinite ease-in`,
        cursor: "wait !important",
    };

const StyledButton = styled(Flex.withComponent("button"))<StyledButtonProps>(
    // reset
    resetCSS,
    // commom styles
    {
        border: "1px solid",
        borderColor: "transparent",
        alignItems: "center",
        "&:hover, &:active": {
            border: "1px solid",
            borderColor: "transparent",
        },
        "&:focus": {border: "1px solid", backgroundColor: "grey.light"},
    },
    // variants
    variant({variants: buttonVariants}),
    // severities,
    variant({prop: "severity", variants: allSeverities}),
    variant({prop: "size", variants: sizes}),
    loadingStyle
);

export type ButtonProps = ComponentProps<typeof StyledButton> & {
    withConfirmation?: boolean;
    confirmationMessage?: ReactNode;
    modalProps?: ModalProps;
    buttonRef?: Ref<any>;
};

const DOUBLE_CLICK_SECURITY_DELAY_IN_MS = 60;

export const Button: FunctionComponent<ButtonProps> = ({
    withConfirmation,
    confirmationMessage,
    modalProps,
    loading,
    disabled,
    buttonRef,
    variant,
    severity,
    borderRadius = 1,
    paddingX = 4,
    paddingY = 2,
    ...props
}) => {
    const [isConfirmationModalOpen, openConfirmationModal, closeConfirmationModal] = useToggle();

    const handleClick = props.onClick
        ? debounce(props.onClick, DOUBLE_CLICK_SECURITY_DELAY_IN_MS, {
              leading: true,
              trailing: false,
          })
        : undefined;

    // @ts-ignore
    let derivedSeverity: "warning" | "warningPlain" | "danger" | "dangerPlain" = severity;
    if (variant === "plain" && severity === "danger") {
        derivedSeverity = "dangerPlain";
    }
    if (variant === "plain" && severity === "warning") {
        derivedSeverity = "warningPlain";
    }
    if (!withConfirmation) {
        return (
            <StyledButton
                ref={buttonRef}
                variant={variant}
                severity={derivedSeverity}
                borderRadius={borderRadius}
                paddingX={paddingX}
                paddingY={paddingY}
                {...props}
                onClick={handleClick ? (e: any) => handleClick(e) : undefined}
                disabled={loading || disabled}
            />
        );
    }

    return (
        <>
            <StyledButton
                borderRadius={borderRadius}
                paddingX={paddingX}
                paddingY={paddingY}
                {...props}
                ref={buttonRef}
                variant={variant}
                severity={derivedSeverity}
                disabled={loading || disabled}
                onClick={openConfirmationModal}
            />
            {isConfirmationModalOpen && (
                <ConfirmationModal
                    {...modalProps}
                    onClose={() => {
                        closeConfirmationModal();
                        modalProps?.onClose?.();
                    }}
                    mainButton={{
                        onClick: (e: any) => {
                            handleClick?.(e);
                            closeConfirmationModal();
                        },
                        severity: "danger",
                        ...modalProps?.mainButton,
                    }}
                    secondaryButton={{
                        onClick: closeConfirmationModal,
                        ...modalProps?.secondaryButton,
                    }}
                    confirmationMessage={confirmationMessage}
                />
            )}
        </>
    );
};

Button.defaultProps = {
    color: "grey.white",
    backgroundColor: "blue.default",
    justifyContent: "center",
    alignItems: "center",
    variant: "primary",
};
