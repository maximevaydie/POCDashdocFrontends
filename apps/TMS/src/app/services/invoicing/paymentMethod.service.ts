import {formatDate} from "dashdoc-utils";
import {z} from "zod";

import {TrackingInvoicePaymentFormType} from "app/features/pricing/invoices/TrackingInvoicePaymentForm";

export const trackingInvoicePaymentSchema = z.object({
    paid_at: z.date().optional().nullable(),
    payment_method: z
        .object({
            uid: z.string(),
        })
        .optional()
        .nullable(),
    payment_notes: z.string().optional(),
});

export type MarkPaidInvoicePayload = {
    paid_at?: string;
    payment_method_uid?: string;
    payment_notes?: string;
};

export const formatTrackingInvoicePaymentPayload = (
    payload: TrackingInvoicePaymentFormType
): MarkPaidInvoicePayload => {
    return {
        paid_at: payload.paid_at ? formatDate(payload.paid_at, "yyyy-MM-dd") : undefined,
        payment_method_uid: payload.payment_method?.uid,
        payment_notes: payload.payment_notes,
    };
};
