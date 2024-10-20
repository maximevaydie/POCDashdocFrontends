import {ReportCategory, ReportEntity} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {Select, SelectOption} from "@dashdoc/web-ui";
import React from "react";

type ReportEntitySelectProps = {
    selectedEntity: ReportEntity | null;
    reportCategory: ReportCategory;
    error?: string;
    disabled: boolean;
    onChange: (entity: ReportEntity) => void;
};

export default function ReportMetricSelect({
    selectedEntity,
    reportCategory,
    error,
    disabled,
    onChange,
}: ReportEntitySelectProps) {
    const entityOptions: SelectOption<ReportEntity>[] =
        reportCategory === "transports"
            ? [
                  {
                      label: t("reports.creation.entitySelect.options.trucker"),
                      value: "trucker",
                  },
                  {
                      label: t("reports.creation.entitySelect.options.vehicle"),
                      value: "vehicle",
                  },
                  {
                      label: t("reports.creation.entitySelect.options.trailer"),
                      value: "trailer",
                  },
                  {
                      label: t("reports.creation.entitySelect.options.transportTag"),
                      value: "transport_tag",
                  },
                  {
                      label: t("reports.creation.entitySelect.options.shipper"),
                      value: "shipper",
                  },
              ]
            : [
                  {
                      label: t("reports.creation.entitySelect.options.carrier"),
                      value: "carrier",
                  },
              ];

    return (
        <Select
            label={t("reports.creation.entitySelect.placeholder")}
            error={error}
            isSearchable={true}
            options={entityOptions}
            data-testid="report-entity-select"
            value={entityOptions.find((option) => option.value === selectedEntity) ?? null}
            onChange={(option: SelectOption<ReportEntity>) => {
                // @ts-ignore
                onChange(option?.value);
            }}
            isDisabled={disabled}
        />
    );
}
