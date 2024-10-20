import {t} from "@dashdoc/web-core";
import {SearchableStaticItemsSelector} from "@dashdoc/web-ui";
import React from "react";

import {FilteringHeader} from "../FilteringSelectorHeader";

type StatusOption = {label: string; value: string};
type Props<TQuery extends Record<string, string[]>> = {
    query: TQuery;
    updateQuery: (query: TQuery) => void;
    queryKey: keyof TQuery;
    items: StatusOption[];
    label: string;
};

export function FilteringStaticListSelector<TQuery extends Record<string, string[]>>({
    query,
    updateQuery,
    queryKey,
    items,
    label,
}: Props<TQuery>) {
    return (
        <>
            <FilteringHeader dataTypeLabel={label} conditionLabel={t("filter.in")} />
            <SearchableStaticItemsSelector<StatusOption>
                items={items}
                getItemId={({value}) => value}
                getItemLabel={({label}) => label}
                values={query[queryKey] ?? []}
                onChange={(values) => updateQuery({[queryKey]: values} as TQuery)}
                searchTextMatchItem={(item, searchText) =>
                    item.label.toLowerCase().includes(searchText.toLowerCase())
                }
                enableSelectAll
            />
        </>
    );
}
