import type {CarrierInTransport, ShipperInTransport} from "@dashdoc/web-common";
import {Locale} from "@dashdoc/web-core";
import {
    ActivityType,
    Address,
    AdrUnCode,
    Contact,
    DeliveryTrackingContact,
    ExtractedNewAddress,
    InvoiceableCompany,
    OriginalAddress,
    PricingPost,
    SimpleContact,
    SupportType,
    Trailer,
    TransportAddress,
    Trucker,
    Vehicle,
    PurchaseCostLine,
    RequestedVehicle,
    SiteSlot,
    PredefinedLoadCategory,
} from "dashdoc-utils";

import {TransportOperationCategoryOption} from "app/features/carbon-footprint/transport-operation-category/TransportOperationCategorySelect";
import {PricingFormData} from "app/services/invoicing";

import type {SegmentPost, Load, Site, Transport} from "app/types/transport";

export type TransportToCreateDeprecated = {
    carrier_address: Partial<TransportAddress> | Partial<Address> | number | null;
    carrier_reference: string;
    deliveries: Array<{
        shipper_address: Partial<TransportAddress> | Partial<Address>;
        shipper_reference: string;
        planned_loads: Partial<Load>;
        origin: Partial<Site>;
        destination: Partial<Site>;
        tracking_contacts: Array<Partial<DeliveryTrackingContact>>;
        multiple_rounds: boolean;
    }>;
    segments: Array<SegmentPost>;
    quotation?: PricingPost;
    instructions: string;
    template_name: string | null;
    requested_vehicle: string;
    business_privacy: boolean;
    volume_display_unit: "m3" | "L";
    analytics?: {[key: string]: string | boolean};
    is_template: boolean;
    customer_to_invoice?: {pk: number} | null;
    is_multiple_compartments: boolean;
    requires_washing: boolean;
    send_to_trucker: boolean;
    send_to_carrier?: boolean;
    remote_id?: string;
    transport_operation_category_uid?: string;
};

export type TransportFormValues = {
    templateName?: string;
    // TODO: rename in shipperAndContacts
    shipper: ShipperAndContacts;

    trips: TransportFormTrip[];
    deliveries: TransportFormDelivery[];
    activities: Record<string, TransportFormActivity>;
    orderedActivitiesUids: string[];

    loadings: TransportFormActivity[];
    unloadings: TransportFormActivity[];
    loads: FormLoad[];
    supportExchanges: TransportFormSupportExchange[];
    means?: TransportFormMeans;
    price?: TransportFormPrice | null;
    settings: {
        businessPrivacy: boolean;
        volumeDisplayUnit: Transport["volume_display_unit"];
        wasteManifest?: string;
        transportOperationCategory?: TransportOperationCategoryOption;
    };
    instructions: string;
    multipleRounds?: boolean;
};

export type TransportFormDelivery = {
    loadingUid: string;
    unloadingUid: string;
    loads: FormLoad[];
};

export type TransportFormActivity = {
    uid: string;
    type: Omit<ActivityType, "bulkingBreakStart" | "bulkingBreakEnd">;
    index?: number;
    slots: SiteSlot[];
    // used to handle empty time and avoid autocomplete them with 00:00-23:59
    hasSetAskedTimes?: {
        hasSetAskedMinTime: boolean;
        hasSetAskedMaxTime: boolean;
    };
    truckerInstructions: string;
    instructions: string;
    etaTracking: boolean;
    isBookingNeeded: boolean;
    lockedRequestedTimes?: boolean;
    automaticallySetFromConfirmation?: boolean;
} & TransportActivityAddressContact;

export type TransportFormMeans = {
    trucker?: Trucker;
    vehicle?: Vehicle;
    trailer?: Trailer;
    // TODO: rename in carrierAndContacts
    carrier?: CarrierAndContacts;
    sendToTrucker?: boolean;
    sendToCarrier?: boolean;
    requestedVehicle?: RequestedVehicle | null;
};
export type TransportFormPrice = {
    invoicingAddress?: OriginalAddress | null;
    customerToInvoice?: InvoiceableCompany | null;
    quotation?: PricingFormData | null;
    purchaseCosts?: {
        lines: PurchaseCostLine[];
    };
};

type TransportContacts = {
    contact?: Contact | SimpleContact;
    contacts: Contact[] | SimpleContact[];
    reference?: string;
};

export type CarrierAndContacts = {
    carrier?: CarrierInTransport;
    /**
     * @deprecated to remove with betterCompanyRoles
     */
    address?: Address;
} & TransportContacts;

export type ShipperAndContacts = {
    shipper?: ShipperInTransport;
    /**
     * @deprecated to remove with betterCompanyRoles
     */
    address?: Address;
} & TransportContacts;

export type TransportActivityAddressContact = {
    address?: (Address | ExtractedNewAddress) & {
        pk?: number;
    };
} & TransportContacts;

export type TransportFormDeliveryOption = {
    uid?: string;
    loadingActivity: Partial<TransportFormActivity>;
    unloadingActivity: Partial<TransportFormActivity>;
};

export const tagColors = ["blue", "green", "yellow", "red", "purple", "turquoise"] as const;

export type FormLoad = Omit<
    Load,
    | "adr_un_code"
    | "adr_un_description_by_language"
    | "category"
    | "identifiers_observations" // no need in creation from
    | "dangerous_goods_category" // no need in creation from
    | "volume_display_unit"
