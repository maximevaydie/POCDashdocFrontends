import {getAddressShortLabel, getCompanyAndAddressName} from "@dashdoc/web-common";
import {formatVolume, t} from "@dashdoc/web-core";
import {
    TooltipWrapper as BetaTooltipWrapper,
    Box,
    Flex,
    Icon,
    NoWrap,
    SortCriteriaOption,
    Text,
} from "@dashdoc/web-ui";
import {WrapXLines} from "@dashdoc/web-ui";
import {
    PoolOfUnplannedTransportsColumnNames,
    PoolOfUnplannedTripsColumnNames,
    formatDate,
    formatNumber,
    parseAndZoneDate,
} from "dashdoc-utils";
import map from "lodash.map";
import union from "lodash.union";
import unionBy from "lodash.unionby";
import React, {FunctionComponent} from "react";

import {TagTableCell} from "app/features/core/tags/tag-table-cell/TagTableCell";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {SchedulerCardTooltip} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tooltip/components/SchedulerCardTooltip";
import {BookingIcon} from "app/features/transport/transports-list/BookingIcon";

import {
    formatEstimatedDrivingTime,
    getFirstActivity,
    getFirstTransport,
    getLastActivity,
    getLoadsSummary,
    getTripTags,
} from "../trip.service";
import {CompactTrip, SimilarActivity, TripsSortCriterion} from "../trip.types";

import {TripColumn} from "./types";

import type {Load} from "app/types/transport";

export const getSortCriteriaByColumnName = (): Record<
    string,
    Array<SortCriteriaOption<TripsSortCriterion>>
> => {
    return {
        transport_number: [{value: "transport_id", label: `N° ${t("common.transport")}`}],
        activity_start: [
            {value: "origin_site_start", label: t("common.date")},
            {value: "origin_site_company_name", label: t("scheduler.companyName")},
            {value: "origin_site_address_name", label: t("scheduler.addressName")},
        ],
        address_start: [{value: "origin_site_address", label: t("scheduler.startPlace")}],
        address_end: [{value: "destination_site_address", label: t("scheduler.endPlace")}],
        activity_end: [
            {value: "destination_site_start", label: t("common.date")},
            {value: "destination_site_company_name", label: t("scheduler.companyName")},
            {value: "destination_site_address_name", label: t("scheduler.addressName")},
        ],
        vehicle_type: [
            {value: "requested_vehicle_label", label: t("components.requestedVehicle")},
        ],
        vehicle_type_complementary_information: [
            {
                value: "vehicle_type_complementary_information",
                label: t("components.requestedVehicleComplementaryInformation"),
            },
        ],
        shipper: [{value: "shipper_name", label: t("common.shipper")}],
        carrier: [{value: "carrier__name", label: t("common.carrier")}],
        loads: [
            {value: "loads_weight", label: t("components.totalWeight")},
            {value: "loads_linear_meters", label: t("components.totalLinearMeters")},
            {value: "loads_volume", label: t("components.totalVolume")},
            {value: "loads_quantity", label: t("components.totalQuantity")},
            {value: "loads_category", label: t("common.loadType")},
            {value: "loads_description", label: t("components.loadType")},
        ],
        loads_weight: [{value: "loads_weight", label: t("components.totalWeight")}],
        loads_linear_meters: [
            {value: "loads_linear_meters", label: t("components.totalLinearMeters")},
        ],
        loads_volume: [{value: "loads_volume", label: t("components.totalVolume")}],
        loads_quantity: [{value: "loads_quantity", label: t("components.totalQuantity")}],
        means: [],
        tags: [],
        trip_name: [{value: "name", label: t("trip.nameInput")}],
        number_of_activities: [],
        distance: [{value: "estimated_distance", label: t("trip.estimatedDistance")}],
        driving_time: [{value: "estimated_driving_time", label: t("trip.estimatedDrivingTime")}],
    };
};

