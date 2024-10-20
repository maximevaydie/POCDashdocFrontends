export const ApiConstants = {
    ShipmentFields: {
        trucker: "trucker",
        status: "status",

        originAddress: "origin_address",
        originMinDate: "origin_min_date",
        originMaxDate: "origin_max_date",
        originMinTime: "origin_min_time",
        originMaxTime: "origin_max_time",
        originReference: "origin_reference",

        destinationAddress: "destination_address",
        destinationMinDate: "destination_min_date",
        destinationMaxDate: "destination_max_date",
        destinationMinTime: "destination_min_time",
        destinationMaxTime: "destination_max_time",
        destinationReference: "destination_reference",

        shipperName: "shipper_name",
        shipperPhoneNumber: "shipper_phone_number",
        shipperEmailAddress: "shipper_email_address",

        loadDescription: "load_description",
        loadWeight: "load_weight",
        loadHeight: "load_height",
        loadWidth: "load_width",
        loadLength: "load_length",
        loadPalletCount: "load_pallet_count",
        loadPalletFormat: "load_pallet_format",

        needsHatch: "needs_hatch",
        needsLoadingByDriver: "needs_loading_by_driver",
        needsUnloadingByDriver: "needs_unloading_by_driver",
        needsPalletJack: "needs_pallet_jack",
        needsForklift: "needs_forklift",
    },

    dateFormat: "YYYY-MM-DD",

    VehicleCategories: {
        platform: "Semi-remorque Savoyarde",
        curtainsider: "Semi-remorque Tautliner",
        box_body: "Semi-remorque Fourgon",
        flatbed: "Semi-remorque Plateau",
        low_flatbed: "Plateau surbaissé",
        trailer_truck: "Camion remorque",
        light: "VUL (Véhicule Utilitaire Léger, < 3.5t)",
        straight: "Porteur",
        straight_tipper: "Porteur benne",
        tipper: "Benne",
        tipper_cereal: "Benne Céréalière",
        tipper_construction: "Benne TP",
        refrigerated: "Frigorifique",
        isotherm: "Isotherme",
        log: "Porte-grumes",
        container: "Porte-conteneur",
        vehicle: "Porte-véhicules",
        heavy_equipment: "Porte-char",
        solid_tanker: "Citerne solide",
        petrol_tanker: "Citerne pétrolière",
        chemical_tanker: "Citerne chimique",
        food_tanker: "Citerne alimentaire",
        livestock: "Bétaillère",
        special_convoy: "Convoi exceptionnel",
        coil: "Fosse porte-bobines",
    },

    CarrierCategories: {
        category_light: "VUL",
        category_curtainsider: "Bâché",
        category_flatbed: "Plateau",
        category_tipper: "Benne",
        category_refrigerated: "Frigo",
        category_other: "Autre",
    },

    VehicleFeatures: {
        has_hatch: "Hayon",
        has_mounted_forklift: "Chariot Embarqué",
        has_crane: "crane",
        has_moving_floor: "Fond Mouvant",
        has_straps: "Sangles",
        has_square: "Équerres",
    },

    LegalDocumentCategories: {
        license: "Licence de transport",
        merch_insurance: "Attestation d'assurance marchandises",
        vehicle_insurance: "Attestation d'assurance véhicules",
        kbis: "Extrait Kbis de moins de 3 mois",
        fiscal_situation: "Attestation de régularité fiscale",
    },

    Options: {
        needs_hatch_at_loading: "Hayon au chargement",
        needs_hatch_at_unloading: "Hayon au déchargement",
        needs_loading_by_driver: "Chargement par le chauffeur",
        needs_unloading_by_driver: "Déchargement par le chauffeur",
        needs_pallet_jack: "Transpalette",
        needs_forklift: "Chariot embarqué",
        needs_square: "Équerres",
        needs_straps: "Sangles",
        needs_raisable_roof: "Toit réhaussable",
        needs_load_stop_bar: "Barre d'arrêt de charge",
    },
};

