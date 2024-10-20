import {t} from "@dashdoc/web-core";
import {Box, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

import {ClickableUpdateRegionStyleProps} from "./types";

export const ClickableUpdateRegionStyle = styled(Box)<ClickableUpdateRegionStyleProps>`
    position: relative;
    padding: 5px 5px;
    margin-left: -5px;
    margin-right: -5px;

    &:hover {
        background-color: ${theme.colors.grey.ultralight};

        &::after {
            content: "${(props) => props.updateButtonLabel || t("common.edit")}";
            position: absolute;
            right: 0;
            font-size: 12px;
            top: 0;
            border: 1px solid ${theme.colors.grey.light};
            border-radius: 4px;
            padding: 2px 4px;
            margin: 4px;
            background: white;
        }
    }
    cursor: pointer;
`;
