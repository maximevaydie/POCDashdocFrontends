import {z} from "zod";

export const InvoicesOrCreditNotesSettingsSchema = z.object({
    text: z.array(z.string()).optional(),
    customer__in: z.array(z.string()).optional(),
    status__in: z.array(z.enum(["draft", "final", "paid"])).optional(),
    is_late: z.boolean().optional(),
    ordering: z
        .enum([
            "created",
            "-created",
            "debtor",
            "-debtor",
            "customer",
            "-customer",
            "document_number",
            "-document_number",
            "price",
            "-price",
            "price_with_vat",
            "-price_with_vat",
            "due_date",
            "-due_date",
            "invoicing_date",
            "-invoicing_date",
            "status",
            "-status",
            "shared_emails",
            "-shared_emails",
            "reminders",
            "-reminders",
        ])
        .optional(), //  To keep in sync with InvoiceSortableColumnName
    payment_methods: z.array(z.string()).optional(),
    payment_start_date: z.string().nullable().optional(),
    payment_end_date: z.string().nullable().optional(),
    payment_period: z.enum(["week", "last_week", "month", "last_month"]).nullable().optional(),
    invoicing_start_date: z.string().nullable().optional(),
    invoicing_end_date: z.string().nullable().optional(),
    invoicing_period: z.enum(["week", "last_week", "month", "last_month"]).nullable().optional(),
    due_start_date: z.string().nullable().optional(),
    due_end_date: z.string().nullable().optional(),
    due_period: z.enum(["week", "last_week", "month", "last_month"]).nullable().optional(),
    transports_start_date: z.string().nullable().optional(),
    transports_end_date: z.string().nullable().optional(),
    transports_period: z.enum(["week", "last_week", "month", "last_month"]).nullable().optional(),
    is_bare: z.boolean().optional(),
});

export type InvoicesOrCreditNotesSettings = z.infer<typeof InvoicesOrCreditNotesSettingsSchema>;

export const DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS: InvoicesOrCreditNotesSettings = {
    text: undefined,
    customer__in: [],
    status__in: [],
    is_late: undefined,
    ordering: undefined,
    payment_methods: [],
    payment_start_date: undefined,
    payment_end_date: undefined,
    payment_period: undefined,
    invoicing_start_date: undefined,
    invoicing_end_date: undefined,
    invoicing_period: undefined,
    due_start_date: undefined,
    due_end_date: undefined,
    due_period: undefined,
    transports_start_date: undefined,
    transports_end_date: undefined,
    transports_period: undefined,
    is_bare: undefined,
};

export const INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY = "invoices_or_credit_notes";
