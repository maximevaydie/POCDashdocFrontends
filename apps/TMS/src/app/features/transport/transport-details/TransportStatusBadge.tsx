import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {Badge, BadgeProps} from "@dashdoc/web-ui";
import React from "react";

import type {Transport} from "app/types/transport";

type Props = {
    global_status: Transport["global_status"];
    carrier_assignation_status: Transport["carrier_assignation_status"];
    invoicing_status: Transport["invoicing_status"];
    isOrder: boolean;
};

function getStatusViaInvoicingStatus(invoicing_status: Transport["invoicing_status"]) {
    let text = "";

    switch (invoicing_status) {
        case "UNVERIFIED":
            text = t("components.done");
            break;
        case "VERIFIED":
            text = t("components.verified");
            break;
        case "INVOICED":
            text = t("components.billed");
            break;
        case "PAID":
            text = t("components.paid");
            break;
    }

    return text;
}
export const TransportStatusBadge = ({
    global_status,
    invoicing_status,
    carrier_assignation_status,
    isOrder,
}: Props) => {
    let variant: BadgeProps["variant"] = "neutral";
    let text = "";

    switch (global_status) {
        case "ordered":
            text =
                isOrder && carrier_assignation_status === "assigned"
                    ? t("components.awaitingAcceptance")
                    : t("common.created");
            break;
        case "accepted":
            text = t("components.accepted");
            break;
        case "declined":
            text = isOrder ? t("components.declined") : t("common.created");
            break;
        case "ongoing":
            variant = "purpleDark";
            text = isOrder ? t("components.handledByCarrier") : t("components.ongoing");
            break;
        case "cancelled":
            variant = "errorDark";
            text = t("components.cancelled");
            break;
        case "done":
            variant = "neutralDark";
            text = getStatusViaInvoicingStatus(invoicing_status);
            break;
    }

    return (
        <Badge
            alignSelf="center"
            mr={2}
            variant={variant}
            data-testid="transport-status-badge"
            shape="squared"
        >
            <Text variant="h2" color="unset">
                {text}
            </Text>
        </Badge>
    );
};
