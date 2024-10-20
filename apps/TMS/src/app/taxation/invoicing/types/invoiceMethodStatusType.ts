import {z} from "zod";

import {
    THIRD_PARTY_NAMES,
    isAuthenticatedZodSchema,
} from "app/taxation/invoicing/types/thirdPartyTypes";

export type InvoiceItemForCatalog = {
    uid: string;
    description: string;
    account_code: string;
    tax_code: {id: number; tax_rate: string};
};

/** The schema describing the output type of the `invoicing-method-status` endpoint.
 * Must match the output type of `InvoicingMethodOutputDict` in the backend.
 */
const DashdocInvoicingZodSchema = z.object({
    invoicing_method: z.literal("dashdoc-invoicing"),
    is_ready_for_invoicing: z.boolean(),
});

export type InvoicingMethodStatusDashdocInvoicing = z.infer<typeof DashdocInvoicingZodSchema>;

const ThirdPartyInvoicingZodSchema = z.object({
    invoicing_method: z.literal("third-party-invoicing"),
    third_party_name: z.enum(THIRD_PARTY_NAMES),
    authentication_details: isAuthenticatedZodSchema,
});

export type InvoicingMethodStatusThirdPartyInvoicing = z.infer<
    typeof ThirdPartyInvoicingZodSchema
>;

const NoInvoicingZodSchema = z.object({
    invoicing_method: z.null(),
});

export const invoicingMethodStatusZodSchema = z.union([
    DashdocInvoicingZodSchema,
    ThirdPartyInvoicingZodSchema,
    NoInvoicingZodSchema,
]);

export type InvoicingMethodStatus = z.infer<typeof invoicingMethodStatusZodSchema>;

export const validateInvoicingMethodStatusOrRaise = (data: unknown): InvoicingMethodStatus =>
    invoicingMethodStatusZodSchema.parse(data);
