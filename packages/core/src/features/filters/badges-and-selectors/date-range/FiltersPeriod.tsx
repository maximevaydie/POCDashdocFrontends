import {
    DateRangePicker,
    dateRangePickerDefaultStaticRanges,
    DateRangePickerRange,
    NoWrap,
} from "@dashdoc/web-ui";
import {isValidDate} from "dashdoc-utils";
import {parseISO} from "date-fns";
import React, {useMemo, useCallback} from "react";

import type {PeriodFilterProps} from "../../../../types/types";

export type PeriodFilterQueryKeys<TQuery> = {
    start_date_key: keyof TQuery;
    end_date_key: keyof TQuery;
    period_key: keyof TQuery;
};

type Props<TQuery> = {
    queryKeys: PeriodFilterQueryKeys<TQuery>;
    currentQuery: TQuery;
    updateQuery: (newQuery: Partial<TQuery>) => void;
    onChange?: (range: DateRangePickerRange, meta: {staticRange: string}) => void;
    defaultRange?: DateRangePickerRange;
    periodFilterProps?: PeriodFilterProps;
    selectionOnly?: boolean;
    testId?: string;
};

export function FiltersPeriod<TQuery>({
    queryKeys,
    periodFilterProps,
    currentQuery,
    updateQuery,
    onChange,
    defaultRange,
    selectionOnly,
    testId,
}: Props<TQuery>) {
    const {start_date_key, end_date_key, period_key} = queryKeys;
    // getQuerySelectorKeys(querySelector);

    const defaultRanges = useMemo(
        () => periodFilterProps?.staticRanges ?? dateRangePickerDefaultStaticRanges,
        [periodFilterProps?.staticRanges]
    );
    const queryStartDate = useMemo(
        () => currentQuery[start_date_key] as string,
        [currentQuery, start_date_key]
    );
    const queryEndDate = useMemo(
        () => currentQuery[end_date_key] as string,
        [currentQuery, end_date_key]
    );
    const queryPeriod = useMemo(
        () => currentQuery[period_key] as string,
        [currentQuery, period_key]
    );

    const range = useMemo(() => {
        let range: DateRangePickerRange = {
            startDate: undefined,
            endDate: undefined,
        };
        if (queryStartDate) {
            const parsedStartDate = parseISO(queryStartDate);
            if (isValidDate(parsedStartDate)) {
                range.startDate = parsedStartDate;
            }
        }
        if (queryEndDate) {
            const parsedEndDate = parseISO(queryEndDate);
            if (isValidDate(parsedEndDate)) {
                range.endDate = parsedEndDate;
            }
        }
        if (queryPeriod && defaultRanges[queryPeriod]) {
            range = {
                startDate: defaultRanges[queryPeriod].range.getStartDate(),
                endDate: defaultRanges[queryPeriod].range.getEndDate(),
            };
        }
        return range;
    }, [queryStartDate, queryEndDate, queryPeriod, defaultRanges]);

    const onChangeUpdateQuery = useCallback(
        (
            {startDate, endDate}: {startDate: Date; endDate: Date},
            {staticRange}: {staticRange: string}
        ) => {
            if (staticRange) {
                updateQuery({
                    [period_key]: staticRange,
                    [start_date_key]: undefined,
                    [end_date_key]: undefined,
                } as Partial<TQuery>);
            } else {
                // It appears that the backend expects the date either with the timezone or not
                // For this reason we don't include the timezone there (but it should)
                // It's the responsability of the caller to properly format the date
                updateQuery({
                    [period_key]: undefined,
                    [start_date_key]: startDate?.toISOString(),
                    [end_date_key]: endDate?.toISOString(),
                } as Partial<TQuery>);
            }
        },
        [updateQuery, start_date_key, end_date_key, period_key]
    );

    const label = useMemo(
        () => (periodFilterProps?.label ? <NoWrap>{periodFilterProps.label}</NoWrap> : undefined),
        [periodFilterProps?.label]
    );

    return (
        <DateRangePicker
            data-testid={"filters-" + testId}
            {...periodFilterProps}
            label={label}
            range={defaultRange ?? range}
            onChange={onChange ?? onChangeUpdateQuery}
            selectionOnly={selectionOnly}
        />
    );
}
