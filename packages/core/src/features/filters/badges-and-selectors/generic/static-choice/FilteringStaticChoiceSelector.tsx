import {t} from "@dashdoc/web-core";
import {SearchableStaticItemsSelector} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {FilteringHeader} from "../FilteringSelectorHeader";

type StatusOption = {label: string; value: string};
type Props<TQuery extends Record<string, string | undefined>> = {
    query: TQuery;
    updateQuery: (query: TQuery) => void;
    queryKey: keyof TQuery;
    items: StatusOption[];
    label: string;
};

export function FilteringStaticChoiceSelector<TQuery extends Record<string, string | undefined>>({
    query,
    updateQuery,
    queryKey,
    items,
    label,
}: Props<TQuery>) {
    const value = query[queryKey];
    const values = useMemo(() => {
        return value ? [value] : [];
    }, [value]);
    return (
        <>
            <FilteringHeader dataTypeLabel={label} conditionLabel={t("filter.in")} />
            <SearchableStaticItemsSelector<StatusOption>
                items={items}
                getItemId={({value}) => value}
                getItemLabel={({label}) => label}
                values={values}
                onChange={handleChange}
                searchTextMatchItem={
                    // no search if there are less than 6 items
                    items.length > 6
                        ? (item, searchText) =>
                              item.label.toLowerCase().includes(searchText.toLowerCase())
                        : undefined
                }
                enableSelectAll={false}
            />
        </>
    );

    function handleChange(newValues: string[]) {
        const filteredNewValues = newValues.filter((v) => v !== value);
        if (filteredNewValues.length === 0) {
            // invalid value
            updateQuery({[queryKey]: undefined} as TQuery);
        } else {
            const [newValue] = filteredNewValues;
            updateQuery({[queryKey]: newValue} as TQuery);
        }
    }
}
