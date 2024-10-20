import {FilterData, getStaticChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {InvitationStatusQuery} from "./types";

export function getInvitationStatusFilter(): FilterData<InvitationStatusQuery> {
    const items = [
        {label: t("addressFilter.invitationPending"), value: "pending"},
        {label: t("addressFilter.invitationSignedUp"), value: "signed-up"},
        {label: t("addressFilter.invitationNotInvited"), value: "not-invited"},
    ];

    return getStaticChoiceFilter<InvitationStatusQuery>({
        key: "invitation-status",
        label: t("addressFilter.invitationStatus"),
        icon: "share",
        items,
        queryKey: "invitation_status",
        testId: "invitation-status",
    });
}