export const getInitialSortCriteria = (): Array<SortCriteriaOption<TripsSortCriterion>> => {
    return [
        {value: "origin_site_start_date", label: t("common.pickupDate")},
        {value: "destination_site_start_date", label: t("common.deliveryDate")},
        {value: "destination_site_company_name", label: t("scheduler.pickupCompanyName")},
        {value: "origin_site_company_name", label: t("scheduler.deliveryCompanyName")},
        {value: "origin_site_address_name", label: t("scheduler.pickupAddressName")},
        {value: "destination_site_address_name", label: t("scheduler.deliveryAddressName")},
        {value: "shipper_name", label: t("common.shipper")},
        {value: "requested_vehicle_label", label: t("components.requestedVehicle")},
    ];
};

export function getSortTripData(
    trip: CompactTrip,
    criteriaKey: TripsSortCriterion,
    timezone: string
) {
    const origin = getFirstActivity(trip);
    const destination = getLastActivity(trip);
    const transport = getFirstTransport(trip);
    switch (criteriaKey) {
        case "origin_site_start_date":
            return getActivityDate(origin, timezone);
        case "origin_site_company_name":
            return origin?.address?.company?.name;
        case "origin_site_address_name":
            return origin?.address?.name;
        case "destination_site_start_date":
            return getActivityDate(destination, timezone);
        case "destination_site_company_name":
            return destination?.address?.company?.name;
        case "destination_site_address_name":
            return destination?.address?.name;
        case "shipper_name":
            return transport?.shipper.name;
        case "requested_vehicle_label":
            return transport.requested_vehicle?.label ?? "";
        default:
            return "";
    }
}

export const getAddressAndNameLabel = (
    address?: {
        name?: string;
        postcode: string;
        city: string;
        country: string;
        company: {name: string} | null;
    } | null
): string => {
    if (!address) {
        return "";
    }
    return getCompanyAndAddressName(address) + " - " + getAddressShortLabel(address);
};
function getActivityDate(activity: SimilarActivity, timezone: string) {
    let range = null;
    if (activity.scheduled_range) {
        range = activity.scheduled_range;
    } else if (activity.slots?.[0]) {
        range = activity.slots[0];
    }
    if (!range) {
        return "";
    }
    const zonedStart = parseAndZoneDate(range.start, timezone);
    const date = formatDate(zonedStart, "P").substring(0, 5);
    return date;
}
export function getSiteZonedDateLabel(activity: SimilarActivity, timezone: string) {
    let range = null;
    if (activity.scheduled_range) {
        range = activity.scheduled_range;
    } else if (activity.slots?.[0]) {
        range = activity.slots[0];
    }
    if (!range) {
        return "";
    }
    const zonedStart = parseAndZoneDate(range.start, timezone);
    const zonedEnd = parseAndZoneDate(range.end, timezone);
    const date = formatDate(zonedStart, "P").substring(0, 5);
    const minTime = formatDate(zonedStart, "HH:mm");
    const maxTime = formatDate(zonedEnd, "HH:mm");
    const time = minTime === maxTime ? minTime : minTime + " - " + maxTime;

    return date + " " + time;
}

const getSiteCategoryAndDate = (activity: SimilarActivity, timezone: string): string => {
    const category = getSiteCategoryLabel(activity);
    const date = getSiteZonedDateLabel(activity, timezone);
    if (!category) {
        return date;
    }
    if (!date) {
        return category;
    }
    return category + " - " + date;
};

const getSiteCategoryLabel = (activity: SimilarActivity): string => {
    switch (activity.category) {
        case "loading":
            if (
                activity.deliveries_from?.length === 1 &&
                activity.deliveries_from[0].planned_loads?.findIndex(
                    (load) => load.category === "rental"
                ) > -1
            ) {
                return t("activityStatus.startOfRental");
            }
            return t("common.pickup");
        case "unloading":
            if (
                activity.deliveries_to?.length === 1 &&
                activity.deliveries_to[0].planned_loads?.findIndex(
                    (load) => load.category === "rental"
                ) > -1
            ) {
                return t("activityStatus.endOfRental");
            }
            return t("common.delivery");
        case "breaking":
            return t("components.break");
        case "resuming":
            return t("components.resumption");
        default:
            return "";
    }
};

