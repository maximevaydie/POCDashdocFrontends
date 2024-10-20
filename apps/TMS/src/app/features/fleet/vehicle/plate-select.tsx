import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {queryService} from "@dashdoc/web-core";
import {
    AsyncCreatableSelect,
    Box,
    Flex,
    Icon,
    AsyncCreatableSelectProps,
    BoxProps,
    Text,
    SelectOption,
    TextProps,
} from "@dashdoc/web-ui";
import {Callout} from "@dashdoc/web-ui";
import {Trailer, Vehicle as VehicleData, SiteSlot} from "dashdoc-utils";
import React, {ComponentProps, forwardRef, useEffect, useState} from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {useExtendedView} from "app/hooks/useExtendedView";

export const NO_TRAILER_PK = -1;
export const getNoTrailerOption = () => ({
    pk: NO_TRAILER_PK,
    license_plate: t("components.noTrailer"),
});

export const searchVehicles = async (
    input: string,
    extendedView: boolean
): Promise<SelectOption<Partial<VehicleData>>[]> =>
    new Promise((resolve, reject) => {
        const query: {text: string; has_license_plate: true; extended_view?: boolean} = {
            text: input,
            has_license_plate: true,
            extended_view: extendedView,
        };
        apiService
            .get(`/vehicles/?${queryService.toQueryString(query)}`, {apiVersion: "v4"})
            .then((response: any) => {
                const options: SelectOption<Partial<VehicleData>>[] = response.results.map(
                    (vehicle: VehicleData) => {
                        return {
                            value: vehicle,
                            label: vehicle.license_plate,
                        };
                    }
                );
                resolve(options);
            })
            .catch((error) => reject(error));
    });

export const searchTrailers = async (
    input: string,
    extendedView: boolean,
    excludeNoTrailer: boolean
): Promise<SelectOption<Partial<Trailer>>[]> =>
    new Promise((resolve, reject) => {
        const query: {text: string; has_license_plate: true; extended_view?: boolean} = {
            text: input,
            has_license_plate: true,
            extended_view: extendedView,
        };
        apiService
            .get(`/trailers/?${queryService.toQueryString(query)}`, {apiVersion: "v4"})
            .then((response: any) => {
                const options: SelectOption<Partial<Trailer>>[] = response.results.map(
                    (trailer: Trailer) => {
                        return {
                            value: trailer,
                            label: trailer.license_plate,
                        };
                    }
                );
                if (!input && !excludeNoTrailer) {
                    options.unshift({
                        label: t("components.noTrailer"),
                        value: {
                            pk: NO_TRAILER_PK,
                            license_plate: t("components.noTrailer"),
                        },
                        iconName: "close",
                    });
                }
                resolve(options);
            })
            .catch((error) => reject(error));
    });

type OwnProps = {
    vehicle?: Partial<VehicleData> | Partial<Trailer> | string;
    color?: string;
    children?: any;
};
type VehicleProps = OwnProps & BoxProps & TextProps;
export const Vehicle = ({vehicle, color, children, ...props}: VehicleProps) => (
    <Flex {...props} fontSize={props.fontSize ?? "inherit"}>
        {typeof vehicle === "string" ? (
            <Text
                style={{lineHeight: "inherit"}}
                display="inline-block"
                color={color ?? "inherit"}
            >
                {vehicle}
            </Text>
        ) : (
            vehicle && <VehicleLabel vehicle={vehicle} color={color} {...props} />
        )}
        <Box display="inline-block">{children}</Box>
    </Flex>
);

export const PlateSelectOption = (option: {
    iconName?: ComponentProps<typeof Icon>["name"];
    label?: string;
    value?: Partial<VehicleData> | Partial<Trailer> | string;
    __isNew__?: boolean;
}) => (
    <>
        {option.__isNew__ ? (
            <Text display="inline-block" color="inherit">
                {option.label}
            </Text>
        ) : (
            <Box display="inline-block">
                {option.value && (
                    <Vehicle alignItems="center" vehicle={option.value ?? undefined} />
                )}
            </Box>
        )}
    </>
);

type PlateSelectProps<TValue = Partial<VehicleData> | Partial<Trailer> | string> = Partial<
    AsyncCreatableSelectProps<SelectOption<TValue>, false>
> & {
    tripUid?: string;
    dateRange?: SiteSlot;
    hideNoTrailerOption?: boolean;
    hideExtendedViewOptions?: boolean;
};

