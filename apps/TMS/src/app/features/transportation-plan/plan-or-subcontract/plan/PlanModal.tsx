import {HasFeatureFlag, apiService, useTimezone} from "@dashdoc/web-common";
import {SelectOption, t} from "@dashdoc/web-core";
import {Box, Callout, Checkbox, Flex, Modal, ModalProps, Text} from "@dashdoc/web-ui";
import {
    SegmentTrucker,
    Trailer,
    Trucker,
    Vehicle,
    NO_TRAILER,
    NO_TRUCKER,
    NO_VEHICLE,
    useToggle,
    zoneDateToISO,
} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import {TruckerCreatableSelect} from "app/features/fleet/trucker/TruckerSelect";
import {
    NO_TRAILER_PK,
    TrailerPlateSelect,
    VehiclePlateSelect,
    getNoTrailerOption,
} from "app/features/fleet/vehicle/plate-select";
import {
    PlanningSimulationBanner,
    ScheduledDateParams,
} from "app/features/optimization/PlanningSimulationBanner";
import {SchedulerPlanPreview} from "app/features/scheduler/carrier-scheduler/trip-scheduler/scheduler-plan-preview/SchedulerPlanPreview";
import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {useDeleteScheduledDates} from "app/features/transport/hooks/useDeleteScheduledDates";
import {useSendToTrucker} from "app/features/transport/hooks/useSendToTrucker";
import {useAutoFillMeans} from "app/features/transport/transport-form/hooks/useAutoFillMeans";
import {AutoFilledMeansFields} from "app/features/transport/transport-form/transport-form.types";
import {TripMeans} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {isTransportRental} from "app/services/transport/transport.service";

import type {Transport} from "app/types/transport";

type Props = {
    isLoading: boolean;
    onSubmit: (
        selectedTruckerPk: number | null,
        selectedVehicle: Partial<Vehicle> | null,
        selectedTrailer: Partial<Trailer> | null,
        sendToTrucker: boolean,
        deleteScheduledDates?: boolean,
        scheduledStart?: Date | null,
        scheduledOrder?: number | null,
        fromSimulation?: boolean
    ) => void;
    onClose: ModalProps["onClose"];
    hideField?: "trucker" | "vehicle" | "trailer";
} & (
    | {
          transport: Transport;
          means: TripMeans;
          tripUid: string;
          isPlanningPreparedTrip: boolean;
          sentToTrucker: boolean;
      }
    | {}
);

