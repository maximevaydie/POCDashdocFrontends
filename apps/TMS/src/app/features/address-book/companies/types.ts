import {periodOptions} from "@dashdoc/web-common";
import {Company} from "dashdoc-utils";
import {z} from "zod";

import {PARTNER_QUERY_NAME} from "app/types/constants";

export type PartnersScreenQuery = {
    text?: string[];

    has_vat_number?: boolean;
    has_trade_number?: boolean;
    has_invoicing_remote_id?: boolean;
    invitation_status?: "pending" | "signed-up" | "not-invited";
    start_date?: string;
    end_date?: string;
    category?: "shipper" | "carrier";

    ordering?: string;
};

export type PartnerListColumnName =
    | keyof Company
    | "account_code"
    | "side_account_code"
    | "transports_in_last_month"
    | "type"
    | "creation_method";

export const PARTNER_QUERY_NAME_UPDATE_COMPANY = `${PARTNER_QUERY_NAME}-company-update`;

export const PartnersSettingsSchema = z.object({
    text: z.array(z.string()).optional(),
    has_vat_number: z.boolean().optional(),
    has_trade_number: z.boolean().optional(),
    has_invoicing_remote_id: z.boolean().optional(),
    invitation_status: z.enum(["pending", "signed-up", "not-invited"]).optional(),
    period: z.enum(periodOptions).optional().nullable(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    category: z.enum(["shipper", "carrier"]).optional(),
});

export type PartnersSettings = z.infer<typeof PartnersSettingsSchema>;
export const PARTNER_VIEW_CATEGORY = "partners";
