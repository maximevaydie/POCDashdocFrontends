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

type NewEmptyBareCreditNote = z.infer<typeof newEmptyBareInvoiceSchema>;

export const validateEmptyBareCreditNoteOrRaise = (data: unknown): NewEmptyBareCreditNote =>
    newEmptyBareInvoiceSchema.parse(data);

const createBareCreditNote = async (
    customerToInvoicePk: number
): Promise<NewEmptyBareCreditNote> => {
    try {
        const response: unknown = await apiService.post(
            `credit-notes/create-bare-credit-note/`,
            {customer_to_invoice_id: customerToInvoicePk},
            {
                apiVersion: "web",
            }
        );

        const newBareCreditNote: NewEmptyBareCreditNote =
            validateEmptyBareCreditNoteOrRaise(response);
        return newBareCreditNote;
    } catch (error) {
        Logger.error("Error while creating a bare invoice.", error);
        throw error;
    }
};

/** Hook to create a bare invoice via API. */
export const useCreateBareCreditNote = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [newBareCreditNote, setNewBareCreditNote] = useState<NewEmptyBareCreditNote | undefined>(
        undefined
    );

    return {
        loading,
        error,
        newBareCreditNote,
        createBareCreditNote: async (
            customerToInvoicePk: number
        ): Promise<
            | {error: true; newBareCreditNote: undefined}
            | {error: false; newBareCreditNote: NewEmptyBareCreditNote}
        > => {
            setLoading(true);
            setError(false);
            setNewBareCreditNote(undefined);
            try {
                const newBareCreditNote = await createBareCreditNote(customerToInvoicePk);

                setNewBareCreditNote(newBareCreditNote);
                setLoading(false);
                return {error: false, newBareCreditNote};
            } catch (error) {
                setError(true);
                setLoading(false);
                return {error: true, newBareCreditNote: undefined};
            }
        },
    };
};
