import {
    AnalyticsEvent,
    analyticsService,
    apiService,
    getConnectedCompany,
    getConnectedManager,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    FloatingPanelWithValidationButtons,
    SelectOption,
    Text,
} from "@dashdoc/web-ui";
import {
    Trailer,
    Trucker,
    Vehicle,
    NO_TRAILER,
    NO_VEHICLE,
    useToggle,
    yup,
    zoneDateToISO,
} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {FunctionComponent, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {TruckerCreatableSelect} from "app/features/fleet/trucker/TruckerSelect";
import {
    TrailerPlateSelect,
    VehiclePlateSelect,
    getNoTrailerOption,
} from "app/features/fleet/vehicle/plate-select";
import {
    PlanningSimulationBanner,
    ScheduledDateParams,
} from "app/features/optimization/PlanningSimulationBanner";
import {SchedulerPlanPreview} from "app/features/scheduler/carrier-scheduler/trip-scheduler/scheduler-plan-preview/SchedulerPlanPreview";
import {schedulerPlanPreviewService} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/schedulerPlanPreview.service";
import {useSendToTrucker} from "app/features/transport/hooks/useSendToTrucker";
import {useAutoFillMeans} from "app/features/transport/transport-form/hooks/useAutoFillMeans";
import {AutoFilledMeansFields} from "app/features/transport/transport-form/transport-form.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {fetchAssignTrip} from "app/redux/actions/trips";

import {TripWithTransportData} from "../../trip.types";

interface TripMeansEditionPanelProps {
    trip: TripWithTransportData;
    closeEdition: () => void;
}

export const TripMeansEditionPanel: FunctionComponent<TripMeansEditionPanelProps> = ({
    trip,
    closeEdition,
}) => {
    const [automaticMeansEnabled, setAutomaticMeansEnabled] = useState<boolean>(true);
    const [autoFilledMeansFields, setAutoFilledMeansFields] =
        useState<AutoFilledMeansFields | null>(null);

    const {sendToTrucker, persistSendToTrucker: setSendToTruker} = useSendToTrucker();
    const dispatch = useDispatch();
    const [savingMeans, startSavingMeans, endSavingMeans] = useToggle(false);
    const {extendedView} = useExtendedView();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);

    const {autoFillMeans, getAutoFilledFieldIcon} = useAutoFillMeans({
        onAutoFillTrucker: (trucker: Trucker) => formik.setFieldValue("trucker", trucker),
        onAutoFillTrailer: (trailer: Trailer) => formik.setFieldValue("trailer", trailer),
        onAutoFillVehicle: (vehicle: Vehicle) => formik.setFieldValue("vehicle", vehicle),
    });

    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const timezone = useTimezone();
    const [scheduledDateParams, setScheduledDateParams] = useState<ScheduledDateParams>(() => {
        if (hasSchedulerByTimeEnabled && trip) {
            const {start, end} = schedulerPlanPreviewService.getDefaultPreviewRangeDate(
                trip,
                timezone
            );
            return {
                scheduledStart: start,
                scheduledEnd: end,
                scheduledOrder: null,
                useScheduledStart: true,
            };
        }
        return {
            scheduledStart: null,
            scheduledEnd: null,
            scheduledOrder: null,
            useScheduledStart: false,
        };
    });

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

    const handleTruckerChange = async (
        option: SelectOption<Pick<Trucker, "pk" | "display_name" | "means_combination">> | null
    ) => {
        const trucker = option?.value;
        formik.setFieldValue("trucker", trucker);
        setScheduledDateParams({
            scheduledStart: null,
            scheduledEnd: null,
            scheduledOrder: null,
            useScheduledStart: false,
        });

        if (!automaticMeansEnabled || !trucker) {
            setAutoFilledMeansFields((prevValue) => {
                if (!prevValue) {
                    return null;
                }
                return {...prevValue, trucker: undefined};
            });
            setAutomaticMeansEnabled(false);
            return;
        }

        setAutomaticMeansEnabled(false);

        // Auto fill other means from means combination
        if (trucker?.means_combination) {
            const autoFilledMeans = autoFillMeans("trucker", trucker);
            setAutoFilledMeansFields(autoFilledMeans);
            return;
        }

        // Auto fill other means last associated means (smart suggestion)
        let lastAssociatedMeans;
        try {
            lastAssociatedMeans = await apiService.Truckers.getLastAssociatedMeans(
                trucker.pk,
                {query: {extended_view: extendedView}},
                {apiVersion: "web"}
            );
        } catch {
            //do nothing
        }
        if (lastAssociatedMeans === undefined) {
            return;
        }

        const truckerName = trucker.display_name;
        const newAutoFilledMeansFields: AutoFilledMeansFields = {
            source: "smartSuggestion",
        };

        // Check if user did not fill it during the api call and if there is a result
        if (!formik.values.vehicle?.pk && lastAssociatedMeans.vehicle !== null) {
            if (lastAssociatedMeans.vehicle === NO_VEHICLE) {
                newAutoFilledMeansFields.vehicle = t(
                    "smartSuggests.automaticFieldTooltipContent.vehicle.noValue.predictedByTrucker",
                    {truckerName}
                );
            } else if (lastAssociatedMeans.vehicle.license_plate) {
                formik.setFieldValue("vehicle", lastAssociatedMeans.vehicle);
                newAutoFilledMeansFields.vehicle = t(
                    "smartSuggests.automaticFieldTooltipContent.vehicle.value.predictedByTrucker",
                    {
                        licensePlate: lastAssociatedMeans.vehicle.license_plate,
                        truckerName,
                    }
                );
            }
        }

        // Check if user did not fill it during the api call if there is a result
        if (!formik.values.trailer?.pk && lastAssociatedMeans.trailer !== null) {
            if (lastAssociatedMeans.trailer === NO_TRAILER) {
                newAutoFilledMeansFields.trailer = t(
                    "smartSuggests.automaticFieldTooltipContent.trailer.noValue.predictedByTrucker",
                    {truckerName}
                );
            } else if (lastAssociatedMeans.trailer.license_plate) {
                formik.setFieldValue("trailer", lastAssociatedMeans.trailer);
                newAutoFilledMeansFields.trailer = t(
                    "smartSuggests.automaticFieldTooltipContent.trailer.value.predictedByTrucker",
                    {
                        licensePlate: lastAssociatedMeans.trailer.license_plate,
                        truckerName,
                    }
                );
            }
        }
        setAutoFilledMeansFields(newAutoFilledMeansFields);
    };

    const handleVehicleChange = (option: SelectOption<Vehicle>) => {
        const vehicle = option?.value;
        formik.setFieldValue("vehicle", vehicle);

        // Auto fill other means from means combination
        if (automaticMeansEnabled && vehicle?.means_combination) {
            const autoFilledMeans = autoFillMeans("vehicle", vehicle);
            setAutoFilledMeansFields(autoFilledMeans);
            setAutomaticMeansEnabled(false);
            return;
        }
    };

    const handleTrailerChange = (option: SelectOption<Trailer> | null) => {
        const trailer = option?.value;

        formik.setFieldValue("trailer", trailer);
        setAutoFilledMeansFields(null);

        // Auto fill other means from means combination
        if (automaticMeansEnabled && trailer?.means_combination) {
            const autoFilledMeans = autoFillMeans("trailer", trailer);
            setAutoFilledMeansFields(autoFilledMeans);
            setAutomaticMeansEnabled(false);
            return;
        }
    };

    const sendPlannedFromMeansAnalyticsEvent = () => {
        analyticsService.sendEvent(AnalyticsEvent.plannedFromMeans, {
            "is staff": manager?.user.is_staff,
            "company id": company?.pk,
            "trip uid": trip.uid,
            "from simulation": !!formik.values.trucker && !("user" in formik.values.trucker),
            "use simulation date": scheduledDateParams.useScheduledStart,
        });
    };

    async function saveMeans() {
        startSavingMeans();
        try {
            await fetchAssignTrip(
                trip.uid,
                formik.values.trucker?.pk ?? null,
                formik.values.vehicle?.license_plate ?? null,
                formik.values.trailer?.license_plate ?? null,
                sendToTrucker,
                extendedView,
                scheduledDateParams.useScheduledStart ? scheduledDateParams.scheduledStart : null,
                scheduledDateParams.useScheduledStart ? scheduledDateParams.scheduledOrder : null,
                hasSchedulerByTimeEnabled,
                timezone
            )(dispatch);
        } catch {
            endSavingMeans();
            return;
        }
        endSavingMeans();
        closeEdition();
        sendPlannedFromMeansAnalyticsEvent();
    }

    const formik = useFormik({
        initialValues: {
            trucker: trip.trucker ?? null,
            vehicle: trip.vehicle ?? null,
            trailer: trip.trailer ?? null,
        },
        validationSchema: yup.object().nullable().shape({
            trucker: yup.object().nullable(),
            vehicle: yup.object().nullable(),
            trailer: yup.object().nullable(),
        }),

        onSubmit: saveMeans,
    });

    return (
        <FloatingPanelWithValidationButtons
            mainButton={{
                onClick: () => {
                    formik.submitForm();
                },
                loading: savingMeans,
                children: sendToTrucker
                    ? t("components.planAndSendToTrucker")
                    : t("components.plan"),
            }}
            onClose={() => closeEdition()}
            title={t("common.means")}
        >
            <Text variant="h1" mb={3} mt={5}>
                {t("common.trucker")}
            </Text>
            <TruckerCreatableSelect
                label={t("common.trucker")}
                value={formik.values.trucker ? {value: formik.values.trucker} : null}
                onChange={handleTruckerChange}
                iconName={
                    autoFilledMeansFields?.trucker
                        ? getAutoFilledFieldIcon(autoFilledMeansFields.source)
                        : null
                }
                data-testid="trucker-select"
                tripUid={trip.uid}
                dateRange={dateRange}
            />
            {formik.values.trucker &&
                (formik.values.trucker !== trip.trucker ||
                    trip.trucker_status == "trucker_assigned") && (
                    <Box m={3}>
                        <Checkbox
                            checked={sendToTrucker}
                            onChange={setSendToTruker}
                            label={t("components.sendToTrucker")}
                        />
                    </Box>
                )}
            <PlanningSimulationBanner
                trip={trip}
                onSelectTrucker={handleTruckerChange}
                scheduledDateParams={scheduledDateParams}
                setScheduledDateParams={setScheduledDateParams}
                from="trip means"
            />
            <Text variant="h1" mb={3} mt={5}>
                {t("components.licensePlate")}
            </Text>
            <VehiclePlateSelect
                label={t("common.vehiclePlate")}
                value={formik.values.vehicle ? {value: formik.values.vehicle} : null}
                onChange={handleVehicleChange}
                iconName={
                    autoFilledMeansFields?.vehicle
                        ? getAutoFilledFieldIcon(autoFilledMeansFields.source)
                        : null
                }
                data-testid="vehicle-select"
                tripUid={trip.uid}
                dateRange={dateRange}
            />
            <Box mb={3} />
            <TrailerPlateSelect
                label={t("common.trailerPlate")}
                value={
                    formik.values.trailer
                        ? {value: formik.values.trailer}
                        : {value: getNoTrailerOption()}
                }
                onChange={handleTrailerChange}
                iconName={
                    autoFilledMeansFields?.trailer
                        ? getAutoFilledFieldIcon(autoFilledMeansFields.source)
                        : null
                }
                data-testid="trailer-select"
                tripUid={trip.uid}
                dateRange={dateRange}
            />

            {hasSchedulerByTimeEnabled && (
                <Box position="relative" zIndex="level0" data-testid="scheduler-resource-preview">
                    <Text variant="h1" color="grey.dark" mt={3}>
                        {t("plan.planningOverview")}
                    </Text>
                    <SchedulerPlanPreview
                        tripUid={trip.uid}
                        trucker={formik.values.trucker}
                        vehicle={formik.values.vehicle}
                        trailer={formik.values.trailer}
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
        </FloatingPanelWithValidationButtons>
    );
};
