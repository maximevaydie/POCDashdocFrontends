import type {CarrierInTransport, ShipperInTransport} from "@dashdoc/web-common";

import {TransportManagedThrough} from "app/types/transport_list_web";

import type {
    ActionType,
    ActivitySiteType,
    ActivityStatus,
    ActivityType,
    AddressWithFullCompany,
    CharteringParentTransport,
    CompanySignatureProcess,
    DeliveryDocument,
    DeliveryTrackingContact,
    InvoiceableCompany,
    PredefinedLoadCategory,
    PurchaseCostLine,
    RealSimpleCompany,
    RequestedVehicle,
    Rest,
    SegmentTrucker,
    Signature,
    SiteSlot,
    SlimQuotationRequest,
    SlimUser,
    SplitTurnover,
    SupportExchange,
    Tag,
    Trailer,
    TransportAddress,
    TransportAddressWithCompany,
    TransportCarrierAssignationStatus,
    TransportGlobalStatus,
    TransportInvoicingStatus,
    TransportMessage,
    TransportStatusCategory,
    Vehicle,
    MinimalTrip,
    ShipperInvoicingStatus,
    ExternalTransport,
    TransportPrices,
    ParentTripForGet,
} from "dashdoc-utils";

export type TransportsToInvoiceQuery = {
    carrier__in: string[];
    text: string[];
    address__in: string[];
    origin_address__in: string[];
    destination_address__in: string[];
    tags__in: string[];
    period?: "today" | "last_week" | "last_month";
    start_date?: string;
    end_date?: string;
    type_of_dates?: "loading" | "unloading" | "created";
    verified: boolean;
    archived: boolean;
    ordering?: string;
    debtor__in: string[];
    shipper__in: string[];
    address_postcode?: string;
    address_country?: string;
    address_text?: string;
    origin_address_postcode?: string;
    origin_address_country?: string;
    origin_address_text?: string;
    destination_address_postcode?: string;
    destination_address_country?: string;
    destination_address_text?: string;
};

export type TransportWasteShipment = {
    uid: string;
    name: string;
    status: string;
};

export type TransportWithCarrierPk = {
    carrier: {pk: number} | null;
};

/**
 * Transport section
 */
export interface Transport {
    __partial?: boolean;
    uid: string;
    created: string;
    created_device: string | null;
    documents: Array<DeliveryDocument>;
    updated: string;
    sequential_id: number;
    invite_code: string;
    status: TransportStatusValue;
    created_by: RealSimpleCompany;
    carrier: CarrierInTransport | null;
    /**
     * @deprecated to remove with betterCompanyRoles FF
     */
    carrier_address: AddressWithFullCompany | null;
    deliveries: Array<Delivery>;
    rental_deliveries: Array<Delivery>;
    segments: Array<Segment>;
    status_updates: Array<TransportStatus>;
    messages: Array<TransportMessage>;
    requested_vehicle: RequestedVehicle | null;
    archived_by: number[];
    remote_id?: string;
    creation_method: string;
    is_order: boolean;
    has_observations: boolean;
    invoice_number: string;
    invoicing_status: TransportInvoicingStatus;
    carrier_reference: string;
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
    requires_washing: boolean;
    business_privacy: boolean;
    prices: TransportPrices | null;
    // Still used by transport invoiceability & missing invoicing data transport header, prefer `prices` otherwise.
    pricing_total_price: string | null;
    customer_to_invoice: InvoiceableCompany | null;
    parent_transports: Array<CharteringParentTransport>;
    parent_trips: Array<ParentTripForGet>;
    volume_display_unit: "m3" | "L";
    deleted: string;
    is_multiple_compartments: boolean;
    loading_plan: string | null;
    shape: "simple" | "grouping" | "ungrouping" | "complex";
    instructions?: string;
    template_name?: string;
    estimated_carbon_footprint: number | null;
    user_carbon_footprint: number | null;
    estimated_distance: number | null;
    tags: Tag[];
    global_status: TransportGlobalStatus;
    external_transport: ExternalTransport | null;
    requires_acceptance: boolean;
    is_deletable: boolean;
    is_cancellable: boolean;
    linked_transports?: {
        uid: string;
        sequential_id: number;
    }[];
    parent_rental_transports?: {
        uid: string;
        sequential_id: number;
    }[];
    shipper: ShipperInTransport;
    shipper_invoicing_status: ShipperInvoicingStatus;
    public_tracking_status?:
        | "created"
        | "on_loading_site"
        | "loading_complete"
        | "on_unloading_site"
        | "unloading_complete";
    purchase_costs?: {
        lines: PurchaseCostLine[];
        total_without_tax: string;
    } | null;
    transport_operation_category: {
        uid: string | null;
        name: string;
    } | null;
    split_turnover: SplitTurnover | null;
    managed_through: TransportManagedThrough | null;
}

