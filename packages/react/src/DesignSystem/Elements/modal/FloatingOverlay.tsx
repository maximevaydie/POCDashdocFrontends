import {guid} from "@dashdoc/core";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useMemo} from "react";

import {Box, BoxProps} from "../layout/Box";

import {BackgroundOverlay} from "./Modal";

export type FloatingOverlayProps = BoxProps & {
    onClose: () => void;
};

export const FloatingOverlay: FunctionComponent<FloatingOverlayProps> = ({
    onClose,
    maxWidth,
    ...props
}) => {
    const overlayKey = useMemo(() => `overlay-${guid()}`, []);
    const [canClose, allowClose, preventClose] = useToggle(true);
    return (
        <BackgroundOverlay
            data-testid="floating-overlay-background"
            backgroundColor="neutral.lighterTransparentBlack"
            position="absolute"
            justifyContent="flex-end"
            data-overlay={overlayKey}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
        >
            <Box
                width={"calc(100% - 240px)"}
                maxWidth={maxWidth}
                onMouseDown={() => {
                    preventClose();
                }}
                onMouseUp={() => {
                    preventClose();
                }}
            >
                <Box
                    width="100%"
                    height="100%"
                    overflowY="auto"
                    overflowX="hidden"
                    boxShadow="medium"
                    backgroundColor="grey.ultralight"
                    borderLeft="1px solid"
                    borderColor="grey.light"
                    {...props}
                />
            </Box>
        </BackgroundOverlay>
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

    function handleMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (
            "overlay" in (event.target as HTMLDivElement).dataset &&
            (event.target as HTMLDivElement).dataset.overlay === overlayKey
        ) {
            allowClose();
        }
    }
};
