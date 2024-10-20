import {guid} from "@dashdoc/core";
import {Logger, t} from "@dashdoc/web-core";
import styled from "@emotion/styled";
import {SystemStyleObject} from "@styled-system/css";
import {useToggle} from "dashdoc-utils";
import React, {PropsWithChildren, ReactNode, useCallback, useEffect, useMemo} from "react";
import {createPortal} from "react-dom";
import {HeightProps} from "styled-system";

import {Text} from "../../Components/Text";
import {Button, ButtonProps} from "../button/Button";
import {IconButton} from "../button/IconButton";
import {Box, BoxProps} from "../layout/Box";
import {Callout, CalloutProps} from "../layout/Callout";
import {Card, CardProps} from "../layout/Card";
import {Flex, FlexProps} from "../layout/Flex";
import {theme} from "../../theme";
import {themeAwareCss} from "../../utils";

export const BackgroundOverlay = styled(Flex)<FlexProps>(({
    position = "absolute",
    backgroundColor = "neutral.transparentBlack",
    zIndex = "modal",
    justifyContent = "center",
}) => {
    return themeAwareCss({
        position: position as SystemStyleObject,
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: backgroundColor as SystemStyleObject,
        justifyContent,
        zIndex,
        overflowY: "auto",
    });
});

export const ModalCard = styled(Card)<CardProps>`
    max-width: 100%;
    overflow: visible;

    @media (min-width: 3000px) {
        margin-right: -50%;
    }
`;
export const ModalCardWithAnimation = styled(ModalCard)<CardProps>`
    animation-name: show-modal;
    animation-duration: 0.4s;
    animation-timing-function: ease-in-out;

    @keyframes show-modal {
        from {
            margin-top: -100px;
            opacity: 0.1;
        }
        to {
            margin-top: ${theme.space[6]}px;
            opacity: 1;
        }
    }
`;

export const sizes: {[key: string]: number} = {
    small: 300,
    medium: 600,
    large: 900,
    xlarge: 1200,
};

export type ModalBaseProps = CardProps &
    HeightProps & {
        id?: string;
        title: ReactNode | null;
        onClose?: () => void;
        onShown?: () => void;
        size?: keyof typeof sizes;
        children?: ReactNode;
        rootId?: string;
        animation?: boolean;
        overlayColor?: string;
        preventClosingByMouseClick?: boolean;
        calloutProps?: CalloutProps;
    };

export const ModalBase = ({
    id,
    title,
    onClose,
    onShown,
    height = "fit-content",
    size = "medium",
    children,
    animation = true,
    overlayColor,
    preventClosingByMouseClick = false,
    calloutProps,
    ...props
}: ModalBaseProps) => {
    useEffect(() => {
        onShown?.();
    }, [onShown]);

    const overlayKey = useMemo(() => `overlay-${guid()}`, []);
    const [canClose, allowClose, preventClose] = useToggle();

    const handleKeypress = useCallback(
        (event: KeyboardEvent) => {
            // Handle close on Esc press
            if (event.code === "Escape") {
                event.stopPropagation();
                onClose?.();
            }
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeypress, true);
        return () => {
            document.removeEventListener("keydown", handleKeypress, true);
        };
    }, [handleKeypress]);

    const handleMouseUp = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (!canClose) {
                return;
            }
            if (preventClosingByMouseClick) {
                return;
            }
            // Disable onClose when clicking on the scrolling bar
            // (when clicking outside of the viewport)
            if (
                event.clientX <= (event.target as HTMLDivElement).clientWidth &&
                "overlay" in (event.target as HTMLDivElement).dataset &&
                (event.target as HTMLDivElement).dataset.overlay === overlayKey
            ) {
                onClose?.();
            }
        },
        [canClose, onClose, preventClosingByMouseClick, overlayKey]
    );

    const onMouseDown = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (
                "overlay" in (event.target as HTMLDivElement).dataset &&
                (event.target as HTMLDivElement).dataset.overlay === overlayKey
            ) {
                allowClose();
            }
        },
        [allowClose, overlayKey]
    );

    const CardComponent = animation ? ModalCardWithAnimation : ModalCard;

    return (
        <BackgroundOverlay
            backgroundColor={overlayColor}
            data-overlay={overlayKey}
            onMouseUp={handleMouseUp}
            onMouseDown={onMouseDown}
        >
            <CardComponent
                onMouseDown={() => {
                    preventClose();
                }}
                onMouseUp={() => {
                    preventClose();
                }}
                id={id}
                height={height}
                width={sizes[size]}
                marginTop={6}
                marginBottom={6}
                display="flex"
                flexDirection="column"
                {...props}
            >
                {title !== null && (
                    <Flex
                        py={4}
                        px={5}
                        borderBottom={"1px solid"}
                        borderBottomColor="grey.light"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Box data-testid={`${props["data-testid"] || "modal"}-title`}>
                            {typeof title === "string" ? (
                                <Text variant="title">{title}</Text>
                            ) : (
                                title
                            )}
                        </Box>
                        {onClose && (
                            <IconButton
                                name="close"
                                data-testid="close-modal-button"
                                onClick={onClose}
                            />
                        )}
                    </Flex>
                )}

                {calloutProps && <Callout px={5} py={4} mt={2} {...calloutProps} />}

                {children}
            </CardComponent>
        </BackgroundOverlay>
    );
};

