import {t} from "@dashdoc/web-core";
import {Box, Icon, Text, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import React, {FunctionComponent} from "react";

const Overlay = styled(Box)`
    right: 0px;
    top: 0px;
    z-index: 1000;
    cursor: pointer;

    &:hover {
        background: radial-gradient(
            circle at center,
            ${theme.colors.neutral.transparentBlack},
            ${theme.colors.neutral.lighterTransparentBlack}
        );
        border-radius: 4px;
        box-shadow: inset 0 0 20px ${theme.colors.neutral.transparentBlack};
    }
`;

interface MapOverlayProps {
    cursorOverMiniMap: boolean;
    onMouseOver: () => void;
    onMouseOut: () => void;
    onClick: () => void;
}

export const MapOverlay: FunctionComponent<MapOverlayProps> = ({
    cursorOverMiniMap,
    onMouseOver,
    onMouseOut,
    onClick,
}) => {
    return (
        <Overlay
            position="absolute"
            height="100%"
            width="100%"
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
        >
            {cursorOverMiniMap && (
                <Text
                    textAlign="center"
                    bottom="46%"
                    position="absolute"
                    fontSize={3}
                    width="100%"
                    color="grey.white"
                    css={css`
                        pointer-events: none;
                    `}
                >
                    <Icon name="expand" /> {t("transportMap.clickToOpen")}
                </Text>
            )}
        </Overlay>
    );
};
