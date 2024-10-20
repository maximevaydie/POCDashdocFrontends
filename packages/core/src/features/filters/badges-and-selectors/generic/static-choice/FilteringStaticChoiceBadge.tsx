import React from "react";

import {FilteringBadge} from "../FilteringBadge";

type Props<TQuery> = {
    query: TQuery;
    updateQuery: (query: TQuery) => void;
    queryKey: keyof TQuery;
    items: {label: string; value: string}[];
    label: string;
    testId?: string;
    ignore?: boolean;
};

export function FilteringStaticChoiceBadge<TQuery extends Record<string, string | undefined>>({
    query,
    updateQuery,
    queryKey,
    items,
    label,
    testId,
    ignore,
}: Props<TQuery>) {
    return (
        <FilteringBadge
            onDelete={handleDelete}
            label={getLabel()}
            data-testid={testId}
            ignore={ignore}
        />
    );
    function getLabel() {
        const value = query[queryKey];
        if (!value) {
            return "";
        }
        const itemLabel = items.find((item) => item.value === value)?.label ?? "";
        if (!itemLabel) {
            return "";
        }
        return `${label} : ${itemLabel}`;
    }

    function handleDelete() {
        updateQuery({[queryKey]: undefined} as TQuery);
    }
}
