import {apiService, FilterSelectorProps} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    Box,
    FiltersAsyncPaginatedSelect,
    FiltersSelectAsyncPaginatedProps,
    toast,
} from "@dashdoc/web-ui";
import {Vehicle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useMemo} from "react";
import {ActionMeta} from "react-select";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {useExtendedView} from "app/hooks/useExtendedView";

import {VehiclesQuery} from "./vehicleFilter.types";

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchVehiclesResponse = ReturnType<typeof apiService.Vehicles.getAll>;
export type VehiclesResponse = UnPromisify<FetchVehiclesResponse>["results"];

export type FiltersVehiclesValue = VehiclesResponse;
export type FiltersVehiclesProps = FilterSelectorProps<VehiclesQuery> & {
    vehicles: Record<string | number, VehiclesResponse[0] | undefined>;
    setLoadedVehicles: (vehicles: VehiclesResponse) => void;
    selectionOnly?: boolean;
    sortAndFilters?: {
        ordering?: string;
        tags__in?: string[];
        extended_view?: boolean;
        id__in?: string[];
    };
};

export const FiltersVehicles: FunctionComponent<FiltersVehiclesProps> = ({
    currentQuery,
    updateQuery,
    vehicles,
    setLoadedVehicles,
    selectionOnly,
    sortAndFilters = {},
}) => {
    const {extendedView} = useExtendedView();
    // declare loadOptions function for `FiltersAsyncPaginatedSelect`
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const path = `vehicles/?${queryService.toQueryString({
                    text,
                    page,
                    has_license_plate: "true",
                    ordering: "license_plate",
                    extended_view: extendedView,
                    ...sortAndFilters,
                })}`;
                const {results: vehicles, next} = await apiService.get(path);
                setLoadedVehicles(vehicles);

                return {
                    options: vehicles,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchVehicles"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [setLoadedVehicles, extendedView, sortAndFilters]
    );

    // handle select/unselect vehicle
    const onChange = useCallback(
        (_: any, actionMeta: ActionMeta<Vehicle>) => {
            // @ts-ignore
            const newSelection = currentQuery.vehicle__in.reduce(
                (acc, pk) => {
                    acc[pk] = true;
                    return acc;
                },
                {} as Record<string, boolean>
            );
            if (actionMeta.action === "select-option" && actionMeta.option) {
                newSelection[actionMeta.option.pk] = true;
            }
            if (actionMeta.action === "deselect-option" && actionMeta.option) {
                delete newSelection[actionMeta.option.pk];
            }
            updateQuery({vehicle__in: Object.keys(newSelection)});
        },
        [currentQuery.vehicle__in]
    );

    const onMultiSelect = useCallback(
        (options: Array<Record<string, string>>, select: boolean) => {
            // @ts-ignore
            const newSelection = currentQuery.vehicle__in.reduce(
                (acc, name) => {
                    acc[name] = true;
                    return acc;
                },
                {} as Record<string, boolean>
            );

            options.map((option) => {
                if (select) {
                    newSelection[option["pk"]] = true;
                } else {
                    delete newSelection[option["pk"]];
                }
            });
            updateQuery({vehicle__in: Object.keys(newSelection)});
        },
        [currentQuery, updateQuery]
    );

    const getOptionValue = useCallback(({pk}: Vehicle) => pk.toString(), []);
    const getOptionLabel = useCallback(({license_plate}: Vehicle) => license_plate, []);
    const formatOptionLabel = useCallback(
        ({license_plate, fleet_number}: Vehicle) => (
            <Box display="inline-block" maxWidth="100%">
                <VehicleLabel vehicle={{license_plate, fleet_number}} flexWrap="wrap" />
            </Box>
        ),
        []
    );
    const selectedVehicles = useMemo(
        () =>
            // @ts-ignore
            Object.values(vehicles).filter(({pk}) =>
                // @ts-ignore
                currentQuery.vehicle__in.some((vehicle__in_pk) => vehicle__in_pk === pk.toString())
            ),
        [vehicles, currentQuery?.vehicle__in]
    );

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="filters-vehicles"
            label={t("common.vehicle")}
            leftIcon="truck"
            loadOptions={loadOptions}
            defaultOptions={true}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            value={selectedVehicles}
            onChange={onChange}
            selectionOnly={selectionOnly}
            onSelectAll={(options) => onMultiSelect(options as Record<string, string>[], true)}
            onUnselectAll={(options) => onMultiSelect(options as Record<string, string>[], false)}
        />
    );
};