export type TransportPost = {
    __partial?: boolean;
    uid: string;
    created: string;
    created_device: string | null;
    status: TransportStatusValue;
    carrier_address: {pk: number};
    deliveries: Array<Delivery>;
    segments: Array<SegmentPost>;
    status_updates: Array<TransportStatus>;
    messages: Array<TransportMessage>;
    requested_vehicle: RequestedVehicle | null;
    archived_by: number[];
    remote_id?: string;
    creation_method: string;
    is_order: boolean;
    has_observations: boolean;
    invoice_number: string;
    carrier_reference: string;
    requires_washing: boolean;
};

/**
 * Site section
 */

export type Site = {
    uid: string;
    category: "" | "loading" | "unloading" | "breaking" | "resuming" | "trip_start" | "trip_end";
    address: TransportAddress | null;
    loading_instructions?: string;
    unloading_instructions?: string;
    signature_process: CompanySignatureProcess; // signature process of the company that created the transport
    supports_exchanges: Array<SupportExchange>;
    reference: string;
    action?: ActionType;
    eta: string | null;
    eta_tracking: boolean;
    punctuality_status: "untracked" | "probably_late" | "probably_on_time" | "late" | "on_time";
    trucker_instructions?: string;
    instructions?: string;
    real_start: string | null;
    real_end: string | null;
    trip?: MinimalTrip;
    is_cancelled: boolean;
    slots: SiteSlot[];
    scheduled_range?: SiteSlot;
    is_booking_needed: boolean;
    locked_requested_times?: boolean;
    manual_emission_value: number | null;
};

/**
 * Delivery section
 */

export type Delivery = {
    uid: string;
    sequential_id: number;
    remote_id?: string;
    tracking_id: string;
    origin: Site;
    destination: Site;
    /**
     * @deprecated to remove with betterCompanyRoles FF
     */
    shipper_address: TransportAddressWithCompany;
    /**
     * TODO: Move to TransportListWeb
     */
    shipper_reference: string;
    loads: Array<Load>;
    origin_loads: Array<Load> | null;
    destination_loads: Array<Load> | null;
    planned_loads: Array<Load>;
    tracking_contacts: Array<DeliveryTrackingContact>;
    multiple_rounds: boolean;
    origin_extracted_weight?: number | null;
    destination_extracted_weight?: number | null;
    origin_weight_extraction_in_progress?: boolean;
    destination_weight_extraction_in_progress?: boolean;
    rounds: Array<Round>;
    rental_details?: {
        total_hours: string;
        worked_hours: string;
        rests: Rest[];
        complementary_information: string;
    };
    is_cancelled: boolean;
};

export interface Round {
    round_id: number;
    origin_load: Load | null;
    destination_load: Load | null;
}

/**
 * Load section
 */

export interface Load {
    uid: string;
    round_id?: number;
    pallet_format?: string;
    pallet_count?: number;
    height: number | null;
    width: number | null;
    length: number | null;
    weight: number | null;
    volume: number | null;
    volume_display_unit: Transport["volume_display_unit"];
    steres: number | null;
    linear_meters: number | null;
    description: string;
    category: PredefinedLoadCategory;
    quantity: number | null;
    complementary_information?: string;
    use_container_seal_number: boolean;
    container_seal_number: string;
    dangerous_goods_category?: string;
    is_dangerous: boolean;
    adr_un_code: string;
    adr_un_description_by_language: Record<string, string>;
    legal_mentions: string | null;
    refrigerated: boolean;
    temperature: string;
    use_container_number: boolean;
    container_number: string;
    tare_weight: number | null;
    remote_id?: string;
    idtf_number: string;
    use_identifiers?: boolean;
    identifiers?: string[];
    identifiers_observations?: string;
    trucker_observations?: string;
    compartment_numbers?: number[];
}

