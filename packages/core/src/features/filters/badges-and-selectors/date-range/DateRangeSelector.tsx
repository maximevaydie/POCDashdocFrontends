import {t} from "@dashdoc/web-core";
import React, {useState} from "react";

import {FilteringSelectorHeader} from "../generic/FilteringSelectorHeader";

import {PeriodFilterQueryKeys, FiltersPeriod} from "./FiltersPeriod";

import type {PeriodFilterProps} from "../../../../types/types";

type Props<TQuery> = {
    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    prefix?: string;
    periodFilterProps?: PeriodFilterProps;
    showCreatedDateType?: Boolean;
    initialDataType?: string;
    displayHeader?: boolean;
    updateQueryOnDataTypeChange?: boolean;
};

export function DateRangeSelector<TQuery>({
    query,
    updateQuery,
    prefix = "",
    periodFilterProps = {},
    showCreatedDateType,
    initialDataType,
    displayHeader = true,
    updateQueryOnDataTypeChange = false,
}: Props<TQuery>) {
    initialDataType = initialDataType ?? (showCreatedDateType ? "loading" : "all");
    const [selectedDataType, setSelectedDataType] = useState<string>(
        `${prefix}${initialDataType === "all" ? "" : initialDataType + "_"}`
    );

    const dataType = {
        label: t("filter.siteType"),
        options: [
            {
                label: t("common.pickup"),
                headerLabel: t("filter.loadingPeriod"),
                id: `${prefix}loading_`,
            },
            {
                label: t("common.delivery"),
                headerLabel: t("filter.unloadingPeriod"),
                id: `${prefix}unloading_`,
            },
            showCreatedDateType
                ? {
                      label: t("common.creationDate"),
                      headerLabel: t("common.creationDate"),
                      id: `created_`,
                  }
                : {label: t("common.both"), headerLabel: t("filter.sitePeriod"), id: `${prefix}`},
        ],
        value: selectedDataType,
        onChange: handleChangeDateType,
    };
    const condition = {
        options: [{label: t("filter.containInPeriod"), id: "in"}],
        value: "in",
        onChange: () => {},
    };

    const queryKeys = getQueryKeysFor(selectedDataType);

    return (
        <>
            {displayHeader && (
                <FilteringSelectorHeader dataType={dataType} condition={condition} />
            )}
            <FiltersPeriod<TQuery>
                currentQuery={query}
                updateQuery={updateQuery}
                queryKeys={queryKeys}
                selectionOnly
                periodFilterProps={periodFilterProps}
            />
        </>
    );

    function handleChangeDateType(newDataType: string) {
        setSelectedDataType((prevDataType) => {
            if (updateQueryOnDataTypeChange) {
                updateQueryDataType(prevDataType, newDataType);
            }
            return newDataType;
        });
    }

    function updateQueryDataType(prevDataType: string, newDataType: string) {
        const prevQueryKeys = getQueryKeysFor(prevDataType);
        const newQueryKeys = getQueryKeysFor(newDataType);

        const startValue = query[prevQueryKeys.start_date_key];
        const endValue = query[prevQueryKeys.end_date_key];
        const periodValue = query[prevQueryKeys.period_key];

        const newQuery: Partial<TQuery> = {};
        if (startValue) {
            newQuery[newQueryKeys.start_date_key] = startValue;
        }
        if (endValue) {
            newQuery[newQueryKeys.end_date_key] = endValue;
        }
        if (periodValue) {
            newQuery[newQueryKeys.period_key] = periodValue;
        }
        updateQuery(newQuery);
    }

    function getQueryKeysFor(dataType: string): PeriodFilterQueryKeys<TQuery> {
        return {
            start_date_key: `${dataType}start_date` as keyof TQuery,
            end_date_key: `${dataType}end_date` as keyof TQuery,
            period_key: `${dataType}period` as keyof TQuery,
        };
    }
}
