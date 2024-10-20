import {t} from "@dashdoc/web-core";
import {Button, DatePicker, Dropdown, Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {FiltersProps} from "app/features/filters/deprecated/filters.service";

import {FilterQueryWithNavigationParameters} from "./utils";

export enum FilterPeriodQuerySelector {
    Period,
    PoolPeriod,
}

type Props = Pick<
    FiltersProps<FilterQueryWithNavigationParameters>,
    "updateQuery" | "currentQuery"
> & {selectionOnly?: boolean};

export function FiltersDateTimePeriod({updateQuery, currentQuery, selectionOnly = false}: Props) {
    const [isOpen, open, close] = useToggle();
    const {start_date_key, end_date_key} = {
        start_date_key: "start_date",
        end_date_key: "end_date",
    };
    const [start_date, setStartDate] = useState<Date>();
    const [end_date, setEndDate] = useState<Date>();

    const openDropdown = () => {
        if (!currentQuery.start_date) {
            setStartDate(undefined);
        }
        if (!currentQuery.end_date) {
            setEndDate(undefined);
        }
        open();
    };

    const selectStartDate = (newStartDate: Date) => {
        if (newStartDate) {
            if (end_date && newStartDate > end_date) {
                setStartDate(end_date);
                setEndDate(newStartDate);
            } else {
                setStartDate(newStartDate);
            }
        }
    };

    const selectEndDate = (newEndDate: Date) => {
        if (newEndDate) {
            if (start_date && newEndDate < start_date) {
                setStartDate(newEndDate);
                setEndDate(start_date);
            } else {
                setEndDate(newEndDate);
            }
        }
    };

    const applyFilter = () => {
        updateQuery({
            [start_date_key]: start_date?.toISOString(),
            [end_date_key]: end_date?.toISOString(),
        });
    };
    const content = (
        <>
            <Flex alignItems="flex-end">
                <DatePicker
                    // @ts-ignore
                    date={start_date}
                    showTime={true}
                    clearable={true}
                    label={t("settings.webhookLog.createdFilter.startDate")}
                    onChange={selectStartDate}
                    data-testid="webhook-log-filter-date-picker-start"
                />
            </Flex>
            <Flex alignItems="flex-end" mt={1}>
                <DatePicker
                    // @ts-ignore
                    date={end_date}
                    showTime={true}
                    clearable={true}
                    label={t("settings.webhookLog.createdFilter.endDate")}
                    onChange={selectEndDate}
                    data-testid="webhook-log-filter-date-picker-end"
                />
            </Flex>
            <Flex alignItems="flex-end" flexDirection="column" mr={3} mb={1}>
                <Button
                    type="submit"
                    justifySelf="flex-end"
                    disabled={false}
                    data-testid="apply-webhook-log--filter-period-button"
                    mt={2}
                    onClick={applyFilter}
                >
                    {t("settings.webhookLog.createdFilter.apply")}
                </Button>
            </Flex>{" "}
        </>
    );

    return selectionOnly ? (
        content
    ) : (
        <Dropdown
            leftIcon="calendar"
            label={t("settings.webhookLog.createdFilter")}
            isOpen={isOpen}
            onOpen={openDropdown}
            onClose={close}
            data-testid={"webhook-log-created-filter"}
        >
            {content}
        </Dropdown>
    );
}
