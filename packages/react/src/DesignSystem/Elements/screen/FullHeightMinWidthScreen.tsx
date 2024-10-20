import {Flex, screenSizes} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const FullHeightMinWidthScreen = styled(Flex)`
    min-width: ${screenSizes.lg};
    flex-direction: column;
    height: 100%;
`;

/**
 * Wrapper suited for settings screens (which are usually narrow).
 */
export const FullHeightMinWidthNarrowScreen = styled(Flex)`
    min-width: ${screenSizes.sm};
    flex-direction: column;
    height: 100%;
`;
