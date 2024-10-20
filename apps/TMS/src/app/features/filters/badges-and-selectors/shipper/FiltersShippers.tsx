import {CompanyName, FilterSelectorProps, apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    FiltersAsyncPaginatedSelect,
    Flex,
    FiltersSelectAsyncPaginatedProps,
    toast,
} from "@dashdoc/web-ui";
import {PartialCompany} from "dashdoc-utils";
import React, {useCallback, useMemo} from "react";
import {ActionMeta, FormatOptionLabelMeta, OptionTypeBase} from "react-select";

import {useExtendedView} from "app/hooks/useExtendedView";

import {ShippersQuery, DebtorsQuery} from "./shipperFilter.types";

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchShippersResponse = ReturnType<typeof apiService.Deliveries.getAllShippers>;
export type Shippers = UnPromisify<FetchShippersResponse>["results"];

export type FiltersShippersValue = Shippers;
export type FiltersShippersProps = FilterSelectorProps<ShippersQuery & DebtorsQuery> & {
    shippers: Record<string | number, Shippers[0] | undefined>;
    filterDebtor?: boolean;
    setLoadedShippers: (shippers: Shippers) => void;
    selectionOnly?: boolean;
};

type Props = {
    selectedShippers: Shippers;
    filterDebtor?: boolean;
    setLoadedShippers?: (shippers: Shippers) => void;
    onMultiSelect?: (options: Array<Record<string, string>>, select: boolean) => void;
    onChange: (value: PartialCompany, action: ActionMeta<PartialCompany>) => void;
    selectionOnly?: boolean;
};

export function ShippersAsyncPaginatedSelect({
    setLoadedShippers,
    onMultiSelect,
    onChange,
    selectedShippers,
    filterDebtor,
    selectionOnly,
}: Props) {
    const {extendedView} = useExtendedView();
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (
            text: string,
            _: any,
            {page, extended_view}: {page: number; extended_view: boolean}
        ) => {
            try {
                const {results: shippers, next} = await apiService.Deliveries.getAllShippers({
                    query: {
                        text,
                        page,
                        extended_view,
                    },
                });

                setLoadedShippers?.(shippers);

                return {
                    options: shippers,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                        extended_view,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchShippers"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [setLoadedShippers]
    );

    const getOptionValue = useCallback(({pk}: PartialCompany) => pk.toString(), []);
    const getOptionLabel = useCallback(({name}: PartialCompany) => name, []);
    const formatOptionLabel = useCallback(
        (
            company: PartialCompany,
            {inputValue}: FormatOptionLabelMeta<OptionTypeBase, boolean>
        ) => (
            <Flex alignItems="center">
                <CompanyName company={company} highlight={[inputValue]} />
            </Flex>
        ),
        []
    );
    const additionalSelectProps = useMemo(
        () => ({page: 1, extended_view: extendedView}),
        [extendedView]
    );

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="filters-shippers"
            label={filterDebtor ? t("common.customerToInvoice") : t("common.shipper")}
            leftIcon="shipper"
            loadOptions={loadOptions}
            defaultOptions={true}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            additional={additionalSelectProps}
            onSelectAll={
                onMultiSelect
                    ? (options) => onMultiSelect(options as Record<string, string>[], true)
                    : undefined
            }
            onUnselectAll={
                onMultiSelect
                    ? (options) => onMultiSelect(options as Record<string, string>[], false)
                    : undefined
            }
            value={selectedShippers}
            onChange={onChange}
            selectionOnly={selectionOnly}
        />
    );
}

export function FiltersShippers({
    currentQuery,
    updateQuery,
    shippers,
    filterDebtor,
    setLoadedShippers,
    selectionOnly,
}: FiltersShippersProps) {
    const queryKey = filterDebtor ? "debtor__in" : "shipper__in";

    // handle select/unselect shipper
    const onChange = useCallback(
        (_: any, actionMeta: ActionMeta<PartialCompany>) => {
            // @ts-ignore
            const newSelection = currentQuery[queryKey].reduce(
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
            updateQuery({[queryKey]: Object.keys(newSelection)});
        },
        [currentQuery[queryKey]]
    );

    const onMultiSelect = useCallback(
        (options: Array<Record<string, string>>, select: boolean) => {
            // @ts-ignore
            const newSelection = currentQuery[queryKey].reduce(
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
            updateQuery({[queryKey]: Object.keys(newSelection)});
        },
        [currentQuery, updateQuery]
    );

    const selectedShippers = useMemo(
        () =>
            // @ts-ignore
            Object.values(shippers).filter(({pk}) =>
                // @ts-ignore
                currentQuery[queryKey].some((shipper__in_pk) => shipper__in_pk === pk.toString())
            ),
        [shippers, currentQuery?.[queryKey]]
    );

    return (
        <ShippersAsyncPaginatedSelect
            setLoadedShippers={setLoadedShippers}
            onMultiSelect={onMultiSelect}
            onChange={onChange}
            // @ts-ignore
            selectedShippers={selectedShippers}
            filterDebtor={filterDebtor}
            selectionOnly={selectionOnly}
        />
    );
}
