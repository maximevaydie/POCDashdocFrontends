import {CreditNote} from "./creditNote.types";
import {Invoice} from "./invoice.types";

export type InvoiceEmailType = "share" | "reminder" | null;

interface CommunicationStatus {
    pk: number;
    status: "submitted" | "delivered" | "bounced";
    email: string;
    email_type: InvoiceEmailType;
    status_updated_at: Date;
}
export interface InvoiceCommunicationStatus extends CommunicationStatus {
    invoice_status: Invoice["status"] | null;
}

export interface CreditNoteCommunicationStatus extends CommunicationStatus {
    credit_note_status: CreditNote["status"] | null;
}
