import {PartnerContactOutput} from "@dashdoc/web-common/src/types/partnerTypes";
import {Contact} from "dashdoc-utils";

export function getContactInvitationStatus(contact?: Partial<Contact> | PartnerContactOutput) {
    // TODO: Remove me when betterCompanyRoles FF is removed
    if (!contact) {
        return "not_invited";
    }
    if ("invitation_status" in contact) {
        return contact.invitation_status;
    }
    if (contact?.is_manager) {
        return "registered";
    }
    if (contact?.has_pending_invite) {
        return "invited";
    }
    return "not_invited";
}

export function contactIsInvitable(
    contact?: Partial<Contact> | PartnerContactOutput,
    company?: {can_invite_to?: boolean}
) {
    if (!contact || !company) {
        return false;
    }
    if (!company?.can_invite_to) {
        return false;
    }
    return getContactInvitationStatus(contact) !== "registered";
}