const commonProps: PlateSelectProps = {
    formatOptionLabel: PlateSelectOption,
    defaultOptions: true, // the results for loadOptions('') will be autoloaded
    formatCreateLabel: (query: string) => (
        <Flex alignItems="center">
            <Icon name="add" mr={1} color="inherit" />
            <Text color="inherit">{t("transportsForm.addNewPlate", {query})}</Text>
        </Flex>
    ),
    isValidNewOption: (value: string) => value.length > 0,
};

export const VehiclePlateSelect = forwardRef(
    (
        {
            tripUid,
            dateRange,
            hideExtendedViewOptions,
            ...props
        }: PlateSelectProps<Partial<VehicleData> | string>,
        ref
    ) => {
        const [hasAvailabilityConflict, setAvailabilityConflict] = useState(false);
        const {extendedView} = useExtendedView();
        const vehicle = (props.value as SelectOption<VehicleData>)?.value;
        const originalVehiclePk = vehicle?.original ?? vehicle?.pk;

        useEffect(() => {
            if (originalVehiclePk && (tripUid || dateRange)) {
                let payload;
                let unavailaibilityUrl = "has-unavailability";
                if (dateRange) {
                    payload = {
                        start_date: dateRange.start,
                        end_date: dateRange.end,
                    };
                } else if (tripUid) {
                    payload = {trip_uid: tripUid};
                    unavailaibilityUrl = "has-unavailability-during-trip";
                }
                apiService
                    .post(`/vehicles/${originalVehiclePk}/${unavailaibilityUrl}/`, payload)
                    .then((res) => {
                        setAvailabilityConflict(res.conflict);
                    })
                    .catch(() => {
                        setAvailabilityConflict(false);
                    });
            } else {
                setAvailabilityConflict(false);
            }
        }, [dateRange, originalVehiclePk, tripUid]);

        return (
            <>
                <AsyncCreatableSelect
                    ref={ref}
                    {...commonProps}
                    placeholder={t("components.chooseVehiclePlate")}
                    loadOptions={(input: string) =>
                        searchVehicles(input, !hideExtendedViewOptions && extendedView)
                    }
                    {...props}
                />
                {hasAvailabilityConflict && (
                    <Callout mt={2} variant="warning" data-testid="conflict-availability-vehicle">
                        <Text>{t("unavailability.vehicleUnavailableOnPeriod")}</Text>
                    </Callout>
                )}
            </>
        );
    }
);
VehiclePlateSelect.displayName = "VehiclePlateSelect";

export const TrailerPlateSelect = forwardRef(
    (
        {
            tripUid,
            dateRange,
            hideNoTrailerOption = false,
            hideExtendedViewOptions,
            ...props
        }: PlateSelectProps<Partial<Trailer> | string>,
        ref
    ) => {
        const [hasAvailabilityConflict, setAvailabilityConflict] = useState(false);
        const {extendedView} = useExtendedView();

        const trailer = (props?.value as SelectOption<Trailer>)?.value;
        const originalTrailerPk = trailer?.original ?? trailer?.pk;

        useEffect(() => {
            if (
                (tripUid || dateRange) &&
                originalTrailerPk &&
                originalTrailerPk !== NO_TRAILER_PK
            ) {
                let payload;
                let unavailaibilityUrl = "has-unavailability";
                if (dateRange) {
                    payload = {
                        start_date: dateRange.start,
                        end_date: dateRange.end,
                    };
                } else if (tripUid) {
                    payload = {trip_uid: tripUid};
                    unavailaibilityUrl = "has-unavailability-during-trip";
                }
                apiService
                    .post(`/trailers/${originalTrailerPk}/${unavailaibilityUrl}/`, payload)
                    .then((res) => {
                        setAvailabilityConflict(res.conflict);
                    })
                    .catch(() => {
                        setAvailabilityConflict(false);
                    });
            } else {
                setAvailabilityConflict(false);
            }
        }, [dateRange, originalTrailerPk, tripUid]);

        return (
            <>
                <AsyncCreatableSelect
                    ref={ref}
                    {...commonProps}
                    placeholder={t("components.chooseTrailerPlate")}
                    loadOptions={(input: string) =>
                        searchTrailers(
                            input,
                            !hideExtendedViewOptions && extendedView,
                            hideNoTrailerOption
                        )
                    }
                    {...props}
                />
                {hasAvailabilityConflict && (
                    <Callout mt={2} variant="warning" data-testid="conflict-availability-trailer">
                        <Text>{t("unavailability.trailerUnavailableOnPeriod")}</Text>
                    </Callout>
                )}
            </>
        );
    }
);
TrailerPlateSelect.displayName = "TrailerPlateSelect";
