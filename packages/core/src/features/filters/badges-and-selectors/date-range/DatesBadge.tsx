import {formatDate} from "dashdoc-utils";
import React from "react";

import {FilteringBadge} from "../generic/FilteringBadge";

import {getTypeOfDatePrefixLabel} from "./dateBadge.service";
import {FilterDateTypes} from "./dateRangeFilter.types";

type DatesBadgeProps<TQuery> = {
    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    startDateQueryKey: keyof TQuery;
    endDateQueryKey: keyof TQuery;
    periodDateBadgeFormat?: string;
    typeOfDates?: FilterDateTypes;
};

export function DatesBadge<TQuery extends Record<string, string | null>>({
    query,
    updateQuery,
    startDateQueryKey,
    endDateQueryKey,
    periodDateBadgeFormat = "P",
    typeOfDates = "all",
}: DatesBadgeProps<TQuery>) {
    const start = query[startDateQueryKey];
    const end = query[endDateQueryKey];
    const hasValue = !!start || !!end;

    const prefixTypeOfDates = getTypeOfDatePrefixLabel(typeOfDates);

    return hasValue ? (
        <FilteringBadge
            data-testid={`badges-dates-${startDateQueryKey as string}`}
            label={getLabel()}
            onDelete={() =>
                updateQuery({
                    [startDateQueryKey]: null,
                    [endDateQueryKey]: null,
                } as Partial<TQuery>)
            }
        />
    ) : null;

    function getLabel() {
        return formatDate(start, periodDateBadgeFormat) === formatDate(end, periodDateBadgeFormat)
            ? `${prefixTypeOfDates}${formatDate(start, periodDateBadgeFormat)}`
            : `${prefixTypeOfDates}${formatDate(start, periodDateBadgeFormat)} - ${formatDate(
                  end,
                  periodDateBadgeFormat
              )}`;
    }
}
