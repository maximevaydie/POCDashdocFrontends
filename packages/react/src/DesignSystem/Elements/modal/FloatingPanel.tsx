import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {Icon, OnMobile, OpenSidePanelContext, Text, useDevice} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, ReactNode, useContext, useMemo} from "react";

import {IconButton} from "../button/IconButton";
import {Box, BoxProps} from "../layout/Box";
import {Flex} from "../layout/Flex";
import {ButtonWithShortcut, ButtonWithShortcutProps} from "../misc/ShortcutWrapper";

import {BackgroundOverlay} from "./Modal";

export type FloatingPanelProps = BoxProps & {
    children: ReactNode;
    onClose: () => void;
    animatedFrom?: "left" | "right";
};

const AnimatedFromLeftContainer = styled(Box)<BoxProps>`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    overflow: visible;

    animation-name: show-panel;
    animation-duration: 0.2s;
    animation-timing-function: ease-in-out;

    @keyframes show-panel {
        from {
            left: -100%;
        }
        to {
            left: 0%;
        }
    }
`;

const AnimatedFromRightContainer = styled(Box)<BoxProps>`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;

    overflow: visible;

    animation-name: show-panel;
    animation-duration: 0.2s;
    animation-timing-function: ease-in-out;

    @keyframes show-panel {
        from {
            right: -100%;
        }
        to {
            right: 0%;
        }
    }
`;

export const FloatingPanel: FunctionComponent<FloatingPanelProps> = ({
    onClose,
    width = 1 / 3,
    minWidth = "400px",
    animatedFrom = "right",
    ...props
}) => {
    const overlayKey = useMemo(() => `overlay-${guid()}`, []);
    const [canClose, allowClose, preventClose] = useToggle();
    const AnimatedContainer =
        animatedFrom === "left" ? AnimatedFromLeftContainer : AnimatedFromRightContainer;

    const device = useDevice();

    return (
        <>
            <BackgroundOverlay
                data-testid="floating-panel-background-overlay"
                backgroundColor="neutral.lighterTransparentBlack"
                position="absolute"
                data-overlay={overlayKey}
                onMouseUp={handleMouseUp}
                onMouseDown={onMouseDown}
            >
                <AnimatedContainer
                    width={device === "mobile" ? "100%" : width}
                    minWidth={device === "mobile" ? "100%" : minWidth}
                    onMouseDown={() => {
                        preventClose();
                    }}
                    onMouseUp={() => {
                        preventClose();
                    }}
                >
                    <OnMobile>
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            backgroundColor="neutral.transparentBlack"
                            height="40px"
                        >
                            <Box
                                borderRadius="100%"
                                backgroundColor="grey.white"
                                borderColor="grey.700"
                                border="1px solid"
                                width="32px"
                                height="32px"
                                m="4px"
                            >
                                <Icon name="close" onClick={onClose} lineHeight={"32px"} m="7px" />
                            </Box>
                        </Box>
                    </OnMobile>
                    <Box
                        width="100%"
                        height={device === "mobile" ? "calc(100% - 40px)" : "100%"}
                        marginTop={device === "mobile" ? "40px" : 0}
                        overflowY="auto"
                        overflowX="hidden"
                        boxShadow="medium"
                        backgroundColor="grey.ultralight"
                        borderLeft="1px solid"
                        borderColor="grey.light"
                        {...props}
                    />
                </AnimatedContainer>
            </BackgroundOverlay>
        </>
    );

    function handleMouseUp(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (!canClose) {
            return;
        }
        if (
            "overlay" in (event.target as HTMLDivElement).dataset &&
            (event.target as HTMLDivElement).dataset.overlay === overlayKey
        ) {
            onClose();
        }
    }

    function onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (
            "overlay" in (event.target as HTMLDivElement).dataset &&
            (event.target as HTMLDivElement).dataset.overlay === overlayKey
        ) {
            allowClose();
        }
    }
};

