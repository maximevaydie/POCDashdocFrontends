import {SupportedLocale} from "@dashdoc/web-core";

export interface InvoiceNumberingPostData {
    prefix_template: string;
    reset_period: "never" | "year" | "month";
    last_invoice_number_outside_dashdoc: number;
    last_invoice_date_outside_dashdoc: string | null;
}

export interface InvoiceNumberingData extends InvoiceNumberingPostData {
    editable: boolean;
}

export type InvoiceBankInformation = {
    uid: string;
    name: string;
    bank_name: string;
    bank_iban: string;
    bank_bic: string;
    payment_instructions: string;
};

export type InvoiceBankInformationPayload = Omit<InvoiceBankInformation, "uid">;
export interface InvoiceSettings {
    numbering_settings: InvoiceNumberingData;
    bank_information_list: InvoiceBankInformation[];
    legal_mentions_by_language: Partial<Record<SupportedLocale, string>>;
}

export interface InvoiceLegalMentionsData {
    legal_mentions_by_language: Partial<Record<SupportedLocale, string>>;
}
