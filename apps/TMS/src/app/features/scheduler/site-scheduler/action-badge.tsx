import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

import {ActivityCategory} from "./types";

const getActionLabel = (action: ActivityCategory) => {
    switch (action) {
        case "loading":
            return t("siteScheduler.action.loading");
        case "unloading":
            return t("siteScheduler.action.unloading");
        case "breaking":
            return t("siteScheduler.action.breaking");
        case "resuming":
            return t("siteScheduler.action.resuming");
        default:
            return "";
    }
};

type ActionBadgeProps = {
    action: ActivityCategory;
    borderColor: string;
};

export default function ActionBadge({action, borderColor}: ActionBadgeProps) {
    const actionLabel = getActionLabel(action);

    return (
        <Box
            bg="grey.ultralight"
            height="18px"
            borderStyle="solid"
            borderRadius="4px"
            borderWidth="1px"
            borderColor={borderColor}
            paddingRight="2px"
            paddingLeft="2px"
        >
            <Text variant="captionBold">{actionLabel}</Text>
        </Box>
    );
}
