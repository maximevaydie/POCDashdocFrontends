import {IconButton, NoWrap} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {BADGE_SIZE_VARIANTS} from "./constants";
import {StyledBadge} from "./StyledBadge";
import {BadgeProps} from "./types";

export const Badge: FC<BadgeProps> = ({
    children,
    size = "medium",
    shape = "rounded",
    noWrap,
    onDelete,
    variant = "blue",
    ...props
}) => {
    return (
        <StyledBadge
            borderRadius={shape === "squared" ? "3px" : "999px"}
            width="fit-content"
            variant={variant}
            {...BADGE_SIZE_VARIANTS[size as "small" | "medium"]}
            {...props}
            display="flex"
            alignItems="center"
        >
            {noWrap ? <NoWrap>{children}</NoWrap> : children}
            {onDelete && (
                <IconButton
                    name="close"
                    color="inherit"
                    hoverBackgroundColor={"neutral.lighterTransparentBlack"}
                    onClick={onDelete}
                    fontSize={0}
                    ml={2}
                    data-testid="badge-delete-button"
                />
            )}
        </StyledBadge>
    );
};
