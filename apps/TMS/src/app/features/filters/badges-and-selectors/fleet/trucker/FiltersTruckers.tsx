import {apiService, FilterSelectorProps} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    FiltersAsyncPaginatedSelect,
    FiltersSelectAsyncPaginatedProps,
    toast,
} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useMemo} from "react";
import {ActionMeta} from "react-select";

import {useExtendedView} from "app/hooks/useExtendedView";

import {TruckersQuery} from "./truckerFilter.types";

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchTruckersResponse = ReturnType<typeof apiService.Truckers.getAll>;
export type Truckers = UnPromisify<FetchTruckersResponse>["results"];

export type FiltersTruckersValue = Truckers;
export type FiltersTruckersProps = FilterSelectorProps<TruckersQuery> & {
    truckers: Record<string | number, Truckers[0] | undefined>;
    setLoadedTruckers: (truckers: Truckers) => void;
    selectionOnly?: boolean;
    sortAndFilters?: {
        ordering?: string;
        tags__in?: string[];
        extended_view?: boolean;
        id__in?: string[];
    };
};

export const FiltersTruckers: FunctionComponent<FiltersTruckersProps> = ({
    currentQuery,
    updateQuery,
    truckers,
    setLoadedTruckers,
    selectionOnly,
    sortAndFilters = {},
}) => {
    const {extendedView} = useExtendedView();
    // declare loadOptions function for FiltersAsyncPaginatedSelect
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const path = `manager-truckers/?${queryService.toQueryString({
                    text,
                    page,
                    extended_view: extendedView,
                    ...sortAndFilters,
                })}`;
                const {results: truckers, next} = await apiService.get(path);

                setLoadedTruckers?.(truckers);

                return {
                    options: truckers,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchTruckers"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [setLoadedTruckers, extendedView, sortAndFilters]
    );

    // handle select/unselect trucker
    const onChange = useCallback(
        (_: any, actionMeta: ActionMeta<Trucker>) => {
            // @ts-ignore
            const newSelection = currentQuery.trucker__in.reduce(
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
            updateQuery({trucker__in: Object.keys(newSelection)});
        },
        [currentQuery.trucker__in]
    );

    const onMultiSelect = useCallback(
        (options: Array<Record<string, string>>, select: boolean) => {
            // @ts-ignore
            const newSelection = currentQuery.trucker__in.reduce(
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
            updateQuery({trucker__in: Object.keys(newSelection)});
        },
        [currentQuery, updateQuery]
    );

    const getOptionValue = useCallback(({pk}: Trucker) => pk.toString(), []);
    const getOptionLabel = useCallback((trucker: Trucker) => {
        let label = trucker.user.last_name + " " + trucker.user.first_name;
        if (trucker.is_disabled == true) {
            label = `${label} (${t("common.disabled")})`;
        }
        return label;
    }, []);

    const selectedTruckers = useMemo(
        () =>
            // @ts-ignore
            Object.values(truckers).filter(({pk}) =>
                // @ts-ignore
                currentQuery.trucker__in.some((trucker__in_pk) => trucker__in_pk === pk.toString())
            ),
        [truckers, currentQuery?.trucker__in]
    );

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="filters-truckers"
            label={t("common.trucker")}
            leftIcon="trucker"
            loadOptions={loadOptions}
            defaultOptions={true}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            value={selectedTruckers}
            onSelectAll={(options) => onMultiSelect(options as Record<string, string>[], true)}
            onUnselectAll={(options) => onMultiSelect(options as Record<string, string>[], false)}
            isSearchable={true}
            onChange={onChange}
            selectionOnly={selectionOnly}
        />
    );
};
