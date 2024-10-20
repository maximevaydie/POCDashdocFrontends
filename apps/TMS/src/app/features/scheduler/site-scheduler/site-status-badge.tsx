import {t} from "@dashdoc/web-core";
import {Box, Text, theme} from "@dashdoc/web-ui";
import React from "react";

import {SiteStatus} from "./types";

export function getStatusData(status: SiteStatus): {
    label: string;
    backgroundColor: string;
    color: string;
} {
    switch (status) {
        case "cancelled":
            return {
                label: t("components.cancelled"),
                backgroundColor: theme.colors.red.ultralight,
                color: theme.colors.red.default,
            };
        case "done":
        case "activity_done":
        case "departed":
            return {
                label: t("activityStatus.done"),
                backgroundColor: theme.colors.green.ultralight,
                color: theme.colors.green.default,
            };
        case "late":
            return {
                label: t("common.delayed"),
                backgroundColor: theme.colors.red.ultralight,
                color: theme.colors.red.default,
            };
        case "on_site":
        case "trucker_arrived":
            return {
                label: t("activityStatus.onSite"),
                backgroundColor: theme.colors.purple.ultralight,
                color: theme.colors.purple.default,
            };
        case "created":
        case "updated":
        case "unassigned":
            return {
                label: t("siteScheduler.status.pending"),
                backgroundColor: theme.colors.yellow.ultralight,
                color: theme.colors.yellow.default,
            };
        case "confirmed":
        case "assigned":
        case "sent_to_trucker":
        case "planned_and_sent":
        case "acknowledged":
        case "on_loading_site":
        case "on_unloading_site":
        case "loading_complete":
        case "unloading_complete":
            return {
                label: t("components.planned"),
                backgroundColor: theme.colors.blue.ultralight,
                color: theme.colors.blue.default,
            };
        default:
            return {
                label: t("common.unknown"),
                backgroundColor: theme.colors.red.ultralight,
                color: theme.colors.red.default,
            };
    }
}

type SiteStatusBadgeProps = {
    status: SiteStatus;
};

export default function SiteStatusBadge({status}: SiteStatusBadgeProps) {
    const statusData = getStatusData(status);
    return (
        <Box
            bg={statusData.color}
            borderRadius={1}
            height="18px"
            textAlign="center"
            verticalAlign="middle"
            paddingX={1}
        >
            <Text lineHeight="18px" variant="captionBold" color="grey.white">
                {statusData.label}
            </Text>
        </Box>
    );
}
