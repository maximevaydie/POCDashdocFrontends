import {apiService, FilterSelectorProps} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    FiltersAsyncPaginatedSelect,
    FiltersSelectAsyncPaginatedProps,
    toast,
} from "@dashdoc/web-ui";
import {FleetItem} from "dashdoc-utils";
import React, {useCallback, useMemo} from "react";
import {ActionMeta} from "react-select";

import {PlatesQuery} from "./platesFilter.types";

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchFleetPlatesResponse = ReturnType<typeof apiService.UnifiedFleet.getAll>;
type FleetPlates = UnPromisify<FetchFleetPlatesResponse>["results"];

export type FiltersFleetPlatesValue = FleetPlates;
export type FiltersFleetPlatesProps = FilterSelectorProps<PlatesQuery> & {
    fleetItems: Record<number, FleetItem>;
    setLoadedFleetItems: (fleetItems: FleetItem[]) => void;
};

export function FiltersFleetPlates({
    currentQuery,
    updateQuery,
    fleetItems,
    setLoadedFleetItems,
}: FiltersFleetPlatesProps) {
    // declare loadOptions function for FiltersAsyncPaginatedSelect
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                let {results: fleetItems, next} = await apiService.UnifiedFleet.getAll({
                    query: {text: [text], page},
                });

                fleetItems = fleetItems.filter(({license_plate}) => !!license_plate);
                setLoadedFleetItems(fleetItems);

                return {
                    options: fleetItems,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchFleetItems"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [setLoadedFleetItems]
    );

    const onMultiSelect = useCallback(
        (options: Array<Record<string, string>>, select: boolean) => {
            // @ts-ignore
            const newSelection = currentQuery.license_plate__in.reduce(
                (acc, license_plate) => {
                    acc[license_plate] = true;
                    return acc;
                },
                {} as Record<string, boolean>
            );

            options.map((option) => {
                if (select) {
                    newSelection[option["license_plate"]] = true;
                } else {
                    delete newSelection[option["license_plate"]];
                }
            });
            updateQuery({license_plate__in: Object.keys(newSelection)});
        },
        [currentQuery, updateQuery]
    );

    // handle select/unselect fleet item
    const onChange = useCallback(
        (_: any, actionMeta: ActionMeta<FleetItem>) => {
            // @ts-ignore
            const newSelection = currentQuery.license_plate__in.reduce(
                (acc, license_plate) => {
                    acc[license_plate] = true;
                    return acc;
                },
                {} as Record<string, boolean>
            );
            if (actionMeta.action === "select-option" && actionMeta.option) {
                newSelection[actionMeta.option.license_plate] = true;
            }
            if (actionMeta.action === "deselect-option" && actionMeta.option) {
                delete newSelection[actionMeta.option.license_plate];
            }
            updateQuery({license_plate__in: Object.keys(newSelection)});
        },
        [currentQuery.license_plate__in, updateQuery]
    );

    const getOptionValue = useCallback(({license_plate}: FleetItem) => license_plate, []);
    const getOptionLabel = useCallback(({license_plate}: FleetItem) => license_plate, []);

    const selectedFleetItems = useMemo(
        () =>
            Object.values(fleetItems).filter(({license_plate}) =>
                // @ts-ignore
                currentQuery.license_plate__in.some((plate) => plate === license_plate)
            ),
        [fleetItems, currentQuery?.license_plate__in]
    );

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="filters-fleet-items-plates"
            label={t("common.licensePlates")}
            leftIcon="truck"
            loadOptions={loadOptions}
            defaultOptions={true}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            onSelectAll={(options) => onMultiSelect(options as Record<string, string>[], true)}
            onUnselectAll={(options) => onMultiSelect(options as Record<string, string>[], false)}
            value={selectedFleetItems}
            onChange={onChange}
        />
    );
}
