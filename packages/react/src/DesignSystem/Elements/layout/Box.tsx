import styled from "@emotion/styled";
import {
    BackgroundColorProps,
    BorderProps,
    ColorStyleProps,
    FlexboxProps,
    LayoutProps,
    OpacityProps,
    PositionProps,
    ShadowProps,
    SpaceProps,
    TypographyProps,
    border,
    color,
    compose,
    flexbox,
    layout,
    position,
    shadow,
    space,
    typography,
} from "styled-system";

import {TestableProps} from "../types";

export type BoxProps = Partial<TestableProps> &
    BorderProps &
    SpaceProps &
    LayoutProps &
    TypographyProps &
    ColorStyleProps &
    BackgroundColorProps &
    ShadowProps &
    OpacityProps &
    PositionProps &
    FlexboxProps & {
        children?: React.ReactNode;
    };

export const Box = styled("div")<BoxProps>(
    {
        boxSizing: "border-box",
        margin: 0,
        minWidth: 0,
    },
    compose(border, space, layout, typography, color, flexbox, shadow, position)
);