type FloatingPanelHeaderProps = {
    title?: ReactNode;
    onClose: () => void;
    children?: ReactNode;
};
export const FloatingPanelHeader: FunctionComponent<FloatingPanelHeaderProps> = ({
    title,
    onClose,
    children,
}) => {
    if (title === undefined) {
        return null;
    }
    return (
        <Flex justifyContent="space-between" alignItems="center" mb={5}>
            {typeof title === "string" ? (
                <Text variant="title" color="grey.dark">
                    {title}
                </Text>
            ) : (
                title
            )}
            {children}
            <IconButton data-testid="floating-panel-close-button" name="close" onClick={onClose} />
        </Flex>
    );
};

export type FloatingPanelWithValidationButtonsProps = FloatingPanelProps & {
    title?: ReactNode;
    mainButton: ButtonWithShortcutProps | null;
    secondaryButtons?: ButtonWithShortcutProps[];
    indications?: Array<string>;
    children: ReactNode;
};

export const FloatingPanelWithValidationButtons: FunctionComponent<
    FloatingPanelWithValidationButtonsProps
> = ({title, secondaryButtons, mainButton, onClose, indications, children, ...props}) => {
    if (!secondaryButtons) {
        secondaryButtons = [
            {
                variant: "plain",
                onClick: onClose,
                children: <Text>{t("common.cancel")}</Text>,
                shortcutKeyCodes: ["Escape"],
                tooltipLabel: "<i>escap</i>",
                "data-testid": "floating-panel-cancel-button",
            },
        ];
    }
    return (
        <FloatingPanel
            onClose={secondaryButtons?.length > 0 || mainButton ? () => {} : onClose}
            display="flex"
            flexDirection="column"
            backgroundColor="grey.white"
            {...props}
        >
            <Box position="relative" width="100%" height="100%">
                <Box overflowY="auto" px={5} pt={4} height="100%" pb={10}>
                    <FloatingPanelHeader title={title} onClose={onClose} />
                    {children}
                </Box>
                <Box
                    px={5}
                    width="100%"
                    position="absolute"
                    backgroundColor="grey.white"
                    bottom={0}
                    right={0}
                >
                    <Flex></Flex>
                    <Flex
                        py={3}
                        justifyContent="space-between"
                        borderTop="1px solid"
                        borderColor="grey.light"
                        width="100%"
                    >
                        <Box>
                            {indications?.map((indication, index) => (
                                <Text key={index} color="grey.dark">
                                    {indication}
                                </Text>
                            ))}
                        </Box>
                        <Flex pl={3}>
                            {secondaryButtons?.map((secondaryButton, index) => (
                                <ButtonWithShortcut
                                    key={index}
                                    mx={2}
                                    variant="secondary"
                                    {...secondaryButton}
                                />
                            ))}

                            {mainButton && (
                                <ButtonWithShortcut
                                    data-testid="floating-panel-save-button"
                                    {...{
                                        children: t("common.validate"),
                                        shortcutKeyCodes: ["Control", "Enter"],
                                        tooltipLabel: "<i>ctrl + enter</i>",
                                        ...mainButton,
                                    }}
                                />
                            )}
                        </Flex>
                    </Flex>
                </Box>
            </Box>
        </FloatingPanel>
    );
};

export const FloatingPanelWithSidePanel: FunctionComponent<FloatingPanelProps> = ({
    width = 1 / 3,
    minWidth = "400px",
    ...props
}) => {
    const {isOpened: isSidePanelOpened, width: sidePanelWidth} = useContext(OpenSidePanelContext);
    return (
        <FloatingPanel
            width={
                sidePanelWidth && isSidePanelOpened ? `calc(${width} + ${sidePanelWidth})` : width
            }
            minWidth={
                sidePanelWidth && isSidePanelOpened
                    ? `calc(${minWidth} + ${sidePanelWidth})`
                    : minWidth
            }
            {...props}
        />
    );
};
