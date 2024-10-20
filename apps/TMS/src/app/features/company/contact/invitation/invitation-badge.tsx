import {PartnerContactOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {Badge, BadgeProps} from "@dashdoc/web-ui";
import React from "react";

type InvitationBadgeProps = {
    invitationStatus: PartnerContactOutput["invitation_status"];
};

/**
 * {InvitationBadge} combines a {Badge} with a displayable button to resend an invitation if needed.
 * @param {string} contact - Contact of the pk to send the invitation to. Only used if [onResendInvitation] is passed
 */
export function InvitationBadge({invitationStatus}: InvitationBadgeProps) {
    let variant: BadgeProps["variant"];
    let badgeText: string;
    let testId: string;
    if (invitationStatus === "registered") {
        variant = "success";
        badgeText = t("common.activated");
        testId = "invitation-badge-registered";
    } else if (invitationStatus === "invited") {
        variant = "blue";
        badgeText = t("common.awaitingActivation");
        testId = "invitation-badge-invited";
    } else {
        variant = "warning";
        badgeText = t("components.notInvited");
        testId = "invitation-badge-not-invited";
    }

    return (
        <Flex mb={2}>
            <Badge variant={variant} data-testid={testId}>
                {badgeText}
            </Badge>
        </Flex>
    );
}
