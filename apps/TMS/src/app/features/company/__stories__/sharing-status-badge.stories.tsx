import {AccountType, CountryCode} from "dashdoc-utils";
import React from "react";

import {CompanySharingStatusBadge} from "../company-sharing-status-badge";

export default {
    title: "app/features/company/Sharing status badge",
    component: CompanySharingStatusBadge,
};

const baseCompany = {
    pk: 1,
    remote_id: "",
    trade_number: "",
    siren: "",
    name: "Test company",
    country: "FR" as CountryCode,
    account_type: "subscribed" as AccountType,
    notes: "",
};

export const NotInvited = () => (
    <CompanySharingStatusBadge
        company={{
            ...baseCompany,
            has_loggable_managers: false,
            has_pending_invites: false,
            account_type: "invited",
        }}
    />
);

export const InvitationPending = () => (
    <CompanySharingStatusBadge
        company={{
            ...baseCompany,
            has_loggable_managers: false,
            has_pending_invites: true,
            account_type: "invited",
        }}
    />
);

export const Invited = () => (
    <CompanySharingStatusBadge
        company={{...baseCompany, has_loggable_managers: true, account_type: "invited"}}
    />
);
