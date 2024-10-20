import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Icon, Text} from "@dashdoc/web-ui";
import {SiteSlot, Trailer, useToggle, Vehicle} from "dashdoc-utils";
import React from "react";
import {useSelector} from "react-redux";

import {TripMeans} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {fetchAssignTrip} from "app/redux/actions/trips";
import {useDispatch} from "app/redux/hooks";

import {PlanModal} from "./PlanModal";

import type {Transport} from "app/types/transport";

type Props = {
    means: TripMeans;
    disabled: boolean;
    transport?: Transport;
    tripUid: string;
    datetimeRange?: SiteSlot;
    sentToTrucker: boolean;
    isPlanningPreparedTrip?: boolean;
    /**
     * force the modal to be open and hide the button.
     * Useful when you want to force the user to edit the plan after an onclick event on another UX.
     */
    forceEdit?: boolean;
    onPlanned?: () => void;
    onClose: () => void;
    hideEditionField?: "trucker" | "vehicle" | "trailer";
};

export function PlanAction({
    means,
    disabled,
    transport,
    tripUid,
    sentToTrucker,
    forceEdit = false,
    isPlanningPreparedTrip = false,
    onPlanned,
    onClose,
    hideEditionField,
}: Props) {
    const dispatch = useDispatch();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);
    const {extendedView} = useExtendedView();
    const [isModalOpen, openModal, closeModal] = useToggle(forceEdit);
    const [isPlanning, setIsPlanning, setIsPlanned] = useToggle();
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const timezone = useTimezone();
    const isEditing = !!(means.trucker?.pk || means.trailer?.pk || means.vehicle?.pk);

    return (
        <>
            {!forceEdit && (
                <ClickableFlex
                    p={3}
                    onClick={disabled || isPlanning ? () => {} : openModal}
                    data-testid="plan-button"
                    disabled={disabled || isPlanning}
                >
                    <Icon name="truck" mr={3} />
                    <Box>
                        <Text color={disabled ? "grey.default" : "inherit"}>
                            {(transport && transport.status === "done") || isEditing
                                ? t("components.editMeans")
                                : t("components.plan")}
                        </Text>
                    </Box>
                </ClickableFlex>
            )}
            {isModalOpen && (
                <PlanModal
                    onClose={() => {
                        closeModal();
                        onClose();
                    }}
                    transport={transport}
                    means={means}
                    tripUid={tripUid}
                    isPlanningPreparedTrip={isPlanningPreparedTrip}
                    sentToTrucker={sentToTrucker}
                    isLoading={isPlanning}
                    onSubmit={handleSubmit}
                    hideField={hideEditionField}
                />
            )}
        </>
    );

    function sendPlannedFromMeansAnalyticsEvent(
        fromSimulation: boolean,
        scheduledStart: Date | null
    ) {
        analyticsService.sendEvent(AnalyticsEvent.plannedFromMeans, {
            "is staff": manager?.user.is_staff,
            "company id": company?.pk,
            "trip uid": tripUid,
            ...(transport
                ? {
                      "transport uid": transport?.uid,
                      "is modifying final info": transport.status == "done",
                  }
                : {}),
            "from simulation": fromSimulation,
            "use simulation date": scheduledStart !== null,
        });
    }

    async function handleSubmit(
        selectedTruckerPk: number | null,
        selectedVehicle: Partial<Vehicle> | null,
        selectedTrailer: Partial<Trailer> | null,
        sendToTrucker: boolean,
        deleteScheduledDates: boolean,
        scheduledStart: Date | null,
        scheduledOrder: number | null,
        fromSimulation: boolean
    ) {
        setIsPlanning();
        try {
            await dispatch(
                fetchAssignTrip(
                    tripUid,
                    selectedTruckerPk,
                    selectedVehicle?.license_plate ?? null,
                    selectedTrailer?.license_plate ?? null,
                    sendToTrucker,
                    extendedView,
                    scheduledStart,
                    scheduledOrder,
                    hasSchedulerByTimeEnabled,
                    timezone,
                    deleteScheduledDates
                )
            );
            onPlanned?.();
            onClose();
            sendPlannedFromMeansAnalyticsEvent(fromSimulation, scheduledStart);
        } finally {
            setIsPlanned();
        }
    }
}
