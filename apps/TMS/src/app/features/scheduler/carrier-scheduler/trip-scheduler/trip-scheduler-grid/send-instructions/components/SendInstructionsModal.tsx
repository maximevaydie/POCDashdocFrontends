import {dateService, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    LoadingWheel,
    Modal,
    NoWrap,
    SelectOption,
    Text,
    buttonVariants,
    toast,
} from "@dashdoc/web-ui";
import {TransportAddress, Trucker, formatDate, parseAndZoneDate, useToggle} from "dashdoc-utils";
import {formatISO} from "date-fns";
import flatten from "lodash.flatten";
import React, {useContext, useState} from "react";
import {useDispatch} from "react-redux";

import {TruckerSelect} from "app/features/fleet/trucker/TruckerSelect";
import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {CardAddressText} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/CardAddressText";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import useSimpleFetch from "app/hooks/useSimpleFetch";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchBulkAssignTripToTrucker} from "app/redux/actions/scheduler-trip";
import {fetchBulkSendTripTruckerNotification} from "app/redux/actions/trips";
import {ResourcesQueryContext} from "app/screens/scheduler/hook/useResourcesQueryContext";

type SimplifiedTrip = {
    uid: string;
    is_prepared: boolean;
    name: string;
    transport_id: string | null;
    scheduled_start: string;
    vehicle: {license_plate: string; fleet_number: string; id: number};
    trailer: {license_plate: string; fleet_number: string; id: number};
    trucker: {display_name: string; id: number};
    activities: {address: {address: string; postcode: string; country: string}}[];
};

type TripsByTruckerOrVehicle = {
    [key: string]: SimplifiedTrip[];
};

const getToasterData = (trip: SimplifiedTrip) => {
    return {
        transport_pk: trip.is_prepared ? trip.name : trip.transport_id || "",
        trucker_name: trip.trucker?.display_name ?? "",
    };
};

type SendInstructionButtonProps = {
    uids: string[];
    label: string;
    variant: keyof typeof buttonVariants;
    successToasterDatas: {transport_pk: number | string; trucker_name: string}[];
    extendedView: boolean;
};