const getTripLoads = (
    trip: CompactTrip
): {loadedLoads: Load[]; unloadedLoads: Load[]; sameLoadsAndUnloads: boolean} => {
    let loadedLoads: Load[] = [];
    let unloadedLoads: Load[] = [];
    trip.activities.map((activity) => {
        if (activity.category === "loading") {
            activity.deliveries_from?.forEach((delivery) => {
                if (delivery.planned_loads) {
                    loadedLoads = loadedLoads.concat(delivery.planned_loads);
                }
            });
        } else if (activity.category === "unloading") {
            activity.deliveries_to?.forEach((delivery) => {
                if (delivery.planned_loads) {
                    unloadedLoads = unloadedLoads.concat(delivery.planned_loads);
                }
            });
        }
    });

    const sameLoadsAndUnloads =
        loadedLoads.length === unloadedLoads.length &&
        unionBy(loadedLoads, unloadedLoads, "uid").length === loadedLoads.length;
    return {loadedLoads, unloadedLoads, sameLoadsAndUnloads};
};

const LoadedUnloadedCell: FunctionComponent<{
    loadsLabel: string;
    unloadsLabel: string;
    sameLoadsAndUnloads: boolean;
}> = ({loadsLabel, unloadsLabel, sameLoadsAndUnloads}) => {
    return sameLoadsAndUnloads ? (
        <WrapXLines numberOfLines={2}>{loadsLabel}</WrapXLines>
    ) : (
        <>
            <NoWrap>
                <Text as="span" variant="subcaption" color="grey.dark" whiteSpace="nowrap">
                    {t("common.loadingShort") + " : "}
                </Text>
                {loadsLabel}
            </NoWrap>
            <NoWrap>
                <Text as="span" variant="subcaption" color="grey.dark" whiteSpace="nowrap">
                    {t("common.deliveryShort") + " : "}
                </Text>
                {unloadsLabel}
            </NoWrap>
        </>
    );
};