export function PlanModal(props: Props) {
    const {isLoading, onSubmit, onClose} = props;

    let bulk = true;
    let trucker: Trucker | null = null;
    let vehicle: Vehicle | null = null;
    let trailer: Trailer | null = null;
    let sentToTrucker = false;
    let tripUid: string | undefined = undefined;
    let isModifyingFinalInfo = false;
    let isPlanningPreparedTrip = false;
    if ("transport" in props) {
        bulk = false;
        trucker = props.means.trucker ?? null;
        vehicle = props.means.vehicle ?? null;
        trailer = props.means.trailer ?? null;
        sentToTrucker = props.sentToTrucker;
        tripUid = props.tripUid;
        isModifyingFinalInfo = props.transport && props.transport.status == "done";
        isPlanningPreparedTrip = props.isPlanningPreparedTrip;
    }
    const hideField = props.hideField;

    const {extendedView} = useExtendedView();

    const [automaticMeansEnabled, , disableAutomaticMeans] = useToggle(
        !trucker && !vehicle && !trailer
    );
    const [selectedTrucker, setSelectedTrucker] = useState<
        SegmentTrucker | null | {pk: number; display_name: string}
    >(trucker);
    const [selectedVehicle, setSelectedVehicle] = useState<Partial<Vehicle> | null>(vehicle);
    const [selectedTrailer, setSelectedTrailer] = useState<Partial<Trailer> | null>(trailer);
    const [autoFilledMeans, setAutoFilledMeans] = useState<AutoFilledMeansFields | null>();

    const truckerHasBeenUpdated = trucker?.pk !== selectedTrucker?.pk;
    const vehicleHasBeenUpdated =
        vehicle?.license_plate !== selectedVehicle?.license_plate ||
        vehicle?.pk !== selectedVehicle?.pk;
    const trailerHasBeenUpdated =
        trailer?.license_plate !== selectedTrailer?.license_plate ||
        trailer?.pk !== selectedTrailer?.pk;
    const anythingHasBeenUpdate =
        truckerHasBeenUpdated || vehicleHasBeenUpdated || trailerHasBeenUpdated;

    const plannedButNotSendToTrucker = trucker && sentToTrucker === false;
    const saveOnSubmit = trucker && !truckerHasBeenUpdated;
    const sendToTruckerOnSubmit =
        selectedTrucker && plannedButNotSendToTrucker && !anythingHasBeenUpdate;

    const {sendToTrucker: sendToTruckerState, persistSendToTrucker: setSendToTruker} =
        useSendToTrucker();
    const sendToTrucker = sendToTruckerState && hideField !== "trucker";
    const [deleteScheduledDates, setDeleteScheduledDates] = useDeleteScheduledDates(true);
    const [scheduledDateParams, setScheduledDateParams] = useState<ScheduledDateParams>({
        scheduledStart: null,
        scheduledEnd: null,
        scheduledOrder: null,
        useScheduledStart: false,
    });
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const timezone = useTimezone();

    const dateRange = useMemo(() => {
        const {useScheduledStart, scheduledStart, scheduledEnd} = scheduledDateParams;
        if (!useScheduledStart || !scheduledStart || !hasSchedulerByTimeEnabled) {
            return undefined;
        }
        return {
            start: zoneDateToISO(scheduledStart, timezone) as string,
            end: zoneDateToISO(scheduledEnd ?? scheduledStart, timezone) as string,
        };
    }, [hasSchedulerByTimeEnabled, scheduledDateParams, timezone]);
    const planMainButton = {
        disabled: !anythingHasBeenUpdate && !(selectedTrucker && plannedButNotSendToTrucker),
        children: t(
            sendToTruckerOnSubmit
                ? "components.sendToTrucker"
                : saveOnSubmit
                  ? "common.save"
                  : selectedTrucker && sendToTrucker
                    ? "components.planAndSendToTrucker"
                    : "components.plan"
        ),
    };
    const ownFleetMainButton = {
        ...planMainButton,
        onClick: onOwnFleetSave,
    };

    const didRemoveMeans = !selectedVehicle && !selectedTrucker && (!!trucker || !!vehicle);
    const canDeleteScheduledDates = isPlanningPreparedTrip
        ? didRemoveMeans && hasSchedulerByTimeEnabled
        : didRemoveMeans;

    const {autoFillMeans, getAutoFilledFieldIcon} = useAutoFillMeans({
        onAutoFillTrailer: setSelectedTrailer,
        onAutoFillVehicle: setSelectedVehicle,
        onAutoFillTrucker: setSelectedTrucker,
    });

    return (
        <>
            <Modal
                title={t("components.pickDriverAndPlates")}
                onClose={onClose}
                mainButton={{
                    ...ownFleetMainButton,
                    loading: isLoading,
                    ["data-testid"]: "own-fleet-modal-save-button",
                }}
                id="own-fleet-modal"
                size="large"
                data-testid="own-fleet-modal"
                animation={
                    false /* avoid modal animation  (otherwise there is a fade in fade out between charter and ownFleet */
                }
            >
                <Box>
                    {isModifyingFinalInfo && (
                        <AmendTransportWarningBanner
                            isRental={
                                "transport" in props ? isTransportRental(props.transport) : false
                            }
                        />
                    )}
                    <HasFeatureFlag flagName="tripCreation">
                        {bulk && (
                            <Callout variant="warning" mb={3}>
                                {t("assign.bulk.preparedTripLimitation")}
                            </Callout>
                        )}
                    </HasFeatureFlag>
                    <Box width="50%">
                        {hideField !== "trucker" && (
                            <>
                                <Text mb={3} variant="h1" color="grey.dark">
                                    {t("common.trucker")}
                                </Text>
                                <Box>
                                    <TruckerCreatableSelect
                                        data-testid="own-fleet-modal-trucker-select"
                                        key={`trucker-${selectedTrucker?.pk}`} // hacky way to reload the truckers list on new trucker
                                        label={t("common.trucker")}
                                        value={
                                            selectedTrucker
                                                ? {value: selectedTrucker as Trucker}
                                                : null
                                        }
                                        onChange={onSelectTrucker}
                                        isDisabled={isLoading}
                                        iconName={
                                            autoFilledMeans?.trucker
                                                ? getAutoFilledFieldIcon(autoFilledMeans.source)
                                                : null
                                        }
                                        tooltipContent={autoFilledMeans?.trucker}
                                        tripUid={tripUid}
                                        dateRange={dateRange}
                                    />
                                </Box>
                                {truckerHasBeenUpdated && selectedTrucker && (
                                    <Box pt={3}>
                                        <Checkbox
                                            data-testid="own-fleet-modal-send-to-trucker-checkbox"
                                            checked={sendToTrucker}
                                            onChange={setSendToTruker}
                                            label={t("components.sendToTrucker")}
                                            disabled={isLoading}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                        {!hideField && !bulk && !isModifyingFinalInfo && tripUid !== undefined && (
                            <PlanningSimulationBanner
                                tripUid={tripUid}
                                onSelectTrucker={onSelectTrucker}
                                scheduledDateParams={scheduledDateParams}
                                setScheduledDateParams={setScheduledDateParams}
                                from="transport means"
                            />
                        )}
                    </Box>
                    <Box pt={hideField == "trucker" ? 0 : 5} pb={3} width="100%">
                        <Text variant="h1" color="grey.dark">
                            {t("common.licensePlates")}
                        </Text>
                        <Flex pt={3} width="100%" style={{gap: "12px"}}>
                            {hideField !== "vehicle" && (
                                <Box flex={1}>
                                    <VehiclePlateSelect
                                        data-testid="own-fleet-modal-vehicle-select"
                                        label={t("common.vehiclePlate")}
                                        value={selectedVehicle ? {value: selectedVehicle} : null}
                                        onChange={onSelectVehicle}
                                        isDisabled={isLoading}
                                        iconName={
                                            autoFilledMeans?.vehicle
                                                ? getAutoFilledFieldIcon(autoFilledMeans.source)
                                                : null
                                        }
                                        tooltipContent={autoFilledMeans?.vehicle}
                                        tripUid={tripUid}
                                        dateRange={dateRange}
                                    />
                                </Box>
                            )}
                            {hideField !== "trailer" && (
                                <Box flex={1}>
                                    <TrailerPlateSelect
                                        data-testid="own-fleet-modal-trailer-select"
                                        label={t("common.trailerPlate")}
                                        value={
                                            selectedTrailer
                                                ? {value: selectedTrailer}
                                                : {value: getNoTrailerOption()}
                                        }
                                        onChange={onSelectTrailer}
                                        isDisabled={isLoading}
                                        iconName={
                                            autoFilledMeans?.trailer
                                                ? getAutoFilledFieldIcon(autoFilledMeans.source)
                                                : null
                                        }
                                        tooltipContent={autoFilledMeans?.trailer}
                                        tripUid={tripUid}
                                        dateRange={dateRange}
                                    />
                                </Box>
                            )}
                        </Flex>

                        {canDeleteScheduledDates && (
                            <Box mt={3}>
                                <Checkbox
                                    checked={deleteScheduledDates}
                                    onChange={setDeleteScheduledDates}
                                    label={t("components.deletedScheduledDates")}
                                    data-testid="deleted-scheduled-dates"
                                />
                            </Box>
                        )}
                    </Box>

                    {hasSchedulerByTimeEnabled && !bulk && !hideField && tripUid && (
                        <Box
                            position="relative"
                            zIndex="level0"
                            data-testid="scheduler-resource-preview"
                        >
                            <Text variant="h1" color="grey.dark" mt={3}>
                                {t("plan.planningOverview")}
                            </Text>
                            <SchedulerPlanPreview
                                tripUid={tripUid}
                                trucker={selectedTrucker}
                                vehicle={selectedVehicle}
                                trailer={selectedTrailer}
                                startDate={scheduledDateParams.scheduledStart}
                                setDateRange={(startDate, endDate) =>
                                    setScheduledDateParams({
                                        useScheduledStart: true,
                                        scheduledStart: startDate,
                                        scheduledEnd: endDate,
                                        scheduledOrder: null,
                                    })
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );

    function onOwnFleetSave() {
        /* The initial value may be a copy of a vehicle or a trailer
         * So we have to remove the pk otherwise an error will be raised.
         * We also remove the remote_id field to pass the pk/remote_id mutual exclusion assertion. */
        const {
            pk: vehiclePk,
            remote_id: vehicleRemoteId,
            ...selectedVehicleWithoutPkAndRemoteId
        } = selectedVehicle || {};
        let {
            pk: trailerPk,
            remote_id: trailerRemoteId,
            ...selectedTrailerWithoutPkAndRemoteId
        } = selectedTrailer || {};

        let shouldSendToTrucker = sendToTrucker;
        if (!selectedTrucker) {
            shouldSendToTrucker = false;
        } else if (sendToTruckerOnSubmit) {
            shouldSendToTrucker = true;
        } else if (saveOnSubmit) {
            shouldSendToTrucker = false;
        }

        const selectedTruckerPk = selectedTrucker?.pk ?? null;
        const selectedVehicleToSubmit = selectedVehicle
            ? selectedVehicleWithoutPkAndRemoteId
            : null;
        const selectedTrailerToSubmit = selectedTrailer
            ? selectedTrailerWithoutPkAndRemoteId
            : null;
        const sendToTruckerToSubmit = shouldSendToTrucker;
        onSubmit(
            selectedTruckerPk,
            selectedVehicleToSubmit,
            selectedTrailerToSubmit,
            sendToTruckerToSubmit,
            canDeleteScheduledDates && deleteScheduledDates,
            scheduledDateParams.useScheduledStart && !hideField
                ? scheduledDateParams.scheduledStart
                : null,
            scheduledDateParams.useScheduledStart && !hideField
                ? scheduledDateParams.scheduledOrder
                : null,
            !!selectedTrucker && !("user" in selectedTrucker)
        );
    }

    async function onSelectTrucker(
        option: SelectOption<Pick<Trucker, "pk" | "display_name" | "means_combination">> | null
    ) {
        const trucker = option?.value ?? null;
        setSelectedTrucker(trucker);
        setScheduledDateParams({
            scheduledStart: null,
            scheduledEnd: null,
            scheduledOrder: null,
            useScheduledStart: false,
        });

        if (automaticMeansEnabled && trucker != null) {
            // Auto fill means from means combination
            if (trucker?.means_combination) {
                const autoFilledMeans = autoFillMeans("trucker", trucker);
                setAutoFilledMeans(autoFilledMeans);
                disableAutomaticMeans();
                return;
            }

            // Auto fill means from last associated means (smart suggestion)
            let lastAssociatedMeans;
            try {
                lastAssociatedMeans = await apiService.Truckers.getLastAssociatedMeans(
                    trucker.pk,
                    {query: {extended_view: extendedView}},
                    {apiVersion: "web"}
                );
            } catch {
                // do nothing
            }

            if (lastAssociatedMeans !== undefined) {
                setSelectedVehicle(
                    lastAssociatedMeans["vehicle"] === NO_VEHICLE ||
                        !lastAssociatedMeans["vehicle"]?.license_plate
                        ? null
                        : lastAssociatedMeans["vehicle"]
                );
                setSelectedTrailer(
                    lastAssociatedMeans["trailer"] === NO_TRAILER ||
                        !lastAssociatedMeans["trailer"]?.license_plate
                        ? null
                        : lastAssociatedMeans["trailer"]
                );
                const truckerName = trucker.display_name;
                setAutoFilledMeans({
                    vehicle:
                        lastAssociatedMeans["vehicle"] === NO_VEHICLE
                            ? t(
                                  "smartSuggests.automaticFieldTooltipContent.vehicle.noValue.predictedByTrucker",
                                  {truckerName}
                              )
                            : !lastAssociatedMeans["vehicle"]?.license_plate
                              ? undefined
                              : t(
                                    "smartSuggests.automaticFieldTooltipContent.vehicle.value.predictedByTrucker",
                                    {
                                        licensePlate: lastAssociatedMeans["vehicle"].license_plate,
                                        truckerName,
                                    }
                                ),
                    trailer:
                        lastAssociatedMeans["trailer"] === NO_TRAILER
                            ? t(
                                  "smartSuggests.automaticFieldTooltipContent.trailer.noValue.predictedByTrucker",
                                  {truckerName}
                              )
                            : !lastAssociatedMeans["trailer"]?.license_plate
                              ? undefined
                              : t(
                                    "smartSuggests.automaticFieldTooltipContent.trailer.value.predictedByTrucker",
                                    {
                                        licensePlate: lastAssociatedMeans["trailer"].license_plate,
                                        truckerName,
                                    }
                                ),
                    source: "smartSuggestion",
                });
            }
        } else if (autoFilledMeans && "trucker" in autoFilledMeans) {
            delete autoFilledMeans.trucker;
            setAutoFilledMeans(autoFilledMeans);
        }
        disableAutomaticMeans();
    }

    async function onSelectVehicle(option: SelectOption<Vehicle> | null) {
        const isNew = option?.__isNew__;
        const vehicle = (isNew ? {license_plate: option.value} : option?.value) as Vehicle | null;
        setSelectedVehicle(vehicle);

        if (automaticMeansEnabled && vehicle && !isNew) {
            // Auto fill means from means combination
            if (vehicle?.means_combination) {
                const autoFilledMeans = autoFillMeans("vehicle", vehicle);
                setAutoFilledMeans(autoFilledMeans);
                disableAutomaticMeans();
                return;
            }

            // Auto fill means from last associated means (smart suggestion)
            let lastAssociatedMeans;
            try {
                lastAssociatedMeans = await apiService.Vehicles.getLastAssociatedMeans(
                    vehicle.pk,
                    {
                        query: {extended_view: extendedView},
                    }
                );
            } catch {
                //do nothing
            }
            if (lastAssociatedMeans !== undefined) {
                setSelectedTrucker(
                    lastAssociatedMeans["trucker"] !== NO_TRUCKER
                        ? lastAssociatedMeans["trucker"]
                        : null
                );
                setSelectedTrailer(
                    lastAssociatedMeans["trailer"] === NO_TRAILER ||
                        !lastAssociatedMeans["trailer"]?.license_plate
                        ? null
                        : lastAssociatedMeans["trailer"]
                );
                const vehicleLicensePlate = vehicle.license_plate;
                setAutoFilledMeans({
                    trucker:
                        lastAssociatedMeans["trucker"] === NO_TRUCKER
                            ? t(
                                  "smartSuggests.automaticFieldTooltipContent.trucker.noValue.predictedByVehicle",
                                  {vehicleLicensePlate}
                              )
                            : lastAssociatedMeans["trucker"] === null
                              ? undefined
                              : t(
                                    "smartSuggests.automaticFieldTooltipContent.trucker.value.predictedByVehicle",
                                    {
                                        truckerName: lastAssociatedMeans["trucker"].display_name,
                                        vehicleLicensePlate,
                                    }
                                ),
                    trailer:
                        lastAssociatedMeans["trailer"] === NO_TRAILER
                            ? t(
                                  "smartSuggests.automaticFieldTooltipContent.trailer.noValue.predictedByVehicle",
                                  {vehicleLicensePlate}
                              )
                            : !lastAssociatedMeans["trailer"]?.license_plate
                              ? undefined
                              : t(
                                    "smartSuggests.automaticFieldTooltipContent.trailer.value.predictedByVehicle",
                                    {
                                        licensePlate: lastAssociatedMeans["trailer"].license_plate,
                                        vehicleLicensePlate,
                                    }
                                ),
                    source: "smartSuggestion",
                });
            }
        } else if (autoFilledMeans && "vehicle" in autoFilledMeans) {
            delete autoFilledMeans.vehicle;
            setAutoFilledMeans(autoFilledMeans);
        }
        disableAutomaticMeans();
    }

    async function onSelectTrailer(option: SelectOption<Trailer> | null) {
        const isNew = option?.__isNew__;
        const isNoTrailer = option?.value?.pk === NO_TRAILER_PK;
        const trailer = (
            isNew ? {license_plate: option.value} : isNoTrailer ? null : option?.value
        ) as Trailer | null;
        setSelectedTrailer(trailer);

        if (automaticMeansEnabled && trailer && !isNew) {
            // Auto fill means from means combination
            if (trailer?.means_combination) {
                const autoFilledMeans = autoFillMeans("trailer", trailer);
                setAutoFilledMeans(autoFilledMeans);
                disableAutomaticMeans();
                return;
            }

            // Auto fill means from last associated means (smart suggestion)
            let lastAssociatedMeans;
            try {
                lastAssociatedMeans = await apiService.Trailers.getLastAssociatedMeans(
                    trailer.pk,
                    {
                        query: {extended_view: extendedView},
                    }
                );
            } catch {
                //do nothing
            }
            if (lastAssociatedMeans !== undefined) {
                setSelectedTrucker(
                    lastAssociatedMeans["trucker"] !== NO_TRUCKER
                        ? lastAssociatedMeans["trucker"]
                        : null
                );
                setSelectedVehicle(
                    lastAssociatedMeans["vehicle"] === NO_VEHICLE ||
                        !lastAssociatedMeans["vehicle"]?.license_plate
                        ? null
                        : lastAssociatedMeans["vehicle"]
                );
                const trailerLicensePlate = trailer.license_plate;
                setAutoFilledMeans({
                    trucker:
                        lastAssociatedMeans["trucker"] === NO_TRUCKER
                            ? t(
                                  "smartSuggests.automaticFieldTooltipContent.trucker.noValue.predictedByTrailer",
                                  {trailerLicensePlate}
                              )
                            : lastAssociatedMeans["trucker"] === null
                              ? undefined
                              : t(
                                    "smartSuggests.automaticFieldTooltipContent.trucker.value.predictedByTrailer",
                                    {
                                        truckerName: lastAssociatedMeans["trucker"].display_name,
                                        trailerLicensePlate,
                                    }
                                ),
                    vehicle:
                        lastAssociatedMeans["vehicle"] === NO_VEHICLE
                            ? t(
                                  "smartSuggests.automaticFieldTooltipContent.vehicle.noValue.predictedByTrailer",
                                  {trailerLicensePlate}
                              )
                            : !lastAssociatedMeans["vehicle"]?.license_plate
                              ? undefined
                              : t(
                                    "smartSuggests.automaticFieldTooltipContent.vehicle.value.predictedByTrailer",
                                    {
                                        licensePlate: lastAssociatedMeans["vehicle"].license_plate,
                                        trailerLicensePlate,
                                    }
                                ),
                    source: "smartSuggestion",
                });
            }
        } else if (autoFilledMeans && "trailer" in autoFilledMeans) {
            delete autoFilledMeans.trailer;
            setAutoFilledMeans(autoFilledMeans);
        }
        disableAutomaticMeans();
    }
}
