export type PaymentDatePeriodQuery = {
    payment_period?: "week" | "last_week" | "month" | "last_month";
    payment_start_date?: string;
    payment_end_date?: string;
};

export type InvoicingDatePeriodQuery = {
    invoicing_period?: "week" | "last_week" | "month" | "last_month";
    invoicing_start_date?: string;
    invoicing_end_date?: string;
};

export type DueDatePeriodQuery = {
    due_period?: "week" | "last_week" | "month" | "last_month";
    due_start_date?: string;
    due_end_date?: string;
};

export type TransportsDatePeriodQuery = {
    transports_period?: "week" | "last_week" | "month" | "last_month";
    transports_start_date?: string;
    transports_end_date?: string;
};
