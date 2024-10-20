import styled from "@emotion/styled";
import {SystemStyleObject} from "@styled-system/css";

import {themeAwareCss} from "../../utils";

import {Flex, FlexProps} from "./Flex";

export type ClickableFlexProps = FlexProps & {hoverStyle?: SystemStyleObject};

export const ClickableFlex = styled(Flex)<ClickableFlexProps & {disabled?: boolean}>(
    ({hoverStyle = {bg: "grey.light"}, disabled = false}) =>
        themeAwareCss({
            cursor: disabled ? "default" : "pointer",
            "&:hover": disabled ? null : hoverStyle,
        })
);
