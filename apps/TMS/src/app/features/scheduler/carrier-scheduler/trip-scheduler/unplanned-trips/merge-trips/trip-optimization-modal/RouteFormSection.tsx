import {t} from "@dashdoc/web-core";
import {Text, Box, ModeTypeSelector, ModeDescription, SwitchInput} from "@dashdoc/web-ui";
import {TransportAddress} from "dashdoc-utils";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import {z} from "zod";

import {CompactTrip} from "app/features/trip/trip.types";

import {TripOptimizationAddressSelect} from "./TripOptimizationAddressSelect";

export const routeFormSchema = z.object({
    modeType: z.enum(["loop", "singleJourney"]),
    startAndEndAddress: z.object({latitude: z.number(), longitude: z.number()}).optional(),
    withStartAddress: z.boolean(),
    withEndAddress: z.boolean(),
    startAddress: z.object({latitude: z.number(), longitude: z.number()}).optional(),
    endAddress: z.object({latitude: z.number(), longitude: z.number()}).optional(),
});

type RouteFormType = z.infer<typeof routeFormSchema>;

export function getRouteDefaultValues(validTrips: CompactTrip[]): RouteFormType {
    const firstAddress = getAddressOptions(validTrips)[0];
    return {
        modeType: "loop",
        startAndEndAddress: firstAddress,
        withStartAddress: true,
        withEndAddress: true,
        startAddress: firstAddress,
        endAddress: firstAddress,
    };
}

type ModeType = "loop" | "singleJourney";

export function RouteFormSection({validTrips}: {validTrips: CompactTrip[]}) {
    const form = useFormContext();
    const modeType = form.watch("modeType");
    const withStartAddress = form.watch("withStartAddress");
    const withEndAddress = form.watch("withEndAddress");

    const addressOptions = getAddressOptions(validTrips);

    if (addressOptions.length === 0) {
        return null;
    }

    const modeList: ModeDescription<ModeType>[] = [
        {
            value: "loop",
            label: t("optimization.roundTrip"),
            icon: "loop",
        },
        {
            value: "singleJourney",
            label: t("optimization.oneWay"),
            icon: "singleJourney",
        },
    ];

    return (
        <Box mt={3}>
            <Text variant="h1" mb={4}>
                {t("optimization.routeConstraints")}
            </Text>
            <Text variant="h2" mb={2}>
                {t("optimization.routeType")}
            </Text>
            <Box mb={4}>
                <Controller
                    name="modeType"
                    render={({field: {value, onChange}}) => (
                        <ModeTypeSelector<ModeType>
                            modeList={modeList}
                            currentMode={value}
                            setCurrentMode={onChange}
                            height="80px"
                        />
                    )}
                />
            </Box>
            {modeType === "loop" && (
                <Controller
                    name="startAndEndAddress"
                    render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                        <TripOptimizationAddressSelect
                            {...field}
                            options={addressOptions}
                            label={t("optimization.departureAndArrivalAddress")}
                            error={error?.message}
                            data-testid="start-and-end-address"
                        />
                    )}
                />
            )}
            {modeType === "singleJourney" && (
                <>
                    <Box mb={3}>
                        <Controller
                            name="withStartAddress"
                            render={({field: {value, onChange}}) => (
                                <SwitchInput
                                    labelRight={t("optimization.defineDeparturePoint")}
                                    value={value}
                                    onChange={onChange}
                                    data-testid="switch-with-start-address"
                                />
                            )}
                        />
                    </Box>

                    {withStartAddress && (
                        <Box mb={4}>
                            <Controller
                                name="startAddress"
                                render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                                    <TripOptimizationAddressSelect
                                        {...field}
                                        options={addressOptions}
                                        label={t("optimization.departureAddress")}
                                        error={error?.message}
                                        data-testid="start-address"
                                    />
                                )}
                            />
                        </Box>
                    )}
                    <Box mb={3}>
                        <Controller
                            name="withEndAddress"
                            render={({field: {value, onChange}}) => (
                                <SwitchInput
                                    labelRight={t("optimization.defineArrivalPoint")}
                                    value={value}
                                    onChange={onChange}
                                    data-testid="switch-with-end-address"
                                />
                            )}
                        />
                    </Box>
                    {withEndAddress && (
                        <Controller
                            name="endAddress"
                            render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                                <TripOptimizationAddressSelect
                                    {...field}
                                    options={addressOptions}
                                    label={t("optimization.arrivalAddress")}
                                    error={error?.message}
                                    data-testid="end-address"
                                />
                            )}
                        />
                    )}
                </>
            )}
        </Box>
    );
}

interface TransportAddressWithCoordinates
    extends Omit<TransportAddress, "latitude" | "longitude"> {
    latitude: number;
    longitude: number;
}

export function getAddressOptions(validTrips: CompactTrip[]): TransportAddressWithCoordinates[] {
    // Get distinct coordinates from activities
    return validTrips
        .map(({activities}) => activities)
        .flat()
        .map(({address}) => address)
        .filter(
            (address) =>
                address !== null && address.latitude !== null && address.longitude !== null
        )
        .filter(
            (address: TransportAddressWithCoordinates, index, self) =>
                index ===
                self.findIndex(
                    (a) => a?.latitude === address.latitude && a?.longitude === address.longitude
                )
        ) as TransportAddressWithCoordinates[];
}
