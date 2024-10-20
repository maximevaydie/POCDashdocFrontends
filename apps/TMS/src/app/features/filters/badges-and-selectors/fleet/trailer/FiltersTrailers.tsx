import {apiService, FilterSelectorProps} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    Box,
    FiltersAsyncPaginatedSelect,
    FiltersSelectAsyncPaginatedProps,
    toast,
} from "@dashdoc/web-ui";
import {Trailer, FleetItem} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useMemo} from "react";
import {ActionMeta} from "react-select";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {useExtendedView} from "app/hooks/useExtendedView";

import {TrailersQuery} from "./trailerFilter.types";

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchTrailersResponse = ReturnType<typeof apiService.Trailers.getAll>;
export type TrailersResponse = UnPromisify<FetchTrailersResponse>["results"];

export type FiltersTrailersValue = TrailersResponse;
export type FiltersTrailersProps = FilterSelectorProps<TrailersQuery> & {
    trailers: Record<string | number, TrailersResponse[0] | undefined>;
    setLoadedTrailers: (trailers: TrailersResponse) => void;
    selectionOnly?: boolean;
    sortAndFilters?: {
        ordering?: string;
        tags__in?: string[];
        extended_view?: boolean;
        id__in?: string[];
    };
};

export const FiltersTrailers: FunctionComponent<FiltersTrailersProps> = ({
    currentQuery,
    updateQuery,
    trailers,
    setLoadedTrailers,
    selectionOnly,
    sortAndFilters = {},
}) => {
    const {extendedView} = useExtendedView();
    // declare loadOptions function for FiltersAsyncPaginatedSelect
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const path = `trailers/?${queryService.toQueryString({
                    text,
                    page,
                    has_license_plate: "true",
                    ordering: "license_plate",
                    extended_view: extendedView,
                    ...sortAndFilters,
                })}`;
                const {results: trailers, next} = await apiService.get(path);
                setLoadedTrailers(trailers);

                return {
                    options: trailers,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchTrailers"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [setLoadedTrailers, extendedView, sortAndFilters]
    );

    // handle select/unselect trailer
    const onChange = useCallback(
        (_: any, actionMeta: ActionMeta<FleetItem>) => {
            // @ts-ignore
            const newSelection = currentQuery.trailer__in.reduce(
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
            updateQuery({trailer__in: Object.keys(newSelection)});
        },
        [currentQuery.trailer__in]
    );

    const onMultiSelect = useCallback(
        (options: Array<Record<string, string>>, select: boolean) => {
            // @ts-ignore
            const newSelection = currentQuery.trailer__in.reduce(
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
            updateQuery({trailer__in: Object.keys(newSelection)});
        },
        [currentQuery, updateQuery]
    );

    const getOptionValue = useCallback(({pk}: Trailer) => pk.toString(), []);
    const getOptionLabel = useCallback(({license_plate}: Trailer) => license_plate, []);
    const formatOptionLabel = useCallback(
        ({license_plate, fleet_number}: Trailer) => (
            <Box display="inline-block" maxWidth="100%">
                <VehicleLabel vehicle={{license_plate, fleet_number}} flexWrap="wrap" />
            </Box>
        ),
        []
    );
    const selectedTrailers = useMemo(
        () =>
            // @ts-ignore
            Object.values(trailers).filter(({pk}) =>
                // @ts-ignore
                currentQuery.trailer__in.some((trailer__in_pk) => trailer__in_pk === pk.toString())
            ),
        [trailers, currentQuery?.trailer__in]
    );

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="filters-trailers"
            label={t("common.trailer")}
            leftIcon="truck"
            loadOptions={loadOptions}
            defaultOptions={true}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            value={selectedTrailers}
            onChange={onChange}
            selectionOnly={selectionOnly}
            onSelectAll={(options) => onMultiSelect(options as Record<string, string>[], true)}
            onUnselectAll={(options) => onMultiSelect(options as Record<string, string>[], false)}
        />
    );
};
