import {Flex, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {SystemStyleObject} from "@styled-system/css";

import {SupportedStyles} from "./SupportedStyles";

type Props = SupportedStyles & {hoverStyle: SystemStyleObject} & {forceHover?: boolean};

export const ClickableArea = styled(Flex)<Props>(({
    hoverStyle,
    background,
    border,
    forceHover,
}) => {
    if (forceHover) {
        return themeAwareCss({
            background,
            border,
            cursor: "pointer",
            "&:hover": hoverStyle,
            ...hoverStyle,
        });
    }
    return themeAwareCss({
        background,
        border,
        cursor: "pointer",
        "&:hover": hoverStyle,
    });
});
