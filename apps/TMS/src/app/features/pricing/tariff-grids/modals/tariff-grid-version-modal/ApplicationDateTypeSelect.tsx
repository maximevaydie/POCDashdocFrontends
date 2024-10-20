import {SelectOption, t} from "@dashdoc/web-core";
import {Select, SelectProps, theme} from "@dashdoc/web-ui";
import React from "react";

import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {ApplicationDateType} from "app/features/pricing/tariff-grids/types";

type ApplicationDateTypeSelectProps = {
    tariffGridApplicationDateType: ApplicationDateType | null;
    onChange: (applicationDateTypeOption: SelectOption<ApplicationDateType>) => unknown;
} & Pick<SelectProps, "value" | "error">;

export const ApplicationDateTypeSelect = ({
    tariffGridApplicationDateType,
    value,
    error,
    onChange,
}: ApplicationDateTypeSelectProps) => {
    return (
        <Select
            required
            isClearable={false}
            isDisabled={tariffGridApplicationDateType !== null}
            styles={{
                menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                option: (base, prop) => ({
                    ...base,
                    borderBottom: [
                        t("tariffGridVersion.creationDateOption"),
                        t("tariffGridVersion.askedLoadingDateOption"),
                    ].includes(prop.label)
                        ? "1px solid #c4cdd5"
                        : "0",
                }),
            }}
            label={t("tariffGridVersion.dateTypeToUse")}
            options={tariffGridService.getApplicationDateTypeOptions()}
            value={value}
            error={error}
            onChange={(value: SelectOption<ApplicationDateType>) => onChange(value)}
            data-testid="tariff-grid-version-modal-application-date-type-input"
        />
    );
};
