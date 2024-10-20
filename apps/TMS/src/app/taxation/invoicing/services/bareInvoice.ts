import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {useState} from "react";
import {z} from "zod";

/** The schema describing the output type of the `invoicing-method-status` endpoint.
 * Must match the output type of `InvoicingMethodOutputDict` in the backend.
 */
export const newEmptyBareInvoiceSchema = z.object({
    uid: z.string(),
});

export type NewEmptyBareInvoice = z.infer<typeof newEmptyBareInvoiceSchema>;

export const validateEmptyBareInvoiceOrRaise = (data: unknown): NewEmptyBareInvoice =>
    newEmptyBareInvoiceSchema.parse(data);

const createBareInvoice = async (customerToInvoicePk: number): Promise<NewEmptyBareInvoice> => {
    try {
        const response: unknown = await apiService.post(
            "invoices/create-bare-invoice/",
            {customer_to_invoice_id: customerToInvoicePk},
            {
                apiVersion: "web",
            }
        );
        const newBareInvoice: NewEmptyBareInvoice = validateEmptyBareInvoiceOrRaise(response);
        return newBareInvoice;
    } catch (error) {
        // TODO: Better error handling
        Logger.error("Error while creating a bare invoice.", error);
        throw error;
    }
};

/** Hook to create a bare invoice via API. */
export const useCreateBareInvoice = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [newBareInvoice, setNewBareInvoice] = useState<NewEmptyBareInvoice | undefined>(
        undefined
    );

    return {
        loading,
        error,
        newBareInvoice,
        createBareInvoice: async (
            customerToInvoicePk: number
        ): Promise<
            | {error: true; newBareInvoice: undefined}
            | {error: false; newBareInvoice: NewEmptyBareInvoice}
        > => {
            setLoading(true);
            setError(false);
            setNewBareInvoice(undefined);
            try {
                const newBareInvoice = await createBareInvoice(customerToInvoicePk);

                setNewBareInvoice(newBareInvoice);
                setLoading(false);
                return {error: false, newBareInvoice};
            } catch (error) {
                setError(true);
                setLoading(false);
                return {error: true, newBareInvoice: undefined};
            }
        },
    };
};
