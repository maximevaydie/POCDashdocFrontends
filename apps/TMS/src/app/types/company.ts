import {
    AccountType,
    CountryCode,
    Address,
    InvoicingAddress,
    Settings,
    SubscriptionAccess,
} from "dashdoc-utils";

export type CompanyInvoicingData = {
    invoicing_address: InvoicingAddress;
    account_code: string;
    side_account_code: string;
};

// ManagerMeCompany should correspond to the Django class ManagerMeCompanySerializer
export interface ManagerMeCompany {
    pk: number;
    created?: string;
    updated?: string;
    deleted?: string;
    name: string;
    phone_number?: string;
    website?: string;
    email?: string;
    siren: string;
    trade_number?: string;
    vat_number?: string;
    legal_form?: string;
    share_capital?: number;
    country: CountryCode;
    comments?: string;
    primary_address?: Address | null;
    settings?: Settings | null;
    is_verified?: boolean;
    managed_by_name?: string;
    account_type: AccountType;
    logo?: string;
    subscription_access?: SubscriptionAccess;
    group_view_id?: number | null;
}
