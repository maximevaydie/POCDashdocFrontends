import styled from "@emotion/styled";
import {useToggle} from "dashdoc-utils";
import React, {ComponentProps, FunctionComponent, ReactNode} from "react";

import {Icon, IconProps} from "../icon";
import {Flex} from "../layout/Flex";
import {ConfirmationModal} from "../modal/ConfirmationModal";
import {ModalProps} from "../modal/Modal";
import {resetCSS, themeAwareCss} from "../utils";

import {loadingStyle} from "./Button";

type IconButtonCustomProps = {
    label?: ReactNode;
    loading?: boolean;
};

const Button = styled(Flex.withComponent("button"))<
    IconButtonCustomProps & {withLabel: boolean; hoverBackgroundColor?: string}
>(
    resetCSS,
    ({withLabel, hoverBackgroundColor = "grey.light"}) =>
        themeAwareCss({
            padding: 0,
            borderRadius: "100%",
            backgroundColor: "transparent",
            "&:hover": {
                backgroundColor: hoverBackgroundColor,
            },
            "&:disabled": {
                color: "grey.default",
                cursor: "not-allowed",
            },
            ...(withLabel && {
                padding: 1,
                borderRadius: 1,
            }),
        }),
    ({loading}) => loadingStyle({loading})
);

type ButtonWithIconProps = Omit<ComponentProps<typeof Button>, "withLabel"> &
    IconProps & {
        label?: ReactNode;
        iconPosition?: "left" | "right";
    };

const ButtonWithIcon: FunctionComponent<ButtonWithIconProps> = ({
    name,
    label,
    scale,
    iconPosition = "left",
    ...props
}) => {
    const withLabel = !!label;

    return (
        <Button {...props} withLabel={withLabel}>
            {iconPosition === "left" && (
                <Icon
                    name={name}
                    mr={label ? 2 : undefined}
                    color={props.color}
                    round={!withLabel}
                    scale={scale}
                />
            )}
            {label}
            {iconPosition === "right" && (
                <Icon
                    name={name}
                    ml={label ? 2 : undefined}
                    color={props.color}
                    round={!withLabel}
                    scale={scale}
                />
            )}
        </Button>
    );
};

export type IconButtonProps = ComponentProps<typeof ButtonWithIcon> & {
    withConfirmation?: boolean;
    confirmationMessage?: ReactNode;
    modalProps?: Partial<ModalProps>;
};

export const IconButton: FunctionComponent<IconButtonProps> = ({
    withConfirmation,
    confirmationMessage,
    modalProps,
    ...props
}) => {
    const [isConfirmationModalOpen, openConfirmationModal, closeConfirmationModal] = useToggle();

    if (!withConfirmation) {
        return <ButtonWithIcon {...props} disabled={props.loading || props.disabled} />;
    }

    return (
        <>
            <ButtonWithIcon
                {...props}
                disabled={props.loading || props.disabled}
                onClick={openConfirmationModal}
            />
            {isConfirmationModalOpen && (
                <ConfirmationModal
                    {...modalProps}
                    onClose={() => {
                        modalProps?.onClose?.();
                        closeConfirmationModal();
                    }}
                    mainButton={{
                        onClick: (e: any) => {
                            props.onClick?.(e);
                            closeConfirmationModal();
                        },
                        severity: "danger",
                        ...modalProps?.mainButton,
                    }}
                    confirmationMessage={confirmationMessage}
                />
            )}
        </>
    );
};

IconButton.defaultProps = {
    color: "grey.ultradark",
    fontFamily: "primary",
};
