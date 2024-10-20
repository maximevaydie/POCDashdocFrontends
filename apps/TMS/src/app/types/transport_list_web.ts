import type {
    ApiModels,
    CarrierInTransport,
    ShipperInTransport,
    SimpleAddress,
} from "@dashdoc/web-common";

import type {Load, TransportStatusValue} from "app/types/transport";
import type {
    AddressWithFullCompany,
    ParentTransportAddress,
    TransportAddress,
    TransportAddressWithCompany,
    Tag,
    SlimQuotationRequest,
    InvoiceableCompany,
    PurchaseCostLine,
    ParentSplitTurnover,
    DeliveryDocument,
    SegmentTrucker,
    ShipperInvoicingStatus,
    SiteSlot,
    TransportCarrierAssignationStatus,
    TransportPrices,
    TransportStatusCategory,
    MessageDocumentType,
    MessageType,
    SignatureMethod,
} from "dashdoc-utils";

interface TransportStatusListWeb {
    pk: number;
    uid: string;
    site: string | null;
    signature: {
        signature_method: SignatureMethod;
        signatory_signed_at: string | null;
    } | null;
    category: TransportStatusCategory;
    created_device: string | null;
    update_details: any;
}

interface TransportMessageListWeb {
    uid: string;
    type: MessageType;
    document_type: MessageDocumentType;
    reference: string;
    document: string;
    ml_document_identification: string;
    author_company_id: number;
    extracted_reference: string | null;
}

export interface TrailerListWeb {
    pk: number;
    original: number;
    license_plate: string;
    fleet_number: string;
}

export interface VehicleListWeb {
    pk: number;
    original: number;
    license_plate: string;
    fleet_number?: string;
}

export type ActivityListWeb = {
    reference: string;
    address: TransportAddress | null;
    uid: string;
    slots: SiteSlot[];
    real_end: string | null;
    category: "" | "loading" | "unloading" | "breaking" | "resuming";
    is_booking_needed: boolean;
};

export interface TransportManagedThrough {
    status: "" | "SEND_IN_PROGRESS" | "SEND_SUCCESS" | "SEND_FAILED" | "ONGOING" | "DONE";
    extension: ApiModels.Extensions.ShortExtension;
}

export interface ChildTransportWeb {
    carrier_name: string;
    id: string;
    uid: string;
    administrative_address: SimpleAddress | null;
    managed_through: TransportManagedThrough | null;
}

export interface SegmentListWeb {
    pk: number;
    uid: string;
    vehicle: VehicleListWeb | null;
    trailers: Array<TrailerListWeb>;
    trucker: SegmentTrucker | null;
    origin: ActivityListWeb;
    destination: ActivityListWeb;
    child_transport?: ChildTransportWeb | null;
}

export type DeliveryListWeb = {
    uid: string;
    /**
     * @deprecated to remove with betterCompanyRoles FF
     */
    shipper_address: TransportAddressWithCompany;
    /**
     * TODO: Move to TransportListWeb
     */
    shipper_reference: string;
    origin: ActivityListWeb;
    destination: ActivityListWeb;
    loads: Array<Load>;
    sequential_id: number;
};

export interface ParentTransport {
    uid: string;
    pk: number;
    prices: TransportPrices | null;
    shipper_address: ParentTransportAddress;
    shipper_pk: number;
}

export interface ParentTripForList {
    uid: string;
    agreed_price: string;
}

export interface TransportListWeb {
    uid: string;
    created: string;
    created_device: string | null;
    sequential_id: number;
    is_order: boolean;
    has_observations: boolean;
    carrier_reference: string;
    business_privacy: boolean;
    tags: Tag[];
    messages: Array<TransportMessageListWeb>;
    status_updates: Array<TransportStatusListWeb>;
    status: TransportStatusValue;
    created_by: {
        pk: number;
        name: string;
    };
    carrier: CarrierInTransport | null;
    /**
     * @deprecated to remove with betterCompanyRoles FF
     */
    carrier_address: AddressWithFullCompany | null;
    carrier_assignation_date: string | null;
    carrier_assignation_mode: "auto" | "manual" | null;
    carrier_assignation_rule: {id: number; name: string; deleted: string | null} | null;
    carrier_assignation_status: TransportCarrierAssignationStatus | null;
    carrier_draft_assigned: CarrierInTransport | null;
    /**
     * @deprecated to remove with betterCompanyRoles FF
     */
    carrier_address_draft_assigned: AddressWithFullCompany | null;
    carrier_quotation_request: SlimQuotationRequest | null;
    documents: Array<DeliveryDocument>;
    segments: Array<SegmentListWeb>;
    deliveries: Array<DeliveryListWeb>;
    parent_transports: Array<ParentTransport>;
    parent_trips: Array<ParentTripForList>;
    customer_to_invoice: InvoiceableCompany | null;
    carbon_footprint: number | null;
    shipper: ShipperInTransport;
    shipper_invoicing_status: ShipperInvoicingStatus;
    invoice_number: string | null;
    prices: TransportPrices | null;
    purchase_costs: {
        lines: PurchaseCostLine[];
        total_without_tax: number;
    } | null;
    parent_split_turnover: ParentSplitTurnover | null;
    managed_through: TransportManagedThrough | null;
}
