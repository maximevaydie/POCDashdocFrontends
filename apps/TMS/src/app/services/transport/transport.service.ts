import {ApiModels, apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {
    RealSimpleCompany,
    TransportViewerProfile,
    TransportStatusCategory,
    parseAndZoneDate,
    type SlimCompany,
    TransportMessage,
    DeliveryDocument,
    SegmentTrucker,
} from "dashdoc-utils";
import sortBy from "lodash.sortby";

import {activityService} from "app/services/transport/activity.service";
import {isTransportMeansManagedByExtension} from "app/services/transport/transportStatus.service";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import type {
    Activity,
    Site,
    TransportStatus,
    Transport,
    Delivery,
    Segment,
} from "app/types/transport";
import type {
    SegmentListWeb,
    TrailerListWeb,
    TransportListWeb,
    VehicleListWeb,
} from "app/types/transport_list_web";

export function isTransportOrder(
    transport: Transport | TransportListWeb,
    connectedCompanyPk: number | undefined
) {
    return !transportViewerService.isCarrierOf(transport, connectedCompanyPk);
}

export function isTransportCancelled(transport: Transport | TransportListWeb): boolean {
    return !!transport.status_updates.some(
        (statusUpdate: TransportStatus | TransportListWeb["status_updates"][0]) =>
            statusUpdate.category === "cancelled"
    );
}

export type Period = "days" | "weeks";

// Not using usual naming convention to match API params
export type DuplicationParams = {
    keep_hours: boolean;
    keep_trucker_and_plates: boolean;
    begin_date: string | null; // Date to begin the duplication at (inclusive) - ISOString
    end_date: string | null; // Date to end the duplication at (inclusive) - ISOString
    period: Period; // Day interval or days in the week selected
    week_days?: number[]; // Days in the week to put the duplicated transports to
    duplicate_every_x: number; // Interval between each 'batch' of duplicates
    weekend_included?: boolean; // Should the transport be duplicated on week ends ? (only if period == "days")
    transports_per_day: number; // Number of transport to be created per day
};
export async function massDuplicateTransport(transportUid: string, params: DuplicationParams) {
    try {
        const {uids} = await apiService.post(`/transports/${transportUid}/duplicate/`, params, {
            apiVersion: "v4",
        });
        const count = uids.length;
        toast.success(
            t("component.toastCopiesHaveBeenDuplicated", {
                count: count,
                smart_count: count,
            })
        );
        return uids;
    } catch (error) {
        Logger.error(error);
        toast.error(t("transportDuplicate.error"));
    }
}

export type DuplicationPreviewTransportNumber = [string, number];

export function massDuplicateTransportPreview(
    transportUid: string,
    params: DuplicationParams
): Promise<DuplicationPreviewTransportNumber[]> {
    return apiService.post(`/transports/${transportUid}/duplicate-prevalidate/`, params, {
        apiVersion: "v4",
    });
}

export function getTransportProfileLabel(profile: Omit<TransportViewerProfile, "public">) {
    switch (profile) {
        case "carrier":
            return t("common.carrier");
        case "shipper":
            return t("common.shipper");
        case "creator":
            return t("common.creator");
        default:
            return "";
    }
}

export type SimplifiedTransportMeans =
    | {
          extension: ApiModels.Extensions.ShortExtension;
      }
    | {
          isSubcontracted: boolean;
          hasMeansFromDifferentSources: boolean;
          truckers: SegmentTrucker[];
          vehicles: VehicleListWeb[];
          trailers: TrailerListWeb[];
          carriers: string[];
          extensionsManagingChildTransports: ApiModels.Extensions.ShortExtension[];
      };

export function getSimplifiedTransportMeans(
    transport: TransportListWeb
): SimplifiedTransportMeans {
    if (transport.managed_through && isTransportMeansManagedByExtension(transport)) {
        return {
            extension: transport.managed_through.extension,
        };
    }

    let truckers: SegmentTrucker[] = [];
    let vehicles: VehicleListWeb[] = [];
    let trailers: TrailerListWeb[] = [];
    let carriers: string[] = [];
    let extensionsManagingChildTransports: ApiModels.Extensions.ShortExtension[] = [];

    let truckerSeen = new Set<number>();
    let vehiclePkSeen = new Set<number>();
    let trailerPkSeen = new Set<number>();
    let carrierNameSeen = new Set<string>();
    let extensionSeen = new Set<string>();

    for (const segment of transport.segments) {
        if (segment.child_transport) {
            if (segment.child_transport.managed_through) {
                if (!extensionSeen.has(segment.child_transport.managed_through.extension.uid)) {
                    extensionSeen.add(segment.child_transport.managed_through.extension.uid);
                    extensionsManagingChildTransports.push(
                        segment.child_transport.managed_through.extension
                    );
                }
            } else {
                if (
                    segment.child_transport.carrier_name &&
                    !carrierNameSeen.has(segment.child_transport.carrier_name)
                ) {
                    carrierNameSeen.add(segment.child_transport.carrier_name);
                    carriers.push(segment.child_transport.carrier_name);
                }
            }
        }

        if (segment.trucker) {
            if (!truckerSeen.has(segment.trucker.pk)) {
                truckerSeen.add(segment.trucker.pk);
                truckers.push(segment.trucker);
            }
        }

        if (segment.vehicle) {
            if (!vehiclePkSeen.has(segment.vehicle.pk)) {
                vehiclePkSeen.add(segment.vehicle.pk);
                vehicles.push(segment.vehicle);
            }
        }

        for (const trailer of segment.trailers) {
            if (!trailerPkSeen.has(trailer.pk)) {
                trailerPkSeen.add(trailer.pk);
                trailers.push(trailer);
            }
        }
    }

    let sourceOfMeansCount = 0;
    if (
        transport.segments.some(
            (segment) => segment.child_transport && segment.child_transport.managed_through
        )
    ) {
        sourceOfMeansCount++;
    }
    if (
        transport.segments.some(
            (segment) => segment.child_transport && !segment.child_transport.managed_through
        )
    ) {
        sourceOfMeansCount++;
    }
    if (transport.segments.some((segment) => !segment.child_transport)) {
        sourceOfMeansCount++;
    }

    return {
        truckers,
        vehicles,
        trailers,
        carriers,
        extensionsManagingChildTransports,
        isSubcontracted: transport.segments.some((segment) => !!segment.child_transport),
        hasMeansFromDifferentSources: sourceOfMeansCount > 1,
    };
}

export function getStatusUpdate(
    transport: Transport,
    status: TransportStatusCategory,
    siteUid?: string
) {
    return (transport.status_updates ?? []).find((statusUpdate: TransportStatus) => {
        if (siteUid && statusUpdate.site !== siteUid) {
            return false;
        }
        return statusUpdate.category === status;
    });
}

export function getObservations(
    transport: Transport,
    status: "loading_complete" | "unloading_complete",
    siteUid: string
): {trucker: string | undefined; signatory: string | undefined} {
    const update = getStatusUpdate(transport, status, siteUid);
    if (!update) {
        return {trucker: undefined, signatory: undefined};
    }

    return {trucker: update.content, signatory: update.content_signatory};
}

export const getAllCompaniesFromTransport = (
    transport: Transport,
    includeActivities = true
): Partial<SlimCompany>[] => {
    var companiesList: Partial<SlimCompany>[] = [];

    if (transport.carrier) {
        companiesList.push(transport.carrier); // carrier
    }
    companiesList = pushIfNotInArray(companiesList, transport.shipper); // shipper
    if (transport.customer_to_invoice) {
        companiesList = pushIfNotInArray(companiesList, transport.customer_to_invoice);
    }
    companiesList = pushIfNotInArray(companiesList, transport.created_by); // company author of the transport, useful if not carrier or shipper

    if (includeActivities === false) {
        return companiesList;
    }

    for (let delivery of transport.deliveries) {
        if (delivery.origin.address?.company) {
            companiesList = pushIfNotInArray(companiesList, delivery.origin.address.company);
        }
        if (delivery.destination.address?.company) {
            companiesList = pushIfNotInArray(companiesList, delivery.destination.address.company);
        }
    }

    return companiesList;
};

const pushIfNotInArray = (
    companiesList: Partial<RealSimpleCompany>[],
    item: Partial<RealSimpleCompany>
): typeof companiesList => {
    if (companiesList.find((company) => company.pk === item.pk) === undefined) {
        companiesList.push(item);
    }
    return companiesList;
};

export const getCompanyNamesWhoCanAccessMessage = (
    transport: Transport,
    readable_by_company_ids: number[]
) => {
    const companiesList = getAllCompaniesFromTransport(transport);
    const authorizedCompanies: string[] = companiesList.reduce(
        (authorizedCompaniesList, company) => {
            // @ts-ignore
            if (readable_by_company_ids.includes(company.pk)) {
                // @ts-ignore
                authorizedCompaniesList.push(company.name);
            }
            return authorizedCompaniesList;
        },
        []
    );

    return authorizedCompanies;
};

export function getLastStatusUpdateForCategory(
    category: string,
    shipment: Transport
): TransportStatus | null {
    let categoryUpdates: TransportStatus[] = (shipment.status_updates ?? []).filter(
        (status) => status.category === category
    );
    if (categoryUpdates.length === 0) {
        return null;
    }
    return sortBy(categoryUpdates, ["created"])[categoryUpdates.length - 1];
}

export const DANGEROUS_GOODS_CATEGORIES = [
    {value: "1", label: "1 - Substances explosives"},
    {value: "2", label: "2 - Gaz "},
    {value: "3", label: "3 - Liquides ou gaz inflammables"},
    {value: "4.1", label: "4.1 - Matières solides inflammables"},
    {value: "4.2", label: "4.2 - Matières sujettes à l'inflammation spontanée"},
    {
        value: "4.3",
        label: "4.3 - Matières qui, au contact de l'eau, dégagent des gaz inflammables",
    },
    {value: "5.1", label: "5.1 - Matières comburantes"},
    {value: "5.2", label: "5.2 - Peroxydes organiques"},
    {value: "6.1", label: "6.1 - Matières toxiques"},
    {
        value: "6.2",
        label: "6.2 - Matières répugnantes ou susceptibles de produire une infection",
    },
    {value: "7", label: "7 - Matières radioactives"},
    {value: "8", label: "8 - Substances corrosives"},
    {value: "9", label: "9 - Autres marchandises dangereuses"},
];

export const isTransportRental = (transport: Transport): boolean =>
    transport.deliveries[0]?.loads[0]?.category === "rental";

export function getTransportOriginName(transport: Transport) {
    return getSiteName(transport.deliveries[0].origin);
}

export function getTransportDestinationName(transport: Transport) {
    // If we have multiples deliveries in a transport, we take the last one
    const lastDeliveryIndex = transport.deliveries.length - 1;
    const lastDelivery = transport.deliveries[lastDeliveryIndex];
    return getSiteName(lastDelivery.destination);
}

function getSiteName(site: Site) {
    return site.address?.company?.name || site.address?.name;
}

export function getExpectedDeliveryDate(transport: Transport, timezone: string): Date | null {
    const firstUnloadingSlotsStart = parseAndZoneDate(
        transport.segments?.[0]?.destination.slots?.[0]?.start,
        timezone
    );

    return firstUnloadingSlotsStart;
}

export function getTransportChildrenUIDs(transport: Transport): string[] {
    if (transport?.segments) {
        const transportChildren = transport.segments.filter(
            ({child_transport}) => !!child_transport
        );
        const transportChildrenUIDs = transportChildren.map(
            ({child_transport}) => child_transport?.uid as string
        );
        return transportChildrenUIDs;
    }
    return [];
}

export function getDatesConsistency(transport: Transport) {
    const activities = activityService.getTransportActivities(transport);
    const hasAskedDatesInconsistency = activities.some((activity, index) => {
        const activitiesAfter = activities.slice(index + 1);
        return (
            activity.site.slots?.[0]?.start &&
            activitiesAfter.some(
                (a) =>
                    a.site.slots?.[0]?.end &&
                    a.site.slots?.[0]?.end < activity.site.slots?.[0]?.start
            )
        );
    });
    const hasScheduledDates = activities.some((activity) => !!getScheduledDateRange(activity));
    const hasScheduledDatesInconsistency = activities.some((activity, index) => {
        const activitiesAfter = activities.slice(index + 1);
        const scheduledDateRange = getScheduledDateRange(activity);
        return (
            scheduledDateRange?.start &&
            activitiesAfter.some((a) => {
                const endDate = getScheduledDateRange(a)?.end;
                return endDate && endDate < scheduledDateRange.start;
            })
        );
    });
    return {
        hasAskedDatesInconsistency,
        hasScheduledDates,
        hasScheduledDatesInconsistency,
    };
}

export function getScheduledDateRange(activity: Activity) {
    if (["loading", "bulkingBreakEnd"].includes(activity.type)) {
        return activity.segment?.scheduled_start_range;
    }
    // else ["unloading", "bulkingBreakStart"]
    return activity.segment?.scheduled_end_range;
}

/**
 * Checks for missing plates in segments for Qualimat-using companies
 * It doesn't checks for trailer plates, as those are not mandatory
 * @returns boolean wether the segment is complete or not
 */
export function checkSegmentsSanity(transport: Transport) {
    for (let index = 0; index < transport.segments.length; index++) {
        const segment = transport.segments[index];
        if (!segment.vehicle && !segment.child_transport) {
            return false;
        }
    }
    return true;
}

export function getTransportVehicles(transport: Transport | TransportListWeb): VehicleListWeb[] {
    return Object.values(
        (transport.segments ?? []).reduce((acc: Record<string, VehicleListWeb>, segment) => {
            const vehicle = segment.vehicle;
            const licensePlate = vehicle?.license_plate;
            if (licensePlate && !acc[licensePlate]) {
                acc[licensePlate] = vehicle!;
            }
            return acc;
        }, {})
    );
}

export function getTransportTrailers(transport: Transport | TransportListWeb): TrailerListWeb[] {
    return Object.values(
        ((transport.segments as SegmentListWeb[]) ?? []).reduce(
            (acc: Record<string, TrailerListWeb>, segment) => {
                const trailers = segment.trailers;
                trailers.map((trailer) => {
                    if (trailer.license_plate && !acc[trailer.license_plate]) {
                        acc[trailer.license_plate] = trailer!;
                    }
                });
                return acc;
            },
            {}
        )
    );
}

export function getTransportSortedSegments(transport: Transport) {
    let sortedSegments = sortBy(transport.segments, ["sort_order"]);

    if (sortedSegments.length === 0) {
        if (transport.deliveries.length === 1) {
            // in the special case of a single delivery transport with no segments we create a fake segment
            sortedSegments = [
                {
                    origin: transport.deliveries[0].origin,
                    destination: transport.deliveries[0].destination,
                    uid: "",
                    trucker: null,
                    vehicle: null,
                    trailers: [],
                    sort_order: 0,
                    child_transport: null,
                    estimated_distance: null,
                    user_distance: null,
                    telematic_distance: null,
                    origin_mileage: null,
                    destination_mileage: null,
                },
            ];
        } else {
            throw new Error("Unsupported transport with several deliveries but no segments");
        }
    }
    return sortedSegments;
}

export function getTransportSortedSites(transport: Transport) {
    // build a list of all sites visited in order of visit
    const knownActivityUids: Set<string> = new Set();
    const sortedSegments = getTransportSortedSegments(transport);
    const sortedActivities: Site[] = [];

    sortedSegments.forEach((segment) => {
        ["origin", "destination"].forEach((siteType: "origin" | "destination") => {
            const activity = segment[siteType];
            if (!knownActivityUids.has(activity.uid)) {
                knownActivityUids.add(activity.uid);
                sortedActivities.push(activity);
            }
        });
    });

    return sortedActivities;
}

export function getTransportSegmentsBySiteUid(transport: Transport) {
    const sortedSegments = getTransportSortedSegments(transport);

    const segmentsBySiteUid: {
        [siteUid: string]: {
            origin: Segment | null;
            destination: Segment | null;
        };
    } = {};

    sortedSegments.forEach((segment) => {
        ["origin", "destination"].forEach((siteType: "origin" | "destination") => {
            const {uid: siteUid} = segment[siteType];
            segmentsBySiteUid[siteUid] = segmentsBySiteUid[siteUid] || {
                origin: null,
                destination: null,
            };
            segmentsBySiteUid[siteUid][siteType] = segment;
        });
    });

    return segmentsBySiteUid;
}

export function getTransportDeliveriesBySiteUid(transport: Transport) {
    const deliveriesBySiteUid: {
        [siteUid: string]: {origin: Delivery[]; destination: Delivery[]};
    } = {};
    transport.deliveries.forEach((delivery) => {
        ["origin", "destination"].forEach((siteType: "origin" | "destination") => {
            const {uid: siteUid} = delivery[siteType];
            deliveriesBySiteUid[siteUid] = deliveriesBySiteUid[siteUid] || {
                origin: [],
                destination: [],
            };
            deliveriesBySiteUid[siteUid][siteType].push(delivery);
        });
    });

    return deliveriesBySiteUid;
}

type DeliveriesByUid = {
    [deliveryUid: string]: Delivery;
};

const getDeliveriesByUid = (transport: Transport): DeliveriesByUid =>
    transport.deliveries.reduce((deliveriesByUid: DeliveriesByUid, delivery) => {
        deliveriesByUid[delivery.uid] = delivery;
        return deliveriesByUid;
    }, Object.create(null));

type DeliveryDocumentsBySiteUid = {
    [siteUid: string]: DeliveryDocument[];
};

export const getTransportDeliveryDocumentsBySiteUid = (
    transport: Transport
): DeliveryDocumentsBySiteUid => {
    const deliveryDocumentsBySiteUid: DeliveryDocumentsBySiteUid = Object.create(null);
    const deliveries = getDeliveriesByUid(transport);

    transport.documents?.forEach((document) => {
        if (document.file) {
            if (document.delivery !== null) {
                const delivery = deliveries[document.delivery];
                if (delivery) {
                    [delivery.origin.uid, delivery.destination.uid].forEach((siteUid) => {
                        deliveryDocumentsBySiteUid[siteUid] =
                            deliveryDocumentsBySiteUid[siteUid] || [];
                        deliveryDocumentsBySiteUid[siteUid].push(document);
                    });
                }
            }
        }
    });

    return deliveryDocumentsBySiteUid;
};

type MessageDocumentsBySiteUid = {
    [siteUid: string]: TransportMessage[];
};
export const getTransportMessageDocumentsBySiteUid = (
    transport: Transport
): MessageDocumentsBySiteUid => {
    const messageDocumentsBySiteUid: MessageDocumentsBySiteUid = Object.create(null);
    const deliveries = getDeliveriesByUid(transport);

    transport.messages?.forEach((message) => {
        if (message.document) {
            if (message.site !== null) {
                const siteUid = message.site;
                messageDocumentsBySiteUid[siteUid] = messageDocumentsBySiteUid[siteUid] || [];
                messageDocumentsBySiteUid[siteUid].push(message);
            } else if (message.delivery !== null) {
                const delivery = deliveries[message.delivery];
                if (delivery) {
                    [delivery.origin.uid, delivery.destination.uid].forEach((siteUid) => {
                        messageDocumentsBySiteUid[siteUid] =
                            messageDocumentsBySiteUid[siteUid] || [];
                        messageDocumentsBySiteUid[siteUid].push(message);
                    });
                }
            }
        }
    });

    return messageDocumentsBySiteUid;
};