> & {
    adrUnCode: AdrUnCode | Pick<AdrUnCode, "code"> | null;
    adrUnDescriptionByLanguage: Partial<Record<Locale, string>>;
    category: PredefinedLoadCategory;
    plannedReturnablePallets: string; // internal field
    delivery: TransportFormDeliveryOption;
    otherCategory: string;
    requiresWashing: boolean;
    isMultipleRounds: boolean;
    isMultipleCompartments: boolean;
    containerNumberChecked: boolean;
    sealNumberChecked: boolean;
};

export type TransportFormTrip = {
    activityUids: string[];
    means: TransportFormMeans | null;
};

export type TransportFormContextData = {
    volumeDisplayUnit: Transport["volume_display_unit"];
    transportShape: Transport["shape"];
    isMultipleRounds: boolean;
    businessPrivacyEnabled: boolean;
    isVehicleUsedForQualimat: boolean;
    isTrailerUsedForQualimat: boolean;
    isMultipleCompartments: boolean;
    requiresWashing: boolean;
    isOrder: boolean;
    isTemplate: boolean;
    loadsCount: number;
    isRental: boolean;
    loadsSmartSuggestionsMap: Map<number, LoadSmartSuggestion>;
    isComplexMode: boolean;
    transportOperationCategory?: TransportOperationCategoryOption;
    groupSimilarActivities?: boolean;
    setGroupSimilarActivities?: (value: boolean) => void;
    isDuplicating: boolean;
};

export type AutoFilledMeansFields = {
    trucker?: string;
    vehicle?: string;
    trailer?: string;
    source: "smartSuggestion" | "meansCombination";
};

export type TransportFormSupportExchange = {
    activity: Partial<TransportFormActivity>;
    type: SupportType;
    expectedRetrieved: number;
    expectedDelivered: number;
};

export type LoadSmartSuggestion = {
    category: string;
    descriptions: string[];
};

export type LoadPost = Omit<
    Load,
    "uid" | "category" | "width" | "height" | "length" | "volume_display_unit"
> & {
    category: string;
};

export type LoadPatch = LoadPost & {
    uid: string;
};

export type SupportExchangePost = {
    support_type_uid: string;
    expected_retrieved: number;
    expected_delivered: number;
};

export type ActivityPost = {
    category: Omit<ActivityType, "bulkingBreakStart" | "bulkingBreakEnd">;
    address_id: number | null | undefined;
    // Used for creating an extracted address when the form is filled from a document
    address:
        | (Omit<ExtractedNewAddress, "longitude" | "latitude"> & {
              coordinates: {
                  longitude: number;
                  latitude: number;
              } | null;
          })
        | undefined;
    requested_range: SiteSlot | null;
    instructions: string;
    is_booking_needed: boolean;
    reference: string;
    trucker_instructions: string;
    supports_exchanges: Array<SupportExchangePost>;
};

export type DeliveryPost = {
    origin_trip_index: number;
    origin_activity_index_in_trip: number;
    destination_trip_index: number;
    destination_activity_index_in_trip: number;
    loads: Array<LoadPost>;
    contact_uids: Array<string>;
};

export type TemplateDeliveryPost = {
    origin_index: number;
    destination_index: number;
    loads: Array<LoadPost>;
    contact_uids: Array<string>;
};

/**
 * @deprecated to remove with betterCompanyRoles
 */
export type TransportPostDeprecated = {
    carrier_address_id: number | null;
    shipper_address_id: number;
    trips: Array<{
        activities: Array<ActivityPost>;
        trucker_id: number | null;
        vehicle_id: number | null;
        trailer_id: number | null;
        send_to_trucker: boolean;
    }>;
    deliveries: Array<DeliveryPost>;
    carrier_reference: string;
    shipper_reference: string;
    instructions: string;
    requested_vehicle_uid: string | null;
    volume_display_unit: string;
    business_privacy: boolean;
    transport_operation_category_uid: string | null;
    quotation: PricingPost | null;
    purchase_costs: {
        lines: PurchaseCostLine[];
    } | null;
    customer_to_invoice_id: number | null;
    is_multiple_rounds: boolean;
    is_multiple_compartments: boolean;
    requires_washing: boolean;
    send_to_carrier: boolean;
    analytics?: {[key: string]: string | boolean};
};

// TODO: To rename in TransportPost when we remove betterCompanyRoles
export type TransportPostWithPartnerPk = {
    carrier_id: number | null;
    shipper_id: number;
    trips: Array<{
        activities: Array<ActivityPost>;
        trucker_id: number | null;
        vehicle_id: number | null;
        trailer_id: number | null;
        send_to_trucker: boolean;
    }>;
    deliveries: Array<DeliveryPost>;
    carrier_reference: string;
    shipper_reference: string;
    instructions: string;
    requested_vehicle_uid: string | null;
    volume_display_unit: string;
    business_privacy: boolean;
    transport_operation_category_uid: string | null;
    quotation: PricingPost | null;
    purchase_costs: {
        lines: PurchaseCostLine[];
    } | null;
    customer_to_invoice_id: number | null;
    is_multiple_rounds: boolean;
    is_multiple_compartments: boolean;
    requires_washing: boolean;
    send_to_carrier: boolean;
    analytics?: {[key: string]: string | boolean};
};

/**
 * TODO: To remove with betterCompanyRoles
 */
export type TransportPost = TransportPostDeprecated | TransportPostWithPartnerPk;

export type CreateTransportResponse = Pick<Transport, "uid" | "sequential_id">;

export type TransportTemplatePost = Omit<
    TransportPost,
    | "trips"
    | "deliveries"
    | "send_to_trucker"
    | "send_to_carrier"
    | "trucker_id"
    | "vehicle_id"
    | "trailer_id"
    | "analytics"
> & {
    activities: Array<ActivityPost>;
    deliveries: Array<TemplateDeliveryPost>;
    template_name: string;
};
