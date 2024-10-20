import {FilterData, FilteringBadge} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {DatePicker, Flex, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import {isSameDay} from "date-fns";
import addDays from "date-fns/addDays";
import React, {useCallback} from "react";

type DateQuery = {
    date?: string | null;
};
type Props = {query: DateQuery; updateQuery: (query: Partial<DateQuery>) => void};

const TODAY = new Date();
const TOMORROW = addDays(TODAY, 1);
export function DateSelector({query, updateQuery}: Props) {
    const parsedDate = query.date ? new Date(query.date) : new Date();
    const handleFiltersDateChange = useCallback(
        (date: Date) => updateQuery({date: formatDate(date, "yyyy-MM-dd")}),
        [updateQuery]
    );

    const formattedDate = formatDate(parsedDate, "P");
    const value = isSameDay(parsedDate, TODAY)
        ? t("common.today") + " " + formattedDate
        : isSameDay(parsedDate, TOMORROW)
          ? t("dateRangePicker.staticRanges.tomorrow") + " " + formattedDate
          : undefined;

    return (
        <DatePicker
            value={value}
            date={parsedDate}
            onChange={handleFiltersDateChange}
            calendarSelectionOnly={true}
        />
    );
}

export function getDateFilter(): FilterData<DateQuery> {
    return {
        key: "date",
        testId: "date",
        selector: {
            label: t("common.date"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery) => (
                <DateSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query) => [
            {
                count: query["date"] ? 1 : 0,
                badge: (
                    <FilteringBadge
                        key="date"
                        label={
                            <Flex minHeight="22px" alignItems="center">
                                <Text variant="captionBold">{formatDate(query["date"], "P")}</Text>
                            </Flex>
                        }
                    />
                ),
            },
        ],
    };
}
