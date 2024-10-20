import {PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge} from "@dashdoc/web-ui";
import React from "react";

interface Props {
    partner: PartnerDetailOutput;
}

export function PartnerSharingStatusBadge({partner}: Props) {
    if (partner.invitation_status === "registered") {
        return (
            <Badge variant="success" shape="squared">
                {t("addressFilter.invitationSignedUp")}
            </Badge>
        );
    }
    if (partner.invitation_status === "invited") {
        return (
            <Badge variant="blue" shape="squared">
                {t("addressFilter.invitationPending")}
            </Badge>
        );
    }
    return null;
}
