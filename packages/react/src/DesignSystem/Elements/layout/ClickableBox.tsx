import styled from "@emotion/styled";
import {SystemStyleObject} from "@styled-system/css";

import {themeAwareCss} from "../../utils";

import {Box, BoxProps} from "./Box";

export type ClickableBoxProps = BoxProps & {hoverStyle?: SystemStyleObject; disabled?: boolean};

export const ClickableBox = styled(Box)<ClickableBoxProps>(
    ({hoverStyle = {bg: "grey.light"}, disabled = false}) =>
        themeAwareCss(
            disabled
                ? {}
                : {
                      cursor: "pointer",
                      "&:hover": hoverStyle,
                  }
        )
);