export function SendInstructionButton({
    uids,
    label,
    variant,
    successToasterDatas,
    extendedView,
}: SendInstructionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const dispatch = useDispatch();

    const handleSendInstructionSubmit = () => {
        setIsLoading(true);
        fetchBulkSendTripTruckerNotification(
            uids,
            extendedView
        )(dispatch)
            .then(() => {
                setIsLoading(false);
                setIsDisabled(true);
                for (let data of successToasterDatas) {
                    const message = t("scheduler.toasterMissionSentToTrucker", {
                        transport: data.transport_pk,
                        trucker: data.trucker_name,
                    });
                    toast.success(message);
                }
            })
            .catch(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <Button
                variant={variant}
                loading={isLoading}
                disabled={isDisabled || !uids || uids.length === 0}
                onClick={handleSendInstructionSubmit}
            >
                {label}
            </Button>
        </>
    );
}

function SendInstructionLine({
    trip,
    viewMode,
    extendedView,
    onAssign,
}: {
    trip: SimplifiedTrip;
    viewMode: TripSchedulerView;
    extendedView: boolean;
    onAssign: () => void;
}) {
    const dispatch = useDispatch();
    const timezone = useTimezone();

    const [isLoading, startLoading, stopLoading] = useToggle(false);
    const onChangeTruckerTrucker = (value: SelectOption<Trucker>) => {
        startLoading();
        fetchBulkAssignTripToTrucker(
            [trip.uid],
            value?.value?.pk,
            trip.scheduled_start,
            undefined,
            undefined,
            extendedView
        )(dispatch).then(() => {
            stopLoading();
            onAssign();
        });
    };

    return (
        <Flex alignItems="center">
            <Text fontWeight="bold" flex="2">
                {formatDate(parseAndZoneDate(trip.scheduled_start, timezone), "HH:mm")}
            </Text>

            <Text flex="3">
                {trip.is_prepared
                    ? trip.name
                    : t("transportDetails.transportNumber", {
                          number: trip.transport_id,
                      })}{" "}
            </Text>
            <Box flex="4">
                <CardAddressText
                    address={trip.activities[0].address as TransportAddress}
                    maxLength={5}
                />
                <Icon name="thickArrowRight" mx={1} />
                <CardAddressText
                    address={
                        trip.activities[trip.activities.length - 1].address as TransportAddress
                    }
                    maxLength={5}
                />{" "}
                {t("trip.addSelectedActivitiesNumber", {smart_count: trip.activities.length})}
            </Box>
            {(viewMode === "vehicle" || viewMode === "trailer") && (
                <Flex flex="4">
                    {isLoading ? (
                        <LoadingWheel noMargin={true} small={true} />
                    ) : trip.trucker ? (
                        <NoWrap>
                            <Icon name="trucker" mr={2} />
                            {trip.trucker?.display_name ?? (
                                <Text as="i">{t("common.unspecified")}</Text>
                            )}
                        </NoWrap>
                    ) : (
                        <Box flex={1} my={1}>
                            <TruckerSelect
                                data-testid="assign-means-modal-trucker-select"
                                label={t("common.trucker")}
                                value={null}
                                onChange={onChangeTruckerTrucker}
                                isDisabled={isLoading}
                            />
                        </Box>
                    )}
                </Flex>
            )}
            <Flex flex="2">
                {trip.trucker && (
                    <SendInstructionButton
                        uids={[trip.uid]}
                        label={t("common.send")}
                        variant="plain"
                        successToasterDatas={[getToasterData(trip)]}
                        extendedView={extendedView}
                    />
                )}
            </Flex>
        </Flex>
    );
}

export function SendInstructionModal({
    day,
    onClose,
    viewMode,
}: {
    day: Date;
    onClose: () => void;
    viewMode: TripSchedulerView;
}) {
    const {extendedView} = useExtendedView();
    const dayStringForId = formatISO(day, {representation: "date"});
    const datetimeRange = dateService.getDatetimeRangeString(day, day);
    const [reload, setReload] = useState<number>(0);
    const {effectiveResourcesQuery} = useContext(ResourcesQueryContext);
    const fetchToSendToTruckersUrl =
        `/scheduler/trips/to-send-to-truckers/?scheduled_datetime_start=${datetimeRange}&extended_view=${extendedView}&view_mode=${viewMode}` +
        (effectiveResourcesQuery.vehicle__in?.length
            ? `&vehicle_id__in=${effectiveResourcesQuery.vehicle__in}`
            : "") +
        (effectiveResourcesQuery.trailer__in?.length
            ? `&trailer_id__in=${effectiveResourcesQuery.trailer__in}`
            : "") +
        (effectiveResourcesQuery.trucker__in?.length
            ? `&trucker_id__in=${effectiveResourcesQuery.trucker__in}`
            : "") +
        (effectiveResourcesQuery.fleet_tags__in?.length
            ? `&tags__in=${effectiveResourcesQuery.fleet_tags__in}`
            : "");

    const {
        isLoading,
        hasError,
        data: tripsByTruckerOrVehicle,
    } = useSimpleFetch<TripsByTruckerOrVehicle | Record<string, never>>(fetchToSendToTruckersUrl, [
        reload,
    ]);

    const allTrips = tripsByTruckerOrVehicle
        ? flatten(Object.values(tripsByTruckerOrVehicle))
        : [];

    const allTripsUidsToSend = allTrips.filter((trip) => trip.trucker).map((trip) => trip.uid);

    if (hasError) {
        return <Box>{t("common.error")}</Box>;
    }

    return (
        <Modal
            title={t("scheduler.instructions.modalTitle", {
                smart_count: isLoading ? "" : allTrips?.length,
                day: formatDate(day, "P-"),
            })}
            id={`send-instruction-${dayStringForId}`}
            onClose={onClose}
            size="large"
            mainButton={{
                variant: "none",
                children: (
                    <SendInstructionButton
                        label={t("scheduler.instructions.sendToAll")}
                        uids={allTripsUidsToSend}
                        variant="primary"
                        successToasterDatas={flatten(Object.values(tripsByTruckerOrVehicle)).map(
                            getToasterData
                        )}
                        extendedView={extendedView}
                    />
                ),
            }}
            secondaryButton={null}
        >
            {isLoading ? (
                <LoadingWheel />
            ) : (
                Object.keys(tripsByTruckerOrVehicle).map((truckerId) => {
                    const trips = tripsByTruckerOrVehicle[truckerId];
                    return (
                        <Box
                            fontSize={3}
                            key={`instruction-modal-group-${truckerId}`}
                            data-testid={`instruction-modal-group-${truckerId}`}
                        >
                            {viewMode === "trucker" && trips[0].trucker?.display_name}
                            {viewMode === "vehicle" && (
                                <VehicleLabel
                                    vehicle={{
                                        license_plate: trips[0].vehicle?.license_plate,
                                        fleet_number: trips[0].vehicle?.fleet_number,
                                    }}
                                />
                            )}
                            {viewMode === "trailer" && (
                                <VehicleLabel
                                    vehicle={{
                                        license_plate: trips[0].trailer?.license_plate,
                                        fleet_number: trips[0].trailer?.fleet_number,
                                    }}
                                />
                            )}
                            <Box mt={1} fontSize={2} pl={4}>
                                {trips.map((trip) => (
                                    <SendInstructionLine
                                        key={`instruction-modal-${dayStringForId}-${trip.uid}`}
                                        trip={trip}
                                        viewMode={viewMode}
                                        extendedView={extendedView}
                                        onAssign={() => setReload((prev) => prev + 1)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    );
                })
            )}
        </Modal>
    );
}
