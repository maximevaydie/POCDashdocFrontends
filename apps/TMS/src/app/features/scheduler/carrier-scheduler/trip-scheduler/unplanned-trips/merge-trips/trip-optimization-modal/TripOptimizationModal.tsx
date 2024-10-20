import {getConnectedCompany, useToday, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {Company, zoneDateToISO} from "dashdoc-utils";
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {CompactTrip} from "app/features/trip/trip.types";
import {MergeTripParameters} from "app/redux/actions/scheduler-trip";
import {useSelector} from "app/redux/hooks";

import {routeFormSchema, getRouteDefaultValues, RouteFormSection} from "./RouteFormSection";
import {TimeFormSection, getTimeDefaultValues, timeFormSchema} from "./TimeFormSection";
import {
    vehicleFormSchema,
    getVehicleDefaultValues,
    VehicleFormSection,
} from "./VehicleFormSection";

type TripOptimizationModalProps = {
    validTrips: CompactTrip[];
    onSubmit: (submitPayload: {validTrips: CompactTrip[]} & MergeTripParameters) => void;
    onClose: () => void;
};

export function TripOptimizationModal({
    validTrips,
    onSubmit,
    onClose,
}: TripOptimizationModalProps) {
    const company = useSelector(getConnectedCompany);
    const today = useToday();
    const timezone = useTimezone();

    const form = useForm<FormType>({
        defaultValues: getDefaultValues(company, validTrips, today),
        resolver: zodResolver(schema),
    });

    return (
        <Modal
            title={t("optimization.optimizeTripCreation")}
            onClose={onClose}
            mainButton={{
                children: t("common.validate"),
                loading: form.formState.isSubmitting,
                onClick: form.handleSubmit(handleSubmit),
                "data-testid": "validate-trip-optimization",
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            calloutProps={{
                icon: "robot",
                children: t("optimization.tripOptimizationParametersHelp"),
                mx: 5,
                px: 4,
            }}
        >
            <FormProvider {...form}>
                <VehicleFormSection />
                <RouteFormSection validTrips={validTrips} />
                <TimeFormSection />
            </FormProvider>
        </Modal>
    );

    function handleSubmit(values: FormType) {
        onClose();

        onSubmit({
            validTrips,
            optimize_distance: true,
            fill_scheduled_dates: values.fillScheduledDates,
            vehicle_capacity_in_lm: values.vehicleCapacity,
            start_datetime: zoneDateToISO(values.startDatetime, timezone),
            activity_duration: values.activityDuration,
            ...(values.modeType === "loop"
                ? {
                      start_coordinates: values.startAndEndAddress,
                      end_coordinates: values.startAndEndAddress,
                  }
                : {
                      start_coordinates: values.withStartAddress ? values.startAddress : undefined,
                      end_coordinates: values.withEndAddress ? values.endAddress : undefined,
                  }),
        });
    }
}

const schema = vehicleFormSchema.and(routeFormSchema).and(timeFormSchema);
type FormType = z.infer<typeof schema>;
function getDefaultValues(
    company: Company | null,
    validTrips: CompactTrip[],
    today: Date
): FormType {
    return {
        ...getVehicleDefaultValues(company),
        ...getRouteDefaultValues(validTrips),
        ...getTimeDefaultValues(today),
    };
}
