import React from "react";

import {FilteringListBadge} from "../FilteringBadge";

type Props<TQuery> = {
    query: TQuery;
    updateQuery: (query: TQuery) => void;
    queryKey: keyof TQuery;
    items: {label: string; value: string}[];
    label: string;
    testId?: string;
    ignore?: boolean;
};

export function FilteringStaticListBadge<TQuery extends Record<string, string[]>>({
    query,
    updateQuery,
    queryKey,
    items,
    label,
    testId,
    ignore,
}: Props<TQuery>) {
    return (
        <FilteringListBadge
            queryKey={queryKey as string}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid={testId}
            ignore={ignore}
        />
    );
    function getLabel() {
        return `${label} : ${query[queryKey]
            ?.map((status) => getStatusLabel(status, items))
            .join(", ")}`;
    }
}

function getStatusLabel(status: string, items: {label: string; value: string}[]) {
    return items.find((item) => item.value === status)?.label ?? "";
}