export const ShipmentFieldNames = {
    vehicle: "véhicule",
    vehicle_license_plate: "immatriculation du véhicule",
    trailer_license_plate: "immatriculation de la remorque",
    shipper_reference: "référence expéditeur",
    carrier_reference: "référence transporteur",
    origin_reference: "référence expéditeur",
    destination_reference: "référence destinataire",
    carrier_address: "adresse du transporteur",
    shipper_address: "adresse de l'expéditeur",
    origin_address: "adresse d'enlèvement",
    destination_address: "adresse de livraison",
    origin_date: "date d'enlèvement",
    origin_min_time: "début du créneau d'enlèvement",
    origin_max_time: "fin du créneau d'enlèvement",
    destination_date: "date de livraison",
    destination_min_time: "début du créneau de livraison",
    destination_max_time: "fin du créneau de livraison",
    price: "prix",
    loads: "marchandises",
};

export const PalletFormats = [
    {value: "80x120", label: "80cm x 120cm"},
    {value: "100x120", label: "100cm x 120cm"},
];

export const PalletMaxByFormat = {
    "80x120": 33,
    "100x120": 26,
};

export enum SidebarTabNames {
    DASHBOARD = "dashboard",
    SCHEDULER = "scheduler",
    CARRIER_SCHEDULER = "carrier",
    SITE_SCHEDULER = "site",
    ADDRESS_BOOK = "addressBook",
    PARTNERS = "partners",
    ORIGIN = "origin",
    DELIVERY = "delivery",
    LOGISTIC_POINTS = "logisticPoints",
    CONTACTS = "contacts",
    USERS = "users",
    TRACKING = "tracking",
    FLEET = "fleet",
    TRUCKERS = "truckers",
    INVOICE = "invoice",
    CREDIT_NOTES = "creditNotes",
    INVOICES_REPORTS = "invoiceReport",
    REVENUE_REPORTS = "revenueReport",
    INVOICES_EXPORTS = "invoiceExport",
    EXTENSIONS = "extensions",
    ENTITIES = "entities",
    REPORTS = "reports",
    NEW_TRANSPORT = "newTransport",
    NEW_TRANSPORT_COMPLEX = "newComplexTransport",
    NEW_ORDER = "newOrder",
    NEW_ORDER_COMPLEX = "newComplexOrder",
    NEW_TEMPLATE = "newTemplate",
    TEMPLATE_EDITION = "templateEdition",
    TAGS = "tag",
    TRIP_EDITION = "tripEdition",
    CARRIER_ASSIGNATION_RULES = "carrierAssignationRules",
    ACCOUNT = "account",
    TARIFF_GRIDS = "tariffGrids",
    FUEL_SURCHARGES = "fuelSurcharges",
    TRANSPORTS_EXPORT = "transportsExport",
    CARBON_FOOTPRINT = "carbonFootprint",
}

export const TRANSPORTS_QUERY_NAME = "transports";
export const TRUCKERS_QUERY_NAME = "truckers";
export const PARTNER_QUERY_NAME = "partners-list";
export const LOGISTIC_POINT_QUERY_NAME = "logistic-points-list";
export const TRUCKER_STATS_QUERY_NAME = "trucker-stats";
export const SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME = "scheduler-unplanned-segments";
export const SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME = "scheduler-unplanned-basic-trips";
export const SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME = "scheduler-unplanned-prepared-trips";
export const SCHEDULER_PLANNED_TRIPS_QUERY_NAME = "scheduler-planned-trips";
export const CONTACT_QUERY_NAME = "contacts-list";
export const SUPPORT_TYPES_QUERY_NAME = "support-types";
export const MANAGER_QUERY_NAME = "managers";
export const EXPORT_QUERY_NAME = "exports";
export const VEHICLE_QUERY_NAME = "vehicles";
export const TRAILER_QUERY_NAME = "trailers";
export const REQUESTED_VEHICLE_QUERY_NAME = "requested-vehicles";
export const INVOICE_QUERY_NAME = "invoices";
export const CREDIT_NOTES_QUERY_NAME = "creditNotes";
export const FLEET_ITEMS_QUERY_NAME = "fleet-items";
export const SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME = "site-scheduler-shared-activities";
export const TAGS_QUERY_NAME = "tags";
export const NO_IDTF_VALUE = "NO_IDTF";

export enum SimplifiedTransportStatus {
    ONGOING = "ONGOING",
    DONE = "DONE",
    CANCELLED = "CANCELLED",
    UNKNOWN = "UNKNOWN",
}
