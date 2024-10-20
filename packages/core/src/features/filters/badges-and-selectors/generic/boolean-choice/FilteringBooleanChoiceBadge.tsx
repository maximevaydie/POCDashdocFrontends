import React from "react";

import {FilteringBadge} from "../FilteringBadge";

type Props<TQuery> = {
    query: TQuery;
    updateQuery: (query: TQuery) => void;
    queryKey: keyof TQuery;
    optionsLabels: {on: string; off: string};
    testId?: string;
    ignore?: boolean;
};

export function FilteringBooleanChoiceBadge<TQuery extends Record<string, boolean | undefined>>({
    query,
    updateQuery,
    queryKey,
    optionsLabels,
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
        if (value === undefined) {
            return "";
        }

        return value ? optionsLabels.on : optionsLabels.off;
    }

    function handleDelete() {
        updateQuery({[queryKey]: undefined} as TQuery);
    }
}