const poolColumns: Record<TripColumn["name"], TripColumn> = {
    transport_number: {
        name: "transport_number",
        getLabel: () => "N° " + t("common.transport"),
        width: 95,
        getCellContent: function TransportNumberCell(trip: CompactTrip) {
            const origin = getFirstActivity(trip);
            const fromDeliveries = origin.deliveries_from
                ? map(origin.deliveries_from, "sequential_id")
                : [];
            const toDeliveries = origin.deliveries_to
                ? map(origin.deliveries_to, "sequential_id")
                : [];
            const deliveriesSequentialIds = union(fromDeliveries, toDeliveries).join(", ");
            const transportNumber = getFirstTransport(trip)?.sequential_id;

            return (
                <Box>
                    <NoWrap data-testid="transport-number">N° {transportNumber}</NoWrap>
                    <NoWrap>
                        {deliveriesSequentialIds &&
                            t("documentType.CN") + ": " + deliveriesSequentialIds}
                    </NoWrap>
                </Box>
            );
        },
    },
    trip_name: {
        name: "trip_name",
        getLabel: () => t("trip.nameInput"),
        width: 95,
        getCellContent: function TripName(trip: CompactTrip) {
            return (
                <Box>
                    <NoWrap>{trip.name}</NoWrap>
                </Box>
            );
        },
    },
    activity_start: {
        name: "activity_start",
        getLabel: () => t("scheduler.startActivity"),
        width: 190,
        getCellContent: function ActivityStartCell(
            trip: CompactTrip,
            _view: TripSchedulerView,
            timezone: string
        ) {
            const origin = getFirstActivity(trip);
            return (
                <Box>
                    <Flex>
                        <NoWrap fontWeight="bold" data-testid="activity-category-and-date">
                            {getSiteCategoryAndDate(origin, timezone)}
                        </NoWrap>
                        {origin.is_booking_needed && <BookingIcon />}
                    </Flex>
                    <NoWrap>{getAddressAndNameLabel(origin?.address)} </NoWrap>
                </Box>
            );
        },
    },
    address_start: {
        name: "address_start",
        getLabel: () => t("scheduler.startPlace"),
        width: 110,
        getCellContent: function AddressStartCell(trip: CompactTrip) {
            const origin = getFirstActivity(trip);
            if (!origin || !origin.address) {
                return <></>;
            }
            const address = origin.address;
            return (
                <Box>
                    <NoWrap>
                        {address.country}
                        {address.country ? ", " + address.postcode : address.postcode}
                    </NoWrap>
                    <NoWrap>{address.city} </NoWrap>
                </Box>
            );
        },
    },
    activity_end: {
        name: "activity_end",
        getLabel: () => t("scheduler.endActivity"),
        width: 190,
        getCellContent: function ActivityEndCell(
            trip: CompactTrip,
            _view: TripSchedulerView,
            timezone: string
        ) {
            const destination = getLastActivity(trip);
            return (
                <Box>
                    <Flex>
                        <NoWrap fontWeight="bold">
                            {getSiteCategoryAndDate(destination, timezone)}
                        </NoWrap>
                        {destination.is_booking_needed && <BookingIcon />}
                    </Flex>
                    <NoWrap>{getAddressAndNameLabel(destination?.address)}</NoWrap>
                </Box>
            );
        },
    },
    address_end: {
        name: "address_end",
        getLabel: () => t("scheduler.endPlace"),
        width: 110,
        getCellContent: function AddressEndCell(trip: CompactTrip) {
            const destination = getLastActivity(trip);
            if (!destination || !destination.address) {
                return <></>;
            }
            const address = destination.address;
            return (
                <Box>
                    <NoWrap>
                        {address.country}
                        {address.country ? ", " + address.postcode : address.postcode}
                    </NoWrap>
                    <NoWrap>{address.city} </NoWrap>
                </Box>
            );
        },
    },
    final_destination_address: {
        name: "final_destination_address",
        getLabel: () => t("scheduler.finalDestinationAddress"),
        width: 160,
        getCellContent: function FinalDestinationAddressCell(trip: CompactTrip) {
            if (trip.activities[trip.activities.length - 1].category !== "breaking") {
                return null;
            }
            const lastTransportAddress = trip.last_transport_address;
            if (!lastTransportAddress) {
                return null;
            }
            return (
                <Box>
                    <NoWrap>
                        {lastTransportAddress.company
                            ? lastTransportAddress.company.name
                            : lastTransportAddress.name}
                    </NoWrap>
                    <NoWrap>{getAddressShortLabel(lastTransportAddress)}</NoWrap>
                </Box>
            );
        },
    },
    number_of_activities: {
        name: "number_of_activities",
        getLabel: () => t("scheduler.numberOfActivities"),
        width: 80,
        getCellContent: function IntermediaryActivitiesCell(trip: CompactTrip) {
            return (
                <Flex height="100%">
                    <BetaTooltipWrapper
                        boxProps={{height: "100%"}}
                        content={<SchedulerCardTooltip trip={trip} />}
                        delayShow={400}
                        delayHide={100}
                    >
                        <NoWrap color="blue.default">
                            {t("trip.addSelectedActivitiesNumber", {
                                smart_count: trip.activities.length,
                            })}
                        </NoWrap>
                    </BetaTooltipWrapper>
                    {trip.activities.findIndex((activity) => activity.is_booking_needed) > -1 && (
                        <BookingIcon />
                    )}
                </Flex>
            );
        },
    },
    shipper: {
        name: "shipper",
        getLabel: () => t("common.shipper"),
        width: 110,
        getCellContent: function ShipperCell(trip: CompactTrip) {
            const transport = getFirstTransport(trip);
            return (
                <Box>
                    <NoWrap>{transport?.shipper.name}</NoWrap>
                    <NoWrap>{getAddressShortLabel(transport?.shipper_address)}</NoWrap>
                </Box>
            );
        },
    },
    carrier: {
        name: "carrier",
        getLabel: () => t("common.carrier"),
        width: 110,
        getCellContent: function CarrierCell(trip: CompactTrip) {
            return (
                <Box>
                    <NoWrap
                        color={trip.owned_by_company ? undefined : "blue.default"}
                        fontWeight={trip.owned_by_company ? undefined : "bold"}
                    >
                        {(trip.carrier as {name: string})?.name}
                    </NoWrap>
                </Box>
            );
        },
    },
    loads: {
        name: "loads",
        getLabel: () => t("common.loads"),
        width: 110,
        getCellContent: function LoadsCell(trip: CompactTrip) {
            const {loadedLoads, unloadedLoads, sameLoadsAndUnloads} = getTripLoads(trip);

            let loadsLabel = "";
            let unloadsLabel = "";

            if (loadedLoads.length > 0) {
                loadsLabel = getLoadsSummary(loadedLoads, t);
            }
            if (!sameLoadsAndUnloads) {
                if (unloadedLoads.length > 0) {
                    unloadsLabel = getLoadsSummary(unloadedLoads, t);
                }
            }
            return (
                <BetaTooltipWrapper
                    content={<SchedulerCardTooltip trip={trip} showLoadDetails />}
                    delayShow={400}
                    delayHide={100}
                >
                    <LoadedUnloadedCell
                        loadsLabel={loadsLabel}
                        unloadsLabel={unloadsLabel}
                        sameLoadsAndUnloads={sameLoadsAndUnloads}
                    />
                </BetaTooltipWrapper>
            );
        },
    },
    loads_weight: {
        name: "loads_weight",
        getLabel: () => t("components.totalWeight"),
        width: 110,
        getCellContent: function LoadsWeightCell(trip: CompactTrip) {
            const {loadedLoads, unloadedLoads, sameLoadsAndUnloads} = getTripLoads(trip);
            let loadsWeight = 0;
            let unloadsWeight = 0;

            if (loadedLoads.length > 0) {
                loadedLoads.map((load) => {
                    // @ts-ignore
                    if (!isNaN(parseFloat(load.weight))) {
                        // @ts-ignore
                        loadsWeight += parseFloat(load.weight);
                    }
                });
            }
            if (!sameLoadsAndUnloads) {
                if (unloadedLoads.length > 0) {
                    unloadedLoads.map((load) => {
                        // @ts-ignore
                        if (!isNaN(parseFloat(load.weight))) {
                            // @ts-ignore
                            unloadsWeight += parseFloat(load.weight);
                        }
                    });
                }
            }

            return (
                <LoadedUnloadedCell
                    loadsLabel={
                        loadsWeight > 0
                            ? formatNumber(loadsWeight, {maximumFractionDigits: 0}) +
                              " " +
                              t("pricingMetrics.unit.kg")
                            : ""
                    }
                    unloadsLabel={
                        unloadsWeight > 0
                            ? formatNumber(unloadsWeight, {maximumFractionDigits: 0}) +
                              " " +
                              t("pricingMetrics.unit.kg")
                            : ""
                    }
                    sameLoadsAndUnloads={sameLoadsAndUnloads}
                />
            );
        },
    },
    loads_linear_meters: {
        name: "loads_linear_meters",
        getLabel: () => t("common.linearMeters"),
        width: 110,
        getCellContent: function LoadsWeightCell(trip: CompactTrip) {
            const {loadedLoads, unloadedLoads, sameLoadsAndUnloads} = getTripLoads(trip);
            let loadsLinearMeters = 0;
            let unloadsLinearMeters = 0;

            if (loadedLoads.length > 0) {
                loadedLoads.map((load) => {
                    // @ts-ignore
                    if (!isNaN(parseFloat(load.linear_meters))) {
                        // @ts-ignore
                        loadsLinearMeters += parseFloat(load.linear_meters);
                    }
                });
            }
            if (!sameLoadsAndUnloads) {
                if (unloadedLoads.length > 0) {
                    unloadedLoads.map((load) => {
                        // @ts-ignore
                        if (!isNaN(parseFloat(load.linear_meters))) {
                            // @ts-ignore
                            unloadsLinearMeters += parseFloat(load.linear_meters);
                        }
                    });
                }
            }

            return (
                <LoadedUnloadedCell
                    loadsLabel={
                        loadsLinearMeters > 0
                            ? `${formatNumber(loadsLinearMeters, {maximumFractionDigits: 2})} m.l.`
                            : ""
                    }
                    unloadsLabel={
                        unloadsLinearMeters > 0
                            ? `${formatNumber(unloadsLinearMeters, {
                                  maximumFractionDigits: 2,
                              })} m.l.`
                            : ""
                    }
                    sameLoadsAndUnloads={sameLoadsAndUnloads}
                />
            );
        },
    },
    loads_volume: {
        name: "loads_volume",
        getLabel: () => t("common.volume"),
        width: 110,
        getCellContent: function LoadsVolumeCell(trip: CompactTrip) {
            const {loadedLoads, unloadedLoads, sameLoadsAndUnloads} = getTripLoads(trip);
            const displayUnit = loadedLoads?.[0]?.volume_display_unit;
            let loadsVolume = 0;
            let unloadsVolume = 0;

            if (loadedLoads.length > 0) {
                loadedLoads.map((load) => {
                    if (load.volume !== null) {
                        loadsVolume += load.volume;
                    }
                });
            }
            if (!sameLoadsAndUnloads) {
                if (unloadedLoads.length > 0) {
                    unloadedLoads.map((load) => {
                        if (load.volume !== null) {
                            unloadsVolume += load.volume;
                        }
                    });
                }
            }

            return (
                <LoadedUnloadedCell
                    loadsLabel={
                        loadsVolume > 0 ? formatVolume(loadsVolume, {unit: displayUnit}) : ""
                    }
                    unloadsLabel={
                        unloadsVolume > 0 ? formatVolume(unloadsVolume, {unit: displayUnit}) : ""
                    }
                    sameLoadsAndUnloads={sameLoadsAndUnloads}
                />
            );
        },
    },
    loads_quantity: {
        name: "loads_quantity",
        getLabel: () => t("common.quantity"),
        width: 110,
        getCellContent: function LoadsQuantityCell(trip: CompactTrip) {
            const {loadedLoads, unloadedLoads, sameLoadsAndUnloads} = getTripLoads(trip);
            let loadsQuantity = 0;
            let unloadsQuantity = 0;

            if (loadedLoads.length > 0) {
                loadedLoads.map((load) => {
                    if (load.quantity !== null) {
                        loadsQuantity += load.quantity;
                    }
                });
            }
            if (!sameLoadsAndUnloads) {
                if (unloadedLoads.length > 0) {
                    unloadedLoads.map((load) => {
                        if (load.quantity !== null) {
                            unloadsQuantity += load.quantity;
                        }
                    });
                }
            }

            return (
                <LoadedUnloadedCell
                    loadsLabel={loadsQuantity > 0 ? `${loadsQuantity}` : ""}
                    unloadsLabel={unloadsQuantity > 0 ? `${unloadsQuantity}` : ""}
                    sameLoadsAndUnloads={sameLoadsAndUnloads}
                />
            );
        },
    },
    means: {
        name: "means",
        getLabel: () => t("common.means"),
        width: 100,
        getCellContent: function MeansCell(trip: CompactTrip, view: TripSchedulerView) {
            return (
                <Box>
                    {view !== "trucker" && (
                        <NoWrap>
                            <Icon name="trucker" mr={2} />
                            {trip.trucker ? (
                                trip.trucker.display_name
                            ) : (
                                <Text
                                    as="i"
                                    fontSize="inherit"
                                    lineHeight="inherit"
                                    whiteSpace="nowrap"
                                    color="inherit"
                                >
                                    {t("common.unspecified")}
                                </Text>
                            )}
                        </NoWrap>
                    )}
                    {view !== "vehicle" && (
                        <NoWrap>
                            <Icon name="truck" mr={2} />
                            {trip.vehicle ? (
                                trip.vehicle.license_plate
                            ) : (
                                <Text
                                    as="i"
                                    fontSize="inherit"
                                    lineHeight="inherit"
                                    whiteSpace="nowrap"
                                    color="inherit"
                                >
                                    {t("common.unspecified")}
                                </Text>
                            )}
                        </NoWrap>
                    )}
                    {view !== "trailer" && (
                        <NoWrap>
                            <Icon name="trailer" mr={2} />
                            {trip.trailer ? (
                                trip.trailer.license_plate
                            ) : (
                                <Text
                                    as="i"
                                    fontSize="inherit"
                                    lineHeight="inherit"
                                    whiteSpace="nowrap"
                                    color="inherit"
                                >
                                    {t("common.unspecified")}
                                </Text>
                            )}
                        </NoWrap>
                    )}
                </Box>
            );
        },
    },
    vehicle_type: {
        name: "vehicle_type",
        getLabel: () => t("components.requestedVehicle"),
        width: 100,
        getCellContent: function VehicleTypeCell(trip: CompactTrip) {
            const transport = getFirstTransport(trip);
            if (!transport.requested_vehicle) {
                return null;
            }

            return (
                <Flex alignItems="center" height="100%">
                    <BetaTooltipWrapper
                        content={transport.requested_vehicle.label}
                        delayShow={400}
                        delayHide={100}
                    >
                        <NoWrap>{transport.requested_vehicle.label}</NoWrap>
                    </BetaTooltipWrapper>
                </Flex>
            );
        },
    },
    vehicle_type_complementary_information: {
        name: "vehicle_type_complementary_information",
        getLabel: () => t("components.requestedVehicleComplementaryInformation"),
        width: 100,
        getCellContent: function VehicleTypeComplementaryInformationCell(trip: CompactTrip) {
            const transport = getFirstTransport(trip);
            if (!transport.requested_vehicle) {
                return null;
            }

            return (
                <Flex alignItems="center" height="100%">
                    <BetaTooltipWrapper
                        content={transport.requested_vehicle.complementary_information}
                        delayShow={400}
                        delayHide={100}
                    >
                        <NoWrap>{transport.requested_vehicle.complementary_information}</NoWrap>
                    </BetaTooltipWrapper>
                </Flex>
            );
        },
    },
    tags: {
        name: "tags",
        getLabel: () => t("common.tags"),
        width: 100,
        getCellContent: function TagsCell(trip: CompactTrip) {
            return (
                <TagTableCell tags={getTripTags(trip)} numberOfItemsToDisplay={1} wrap={false} />
            );
        },
    },
    distance: {
        name: "distance",
        getLabel: () => t("trip.estimatedDistance"),
        width: 95,
        getCellContent: function DinstanceCell(trip: CompactTrip) {
            return (
                <Box>
                    <NoWrap>
                        {trip.estimated_distance != null
                            ? trip.estimated_distance +
                              " " +
                              t("pricingMetrics.unit.distance.short")
                            : ""}
                    </NoWrap>
                </Box>
            );
        },
    },
    driving_time: {
        name: "driving_time",
        getLabel: () => t("trip.estimatedDrivingTime"),
        width: 160,
        getCellContent: function DrivingTimeCell(trip: CompactTrip) {
            return (
                <Box>
                    <NoWrap>
                        {trip.estimated_driving_time != null
                            ? formatEstimatedDrivingTime(trip.estimated_driving_time)
                            : ""}
                    </NoWrap>
                </Box>
            );
        },
    },
    turnover: {
        name: "turnover",
        getLabel: () => t("common.turnover"),
        width: 95,
        getCellContent: function DinstanceCell(trip: CompactTrip) {
            return (
                <Box>
                    <NoWrap>
                        {trip.turnover
                            ? formatNumber(trip.turnover, {
                                  style: "currency",
                                  currency: "EUR",
                              })
                            : ""}
                    </NoWrap>
                </Box>
            );
        },
    },
    shipper_reference: {
        name: "shipper_reference",
        getLabel: () => t("scheduler.pool.columns.shipperReference"),
        width: 130,
        getCellContent: function ShipperReferenceCell(trip: CompactTrip) {
            const transport = getFirstTransport(trip);
            return (
                <Box>
                    <NoWrap>{transport.shipper_reference}</NoWrap>
                </Box>
            );
        },
    },
    carrier_reference: {
        name: "carrier_reference",
        getLabel: () => t("scheduler.pool.columns.carrierReference"),
        width: 130,
        getCellContent: function CarrierReferenceCell(trip: CompactTrip) {
            const transport = getFirstTransport(trip);
            return (
                <Box>
                    <NoWrap>{transport.carrier_reference}</NoWrap>
                </Box>
            );
        },
    },
    origin_reference: {
        name: "origin_reference",
        getLabel: () => t("scheduler.pool.columns.originReference"),
        width: 130,
        getCellContent: function OriginReference(trip: CompactTrip) {
            const firstActivity = getFirstActivity(trip);
            return (
                <Box>
                    <NoWrap>{firstActivity.reference}</NoWrap>
                </Box>
            );
        },
    },
    instructions: {
        name: "instructions",
        getLabel: () => t("common.instructions"),
        width: 100,
        getCellContent: function InstructionsCell(trip: CompactTrip) {
            const transport = getFirstTransport(trip);
            return (
                <Box>
                    <BetaTooltipWrapper
                        boxProps={{height: "100%"}}
                        content={transport.instructions}
                        delayShow={400}
                        delayHide={100}
                    >
                        <NoWrap>{transport.instructions}</NoWrap>
                    </BetaTooltipWrapper>
                </Box>
            );
        },
    },
};

