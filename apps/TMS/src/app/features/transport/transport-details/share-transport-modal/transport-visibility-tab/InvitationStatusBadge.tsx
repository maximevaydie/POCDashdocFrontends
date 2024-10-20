import {verifiedIcon} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {Badge} from "@dashdoc/web-ui";
import {CompanyInvitationStatus} from "dashdoc-utils";
import React from "react";

export function InvitationStatusBadge({
    isVerified,
    status,
}: {
    isVerified: boolean;
    status: CompanyInvitationStatus;
}) {
    if (isVerified) {
        return (
            <Badge variant="blue" mb={2} shape="squared">
                <Text color="blue.dark" variant="caption" lineHeight="16px">
                    {t("common.dashdocCustomer")} {verifiedIcon}
                </Text>
            </Badge>
        );
    }
    return (
        <Badge variant={status === "registered" ? "success" : "neutral"} mb={2} shape="squared">
            <Text
                textAlign="right"
                color={status === "registered" ? "green.dark" : "grey.dark"}
                lineHeight="16px"
                variant="caption"
            >
                {getInvitationStatusLabel(status)}
            </Text>
        </Badge>
    );
}

function getInvitationStatusLabel(invitationStatus: CompanyInvitationStatus) {
    const invitationStatusLabels: Record<CompanyInvitationStatus, string> = {
        invited: t("transportDetails.shareTransportModal.invitationStatusNotRegistered"),
        registered: t("addressFilter.invitationSignedUp"),
        "not invited": t("transportDetails.shareTransportModal.invitationStatusNotRegistered"),
    };
    return invitationStatusLabels[invitationStatus];
}
