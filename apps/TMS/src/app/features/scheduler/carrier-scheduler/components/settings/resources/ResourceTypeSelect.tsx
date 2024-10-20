import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Select} from "@dashdoc/web-ui";
import React from "react";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import useIsCarrier from "app/hooks/useIsCarrier";

type ResourceTypeSelectProps = {
    value: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined;
    onChange: (
        value: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined
    ) => void;
};
type ResourceSelectOption = {
    value: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined;
    label: string;
    isDisabled: boolean;
};
export function ResourceTypeSelect({value, onChange}: ResourceTypeSelectProps) {
    const isCarrier = useIsCarrier();
    const hasDedicatedResourcesEnabled = useFeatureFlag("dedicatedResources");
    const resourceTypeOptions: ResourceSelectOption[] = [
        {value: "trucker", label: t("common.drivers"), isDisabled: !isCarrier},
        {value: "vehicle", label: t("common.vehicles"), isDisabled: !isCarrier},
        {value: "trailer", label: t("common.trailers"), isDisabled: !isCarrier},
        {value: "chartering", label: t("chartering.charter"), isDisabled: false},
    ];
    if (hasDedicatedResourcesEnabled) {
        resourceTypeOptions.push({
            value: "dedicated_resources",
            label: t("common.dedicatedResources"),
            isDisabled: false,
        });
    }
    return (
        <Select<ResourceSelectOption>
            label={t("scheduler.settings.resourceTypeSelect")}
            options={resourceTypeOptions}
            value={resourceTypeOptions.find((option) => option.value === value)}
            onChange={(option: ResourceSelectOption) => {
                onChange(option?.value ?? undefined);
            }}
            isClearable={false}
            data-testid="resource-type-select"
        />
    );
}
