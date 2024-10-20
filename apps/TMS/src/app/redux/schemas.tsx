import {companySchema} from "@dashdoc/web-common";
import {FleetItem} from "dashdoc-utils";
import {schema} from "normalizr";

// @guidedtour[epic=redux, seq=8] Normalizr: schemas
// Normalizr is a library that allows us to normalize data.
// We can define a schema for each 'model' that we receive from the backend.
// This schema will be used to create 'tables' in the redux store.
// For example a transport has a list of deliveries, segments, status_updates and messages.
// Each of these will be stored in a separate slice of the redux store.
// This way we have a single source of truth for an entity: for example if we do a modification
// to a segment, we don't have to update the transport containing the segment as well.

export const tripSchema = new schema.Entity("trips", {}, {idAttribute: "uid"});
export const siteSchema = new schema.Entity(
    "sites",
    {
        trip: tripSchema,
    },
    {idAttribute: "uid"}
);

export const transportMessageSchema = new schema.Entity(
    "transportMessage",
    {},
    {idAttribute: "uid"}
);

export const deliverySchema = new schema.Entity(
    "deliveries",
    {
        origin: siteSchema,
        destination: siteSchema,
        documents: new schema.Array(transportMessageSchema),
    },
    {idAttribute: "uid"}
);

export const segmentSchema = new schema.Entity(
    "segments",
    {origin: siteSchema, destination: siteSchema},
    {idAttribute: "uid"}
);

export const transportStatusSchema = new schema.Entity(
    "transportStatus",
    {},
    {idAttribute: "uid"}
);

export const purchaseCostLineSchema = new schema.Entity(
    "purchaseCostLines",
    {},
    {idAttribute: "id"}
);

export const transportSchema = new schema.Entity(
    "transports",
    {
        deliveries: new schema.Array(deliverySchema),
        segments: new schema.Array(segmentSchema),
        status_updates: new schema.Array(transportStatusSchema),
        messages: new schema.Array(transportMessageSchema),
        purchase_costs: {
            lines: new schema.Array(purchaseCostLineSchema),
        },
        trips: new schema.Array(tripSchema),
        activities: new schema.Array(siteSchema),
    },
    {
        idAttribute: "uid",
        processStrategy: (entity) => {
            return {
                deliveries: [],
                segments: [],
                status_updates: [],
                messages: [],
                purchase_costs: {},
                ...entity,
            };
        },
    }
);

// 'partialTransportSchema' should only be used when the transport does not necessarily have the deliveries, segments, status_updates, or messages fields.
// Prefer 'transportSchema' if you are not sure about the implication.
export const partialTransportSchema = new schema.Entity(
    "transports",
    {
        deliveries: new schema.Array(deliverySchema),
        segments: new schema.Array(segmentSchema),
        status_updates: new schema.Array(transportStatusSchema),
        messages: new schema.Array(transportMessageSchema),
        purchase_costs: {
            lines: new schema.Array(purchaseCostLineSchema),
        },
    },
    {
        idAttribute: "uid",
    }
);

export const schedulerSiteSchema = new schema.Entity("schedulerSites", {}, {idAttribute: "uid"});
export const schedulerSegmentSchema = new schema.Entity(
    "schedulerSegments",
    {origin: schedulerSiteSchema, destination: schedulerSiteSchema},
    {idAttribute: "uid"}
);

export const schedulerTripSchema = new schema.Entity(
    "schedulerTrips",
    {activities: new schema.Array(siteSchema)},
    {idAttribute: "uid"}
);

export const truckerSchema = new schema.Entity("truckers", {}, {idAttribute: "pk"});
export const truckerStatsSchema = new schema.Entity("trucker-stats", {}, {idAttribute: "pk"});

export const addressSchema = new schema.Entity("addresses", {}, {idAttribute: "pk"});
export const logisticPointSchema = new schema.Entity("logisticPoints", {}, {idAttribute: "pk"});
export const contactSchema = new schema.Entity("contacts", {}, {idAttribute: "uid"});
export const supportTypeSchema = new schema.Entity("support-types", {}, {idAttribute: "uid"});
export const wasteDetailsSchema = new schema.Entity("waste-details", {}, {idAttribute: "pk"});
export const securityProtocolSchema = new schema.Entity(
    "security-protocols",
    {},
    {idAttribute: "pk"}
);
export const exportSchema = new schema.Entity("exports", {}, {idAttribute: "pk"});
export const vehicleSchema = new schema.Entity("vehicles", {}, {idAttribute: "pk"});
export const trailerSchema = new schema.Entity("trailers", {}, {idAttribute: "pk"});
export const connectorSchema = new schema.Entity("connectors", {}, {idAttribute: "pk"});
export const fleetItemSchema = new schema.Entity(
    "fleet-items",
    {},
    {idAttribute: (item: FleetItem) => `${item.type}-${item.pk}`}
);
export const requestedVehicleSchema = new schema.Entity(
    "requested-vehicles",
    {},
    {idAttribute: "uid"}
);
export const tagSchema = new schema.Entity("tags", {}, {idAttribute: "pk"});
export const siteSchedulerSharedActivitySchema = new schema.Entity(
    "site-scheduler-shared-activities",
    {},
    {idAttribute: "id"}
);

export const invoiceLineSchema = new schema.Entity("invoiceLines", {}, {idAttribute: "id"});

export const invoiceLineGroupSchema = new schema.Entity(
    "invoiceLineGroups",
    {lines: new schema.Array(invoiceLineSchema)},
    {idAttribute: "id"}
);

export const invoiceMergedLineGroupsSchema = new schema.Entity(
    "invoiceMergedLineGroups",
    {line_groups: new schema.Array(invoiceLineGroupSchema)},
    {idAttribute: "uid"}
);

export const creditNoteSchema = new schema.Entity("creditNotes", {}, {idAttribute: "uid"});
export const invoiceSchema = new schema.Entity(
    "invoices",
    {
        transports_groups_in_invoice: new schema.Array(invoiceMergedLineGroupsSchema),
        line_groups: new schema.Array(invoiceLineGroupSchema),
        lines: new schema.Array(invoiceLineSchema),
        credit_notes: new schema.Array(creditNoteSchema),
    },
    {idAttribute: "uid"}
);
const quotationSchema = new schema.Entity(
    "quotations",
    {
        carrier: companySchema,
        contact: contactSchema,
    },
    {idAttribute: "uid"}
);
export const quotationRequestSchema = new schema.Entity(
    "quotationRequests",
    {carrier_quotations: new schema.Array(quotationSchema)},
    {idAttribute: "pk"}
);

export const companyInvoicingDataSchema = new schema.Entity(
    "companyInvoicingData",
    {},
    {idAttribute: "company_id"}
);