export const poolElementaryTripColumns: Record<PoolOfUnplannedTransportsColumnNames, TripColumn> =
    {
        transport_number: poolColumns.transport_number,
        activity_start: poolColumns.activity_start,
        address_start: poolColumns.address_start,
        activity_end: poolColumns.activity_end,
        address_end: poolColumns.address_end,
        final_destination_address: poolColumns.final_destination_address,
        number_of_activities: poolColumns.number_of_activities,
        carrier: poolColumns.carrier,
        shipper: poolColumns.shipper,
        loads: poolColumns.loads,
        loads_weight: poolColumns.loads_weight,
        loads_linear_meters: poolColumns.loads_linear_meters,
        loads_volume: poolColumns.loads_volume,
        loads_quantity: poolColumns.loads_quantity,
        means: poolColumns.means,
        vehicle_type: poolColumns.vehicle_type,
        vehicle_type_complementary_information: poolColumns.vehicle_type_complementary_information,
        tags: poolColumns.tags,
        distance: poolColumns.distance,
        driving_time: poolColumns.driving_time,
        turnover: poolColumns.turnover,
        shipper_reference: poolColumns.shipper_reference,
        carrier_reference: poolColumns.carrier_reference,
        origin_reference: poolColumns.origin_reference,
        instructions: poolColumns.instructions,
    };

export const poolPreparedTripColumns: Record<PoolOfUnplannedTripsColumnNames, TripColumn> = {
    trip_name: poolColumns.trip_name,
    activity_start: poolColumns.activity_start,
    address_start: poolColumns.address_start,
    activity_end: poolColumns.activity_end,
    address_end: poolColumns.address_end,
    number_of_activities: poolColumns.number_of_activities,
    carrier: poolColumns.carrier,
    loads: poolColumns.loads,
    loads_weight: poolColumns.loads_weight,
    loads_linear_meters: poolColumns.loads_linear_meters,
    loads_volume: poolColumns.loads_volume,
    loads_quantity: poolColumns.loads_quantity,
    means: poolColumns.means,
    tags: poolColumns.tags,
    distance: poolColumns.distance,
    driving_time: poolColumns.driving_time,
    turnover: poolColumns.turnover,
};
