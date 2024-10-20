import {FlexProps} from "@dashdoc/web-ui";
import {ComponentProps, MouseEventHandler} from "react";

import {BadgeColorVariant} from "./constants";
import {StyledBadge} from "./StyledBadge";

export type StyledBadgeProps = FlexProps & {
    variant?: BadgeColorVariant;
};

export type BadgeProps = ComponentProps<typeof StyledBadge> & {
    noWrap?: boolean;
    onDelete?: MouseEventHandler<HTMLElement>;
    size?: "small" | "medium";
    shape?: "rounded" | "squared";
};
