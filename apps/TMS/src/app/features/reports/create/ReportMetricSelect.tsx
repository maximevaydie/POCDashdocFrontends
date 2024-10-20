import {ReportCategory, ReportMetric} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {Select, SelectOption} from "@dashdoc/web-ui";
import React from "react";

type ReportMetricSelectProps = {
    selectedMetric: ReportMetric | null;
    reportCategory: ReportCategory;
    error?: string;
    disabled: boolean;

    onChange: (metric: ReportMetric) => void;
};

export default function ReportMetricSelect({
    selectedMetric,
    reportCategory,
    error,
    disabled,
    onChange,
}: ReportMetricSelectProps) {
    const metricOptions: SelectOption<ReportMetric>[] =
        reportCategory === "transports"
            ? [
                  {
                      label: t("reports.creationModal.metricSelect.turnover"),
                      value: "turnover",
                  },
                  {
                      label: t("reports.creationModal.metricSelect.distance"),
                      value: "distance",
                  },
                  {
                      label: t("reports.creationModal.metricSelect.turnoverPerKm"),
                      value: "turnover_per_km",
                  },
              ]
            : [
                  {
                      label: t("reports.creationModal.metricSelect.cost"),
                      value: "cost",
                  },
                  {
                      label: t("reports.creationModal.metricSelect.ordersCount"),
                      value: "count",
                  },
              ];

    return (
        <Select
            label={t("reports.creationModal.metricSelect.placeholder")}
            error={error}
            isSearchable={true}
            options={metricOptions}
            data-testid="report-metric-select"
            value={metricOptions.find((option) => option.value === selectedMetric) ?? null}
            onChange={(option: SelectOption<ReportMetric>) => {
                // @ts-ignore
                onChange(option?.value);
            }}
            isDisabled={disabled}
        />
    );
}
