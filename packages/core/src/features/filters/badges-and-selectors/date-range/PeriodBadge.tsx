import {t} from "@dashdoc/web-core";
import {dateRangePickerDefaultStaticRanges, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

import {FilteringBadge} from "../generic/FilteringBadge";

import {getTypeOfDatePrefixLabel} from "./dateBadge.service";
import {FilterDateTypes} from "./dateRangeFilter.types";

import type {Period, PeriodFilterProps} from "../../../../types/types";

type PeriodBadgeProps<TQuery> = {
    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    queryKey: keyof TQuery;
    staticRanges?: PeriodFilterProps["staticRanges"];
    typeOfDates: FilterDateTypes;
    ignore?: boolean;
    defaultPeriod?: Period;
};

export function PeriodBadge<TQuery extends Record<string, string | null>>({
    query,
    updateQuery,
    queryKey,
    staticRanges = dateRangePickerDefaultStaticRanges,
    typeOfDates,
    ignore,
    defaultPeriod,
}: PeriodBadgeProps<TQuery>) {
    const hasValue = !!query[queryKey];
    const isDeletable = query[queryKey] !== defaultPeriod || typeOfDates !== "all";

    return hasValue ? (
        <FilteringBadge
            data-testid={`badges-${queryKey as string}`}
            label={
                isDeletable ? (
                    getLabel()
                ) : (
                    <Text variant="caption" lineHeight="22px">
                        {getLabel()}
                    </Text>
                )
            }
            onDelete={
                isDeletable ? () => updateQuery({[queryKey]: null} as Partial<TQuery>) : undefined
            }
            ignore={ignore}
        />
    ) : null;

    function getLabel() {
        const periodBadgeData = staticRanges[query[queryKey] as Period];
        const periodBadgeDataLabel = periodBadgeData.label ? t(periodBadgeData.label) : "";
        let label = "";
        if (periodBadgeData) {
            if (["tomorrow", "today"].includes(query[queryKey] as Period)) {
                label = `${periodBadgeDataLabel} (${formatDate(
                    periodBadgeData.range.getStartDate()?.toISOString(),
                    "P"
                )})`;
            } else {
                label = `${periodBadgeDataLabel}  (${formatDate(
                    periodBadgeData.range.getStartDate()?.toISOString(),
                    "P"
                )} - ${formatDate(periodBadgeData.range.getEndDate()?.toISOString(), "P")})`;
            }
        }

        return getTypeOfDatePrefixLabel(typeOfDates) + label;
    }
}
