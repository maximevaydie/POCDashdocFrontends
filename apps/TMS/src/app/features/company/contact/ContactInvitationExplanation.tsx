import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {SlimCompanyForInvitation} from "dashdoc-utils";
import React from "react";
import {useSelector} from "react-redux";

type Props = {
    company: SlimCompanyForInvitation;
};

export function ContactInvitationExplanation({company}: Props) {
    const connectedCompany = useSelector(getConnectedCompany);
    let explanationText: string;

    if (company.pk === connectedCompany?.pk) {
        explanationText = t("contacts.cantInviteInOwnCompany");
    } else if (company.can_invite_to) {
        explanationText = t("components.contacts.manager", {
            companyName: company.name,
        });
    } else {
        explanationText = t("components.contacts.companyIsSelfManaged", {
            companyName: company.name,
        });
    }

    return <>{explanationText}</>;
}
