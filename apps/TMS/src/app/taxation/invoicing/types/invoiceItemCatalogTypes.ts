import {z} from "zod";

export type InvoiceItemForCatalog = {
    uid: string;
    description: string;
    account_code: string;
    enabled: boolean;
    tax_code: {id: number; tax_rate: string};
};
/** Must match the backend `TaxCodeOutputSerializer` */
export const taxCodeForCatalogZodSchema = z.object({
    id: z.number(),
    country: z.string(),
    tax_rate: z.string(), // backend DecimalField in percentage
    dashdoc_id: z.string(),
});

export const taxCodelistForCatalogZodSchema = z.array(taxCodeForCatalogZodSchema);

export type TaxCodeForCatalog = z.infer<typeof taxCodeForCatalogZodSchema>;

export type InvoiceItemForCatalogCreationRequest = {
    description: string;
    account_code: string;
    tax_code_id: number;
    enabled: boolean;
};
