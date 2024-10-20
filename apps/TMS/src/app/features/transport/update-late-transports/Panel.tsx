import {Box, BoxProps, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export type PanelProps = BoxProps;

export const Panel = styled(Box)<PanelProps>`
    margin-bottom: 20px;
    padding: 15px;
    background-color: ${theme.colors.grey.white};
    border: 1px solid ${theme.colors.grey.light};
    border-width: 0 1px 2px 1px;
    border-radius: 0;
    box-shadow: ${theme.shadows.small};
`;
