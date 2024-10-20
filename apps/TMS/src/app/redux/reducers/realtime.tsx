import {Export} from "dashdoc-utils";
import {DistanceData} from "dashdoc-utils/dist/api/scopes/transports";

import type {
    CreditNoteCommunicationStatus,
    InvoiceCommunicationStatus,
} from "app/taxation/invoicing/types/communicationStatus.types";
import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

export type PusherEvent = {
    data: {
        uid?: string;
        pk?: number;
        type: string;
        [key: string]: unknown;
    };
    timestamp: number;
};

export type BulkDeleteTransportsPusherEvent = {
    data: {
        success: boolean;
        deleted: {
            count: number;
        };
        cancelled: {
            count: number;
        };
    };
    timestamp: number;
};

export type BulkConfirmTransportsPusherEvent = {
    data: {
        success: boolean;
        confirmed: {
            count: number;
        };
    };
    timestamp: number;
};

export type BulkDeclineTransportsPusherEvent = {
    data: {
        success: boolean;
        declined: {
            count: number;
        };
    };
    timestamp: number;
};

export type SendInviteCodeEvent = {
    data: {
        success?: boolean;
        error?: boolean;
        trucker_pk: number;
        trucker_name: string;
        done?: boolean;
    };
    timestamp: number;
};

export type ExportEvent = {
    data: {success: true; export: Export} | {success: false; export: Pick<Export, "data_type">};
    timestamp: number;
};

export type QuotationUpdatedPayload = {transport_uid: string};
export type QuotationUpdatedEvent = {
    data: QuotationUpdatedPayload;
    timestamp: number;
};

export type EstimatedDistanceUpdatedPayload = {
    transport_uid: string;
    estimated_distance: number;
    segment_distances: Record<string, DistanceData>;
};

export type PricingUpdatedPayload = {transport_uid: string};
export type PricingUpdatedEvent = {
    data: PricingUpdatedPayload;
    timestamp: number;
};

export type ShipperFinalPriceUpdatedPayload = {transport_uid: string};
export type ShipperFinalPriceUpdatedEvent = {
    data: ShipperFinalPriceUpdatedPayload;
    timestamp: number;
};

export type InvoiceFileUpdatedPayload = {invoice_uid: Invoice["uid"]; file: Invoice["file"]};
export type CreditNoteFileUpdatedPayload = {
    credit_note_uid: CreditNote["uid"];
    file: CreditNote["file"];
};
export type InvoicePayload = {
    action: "updated" | "added" | "deleted";
    invoice_or_free_transport?: boolean;
    invoice_uid?: string;
} & Partial<Invoice>;

export type InvoiceEvent = {
    timestamp: number;
};

export type CreditNoteEvent = {
    timestamp: number;
};

export type CreditNotePayload = {
    action: "updated" | "added" | "deleted" | "finalized";
} & Partial<CreditNote>;

export type InvoiceCommunicationStatusPayload = {
    invoice_uid: Invoice["uid"];
    communication_status: InvoiceCommunicationStatus;
};
export type CreditNoteCommunicationStatusPayload = {
    credit_note_uid: Invoice["uid"];
    communication_status: CreditNoteCommunicationStatus;
};

// realtimeLegacy (tms) is deprecated, use realtime (common) instead
export type RealtimeLegacyState = {
    lastEvents: {
        transports: PusherEvent | null;
        schedulerTrips: PusherEvent | null;
        truckers: PusherEvent | null;
        bulkDeleteTransports: BulkDeleteTransportsPusherEvent | null;
        bulkConfirmTransports: BulkConfirmTransportsPusherEvent | null;
        bulkDeclineTransports: BulkDeclineTransportsPusherEvent | null;
        inviteCodes: SendInviteCodeEvent | null;
        exports: ExportEvent | null;
        quotationUpdated: QuotationUpdatedEvent | null;
        pricingUpdated: PricingUpdatedEvent | null;
        shipperFinalPriceUpdated: ShipperFinalPriceUpdatedEvent | null;
        invoiceOrFreeTransports: InvoiceEvent | null;
        reloadInvoices: InvoiceEvent | null;
        reloadCreditNotes: CreditNoteEvent | null;
    };
};

const initialState: RealtimeLegacyState = {
    lastEvents: {
        transports: null,
        truckers: null,
        schedulerTrips: null,
        bulkDeleteTransports: null,
        bulkConfirmTransports: null,
        bulkDeclineTransports: null,
        inviteCodes: null,
        exports: null,
        quotationUpdated: null,
        pricingUpdated: null,
        shipperFinalPriceUpdated: null,
        invoiceOrFreeTransports: null,
        reloadInvoices: null,
        reloadCreditNotes: null,
    },
};

export default function realtimeLegacy(state: RealtimeLegacyState = initialState, action: any) {
    switch (action.type) {
        case "ADD_PUSHER_EVENT":
            return {
                ...state,
                lastEvents: {
                    ...state.lastEvents,
                    [action.payload.entities]: {
                        data: action.payload.data,
                        timestamp: action.payload.timestamp,
                    },
                },
            };
        default:
            return state;
    }
}