export type ModalFooterProps = BoxProps & {
    onClose?: () => void;
    mainButton: ButtonProps | null;
    secondaryButton?: ButtonProps | null;
    additionalFooterContent?: ReactNode;
};

export const ModalFooter = ({
    additionalFooterContent,
    mainButton,
    secondaryButton,
    onClose,
    ...props
}: ModalFooterProps) => {
    if (!!additionalFooterContent || !!mainButton || !!secondaryButton) {
        return (
            <Flex mt={5} justifyContent="space-between">
                {additionalFooterContent ? additionalFooterContent : <Box />}
                <Flex justifyContent="flex-end">
                    {!!secondaryButton && (
                        <Button
                            mx={2}
                            variant="secondary"
                            {...{
                                children: t("common.cancel"),
                                onClick: onClose,
                                ...secondaryButton,
                            }}
                        />
                    )}
                    {mainButton !== null && (
                        <Button
                            data-testid={`${props["data-testid"] || "modal"}-confirm-button`}
                            {...{children: t("common.confirm"), ...mainButton}}
                        />
                    )}
                </Flex>
            </Flex>
        );
    }
    return null;
};

export type ModalProps = ModalBaseProps & {
    mainButton: ButtonProps | null;
    secondaryButton?: ButtonProps | null;
    bannerContent?: ReactNode;
    additionalFooterContent?: ReactNode;
};

const ModalComponent = ({
    id,
    title,
    onClose,
    onShown,
    size = "medium",
    children,
    additionalFooterContent,
    mainButton,
    secondaryButton,
    animation = true,
    overlayColor,
    preventClosingByMouseClick = false,
    calloutProps,
    ...props
}: ModalProps) => {
    return (
        <ModalBase
            id={id}
            title={title}
            onClose={onClose}
            onShown={onShown}
            size={size}
            animation={animation}
            overlayColor={overlayColor}
            preventClosingByMouseClick={preventClosingByMouseClick}
            calloutProps={calloutProps}
            position="relative"
            {...props}
        >
            {props.bannerContent && (
                <Flex
                    py={2}
                    px={4}
                    minHeight={50}
                    alignItems="center"
                    backgroundColor={`blue.ultralight`}
                >
                    {props.bannerContent}
                </Flex>
            )}
            <Flex px={5} pt={5} flexDirection="column" flex={1}>
                {children}
            </Flex>
            <Flex
                mt={4}
                position="sticky"
                bottom={0}
                backgroundColor={"grey.white"}
                borderBottomRightRadius={2}
                borderBottomLeftRadius={2}
            >
                <Flex mt={-4} px={5} pb={4} width="100%" flexDirection="column">
                    <ModalFooter
                        mainButton={mainButton}
                        secondaryButton={secondaryButton}
                        additionalFooterContent={additionalFooterContent}
                        onClose={onClose}
                        {...props}
                    />
                </Flex>
            </Flex>
        </ModalBase>
    );
};

export const renderInModalPortal = (children: ReactNode, rootId?: string) => {
    const dom = document.getElementById(rootId || "react-app-modal-root");
    if (dom === null) {
        Logger.error("Modal root element not found");
        return null;
    }
    return createPortal(children, dom);
};

export const Modal = ({rootId, ...modalProps}: PropsWithChildren<ModalProps>) =>
    renderInModalPortal(<ModalComponent {...modalProps} />, rootId);
