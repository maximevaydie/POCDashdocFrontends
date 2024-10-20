import {Company, SimpleContact} from "dashdoc-utils";

/**
 * @deprecated to remove with betterCompanyRoles FF
 */
export type ContactSelection = {
    key: string; // only to identify the contact in React
    company: Company | null;
    contacts: SimpleContact[];
};

export type CarrierIdAndContactUid = {
    carrier_id: number | null;
    contact_uid: string | null;
};
