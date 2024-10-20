import styled from "@emotion/styled";

import {Box} from "../../../Elements/layout/Box";
import {themeAwareCss} from "../../../utils";

import {InlineSVGIconContainerProps} from "./types";

/* Streamline now only lets us download SVG files, so this is the code to handle it */
export const InlineSVGIconContainer = styled(Box.withComponent("i"))<InlineSVGIconContainerProps>(
    ({color, strokeWidth}) =>
        themeAwareCss({
            display: "inline-block",
            alignSelf: "center",
            color,
            strokeWidth: strokeWidth ? `${strokeWidth}px` : "",
        })
);
