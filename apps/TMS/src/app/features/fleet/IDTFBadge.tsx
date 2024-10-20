import {t} from "@dashdoc/web-core";
import {Badge, BadgeProps} from "@dashdoc/web-ui";
import React from "react";

interface IDTFBadgeProps extends BadgeProps {}

export default function IDTFBadge({size = "medium", ...boxProps}: IDTFBadgeProps) {
    return (
        <Badge variant="purple" shape="squared" size={size} {...boxProps}>
            {t("idtf.label")}
        </Badge>
    );
}