/**
 * Activity section
 */

export interface Activity {
    index: number;
    site: Site;
    deliveries: Array<Delivery>;
    segment?: Segment; // previous or next segment, regarding the type of activity
    previousSegment?: Segment | null; // the segment that ends at the activity site
    nextSegment?: Segment | null; // the segment that starts at the activity site
    statusUpdates: Array<TransportStatus>;
    type: ActivityType;
    instructions?: string;
    transportUid: string;
    siteType: ActivitySiteType;
    listDisplayDate?: string;
    status: ActivityStatus;
    canBeDone: boolean;
    createdBy: RealSimpleCompany;
    isMultipleRounds?: boolean;
    requiresWashing: boolean;
    truckWashed: boolean;
    electronicSignatureRequired: boolean;
    volumeDisplayUnit: Transport["volume_display_unit"];
    isTransportUnderBusinessPrivacy: boolean;
    deliveryDocuments: DeliveryDocument[];
    messageDocuments: TransportMessage[];
    canBeUndone: boolean;
    isCancelled: boolean;
}

/**
 * Segment section
 */

export interface SubcontractingChildTransport {
    uid: string;
    sequential_id: number;
    carrier_assignation_status: TransportCarrierAssignationStatus | null;
    carrier_name: string;
    draft_carrier_name: string;
    instructions: string | null;
    prices: Pick<TransportPrices, "total"> | null;
    status: TransportStatusValue;
    managed_through: TransportManagedThrough | null;
}

export interface SchedulerSegment {
    uid: string;
    origin: Site;
    destination: Site;
    trucker: number;
    transport: string;
}

export interface Segment {
    uid: string;
    origin: Site;
    destination: Site;
    telematic_distance: number | null;
    estimated_distance: number | null;
    user_distance: number | null;
    destination_mileage: number | null;
    origin_mileage: number | null;
    vehicle: Vehicle | null;
    trailers: Array<Trailer>;
    trucker: SegmentTrucker | null;
    scheduled_start_range?: {start: string; end: string};
    scheduled_end_range?: {start: string; end: string};
    remote_id?: string;
    sort_order: number;
    child_transport?: SubcontractingChildTransport | null;
    fuel_consumption?: number;
}

export interface SegmentPost {
    trucker_id?: {pk: number};
    origin?: Partial<Site>;
    destination?: Partial<Site>;
    vehicle?: Partial<Vehicle>;
    trailers?: Array<Partial<Trailer>>;
    scheduled_start_range?: {start: string; end: string};
    scheduled_end_range?: {start: string; end: string};
    uid?: string;
}

export type ActivityMeans = Pick<
    Segment,
    "vehicle" | "trailers" | "trucker" | "child_transport"
> & {
    breakSite?: Site | null;
};

export type TransportActivitiesByMeans = Map<ActivityMeans, Activity[]>;

/**
 * Status section
 */

export type TransportStatusValue = Exclude<
    TransportStatusCategory,
    | "loading_plan_completed"
    | "event"
    | "break_time"
    | "on_the_way"
    | "handling_started"
    | "bulking_break_started"
    | "bulking_break_complete"
    | "deleted"
    | "restored"
    | "round_added"
    | "round_added_v2"
    | "round_edited"
    | "round_deleted"
    | "checklist_filled"
    | "truck_wash"
    | "amended"
    | "activity.amended"
    | "delivery_load.amended"
    | "rest.amended"
    | "unverified"
    | "activity.undone"
    | "carbon_footprint.manual_added"
    | "carbon_footprint.manual_deleted"
    | "supports_exchange.amended"
    | "delivery.added"
>;

export interface TransportStatus {
    uid: string;
    created: string;
    created_device: string | null;
    creation_method: "auto" | "trucker" | "manager" | "telematic";
    category: TransportStatusCategory;
    content_signatory: string;
    author: SlimUser | null;
    author_email: string | null;
    latitude: number | null;
    longitude: number | null;
    content: string;
    update_details?: any;
    site: string | null;
    segment: string | null;
    delivery: string | null;
    transport: string;
    target: SlimUser | null;
    signature: Signature | null;
    additional_data?: any;
    author_company: number | null;
    credit_note: {uid: string; document_number: string; created_by: number} | null;
    invoice: {uid: string; document_number: string | null; created_by: number} | null;
}
