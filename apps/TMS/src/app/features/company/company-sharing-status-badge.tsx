import {t} from "@dashdoc/web-core";
import {Badge} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

interface Props {
    company: Company;
}

export function CompanySharingStatusBadge({company}: Props) {
    if (company.has_loggable_managers) {
        return (
            <Badge variant="success" shape="squared">
                {t("addressFilter.invitationSignedUp")}
            </Badge>
        );
    } else if (company.has_pending_invites) {
        return (
            <Badge variant="blue" shape="squared">
                {t("addressFilter.invitationPending")}
            </Badge>
        );
    }
    return null;
}
