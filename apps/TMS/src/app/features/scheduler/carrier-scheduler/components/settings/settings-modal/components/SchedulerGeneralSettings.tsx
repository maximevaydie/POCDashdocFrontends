import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, TextInput} from "@dashdoc/web-ui";
import {Item} from "@dashdoc/web-ui/src/choice/types";
import {FormikErrors} from "formik";
import React, {useEffect, useState} from "react";

import {ActionableExtendedViewContext} from "app/common/ActionableExtendedViewContext";
import {ExtendedViewSwitch} from "app/features/scheduler/carrier-scheduler/components/settings/resources/ExtendedViewSwitch";
import {
    fetchResourcesApiVersion,
    fetchResourcesIdsParams,
    fetchResourcesUrl,
    getResourceId,
    getResourceLabel,
    getResourceOrdering,
} from "app/features/scheduler/carrier-scheduler/components/settings/resources/resources.service";
import {
    ResourceType,
    SchedulerResource,
} from "app/features/scheduler/carrier-scheduler/components/settings/resources/resources.types";
import {ResourcesReorder} from "app/features/scheduler/carrier-scheduler/components/settings/resources/ResourcesReorder";
import {ResourcesSelect} from "app/features/scheduler/carrier-scheduler/components/settings/resources/ResourcesSelect";
import {ResourceTypeSelect} from "app/features/scheduler/carrier-scheduler/components/settings/resources/ResourceTypeSelect";

type SchedulerGeneralSettings = {
    resourceType: ResourceType;
    resourcesUids: string[];
    resourcesCustomIdOrder: string[];
    resourcesTags: string[];
    sort: string | undefined;
    extendedView: boolean;
    label: string;
};
type SchedulerGeneralSettingsProps = {
    values: SchedulerGeneralSettings;
    setFieldValue: (
        field: keyof SchedulerGeneralSettings,
        value: SchedulerGeneralSettings[keyof SchedulerGeneralSettings]
    ) => void;
    errors: FormikErrors<SchedulerGeneralSettings> | undefined;
};
export function SchedulerGeneralSettings({
    values,
    setFieldValue,
    errors,
}: SchedulerGeneralSettingsProps) {
    const [currentSelectionMode, setCurrentSelectionMode] = useState<
        "all" | "selection_by_tag" | "selection_by_id"
    >(
        values.resourcesUids.length > 0
            ? "selection_by_id"
            : values.resourcesTags.length > 0
              ? "selection_by_tag"
              : "all"
    );

    const [initialResourcesIds, setInitialResourcesIds] = useState(values.resourcesUids);
    const [orderedResources, setOrderedResources] = useState<Item[]>([]);

    const {
        items: initialResources,
        loadAll,
        isLoading,
        hasNext,
    } = usePaginatedFetch<SchedulerResource>(
        fetchResourcesUrl(values.resourceType),
        {
            // This should only fetch the resources that are initially selected.
            // Don't use values.resourcesUids directly to not a trigger a new fetch when the user select/unselect a resource
            ...fetchResourcesIdsParams(values.resourceType, initialResourcesIds),
            ordering: getResourceOrdering(values.sort, values.resourceType),
            hide_disabled: true,
            extended_view: values.extendedView,
        },
        {apiVersion: fetchResourcesApiVersion(values.resourceType)}
    );

    useEffect(() => {
        if (currentSelectionMode === "selection_by_id") {
            if (initialResourcesIds.length === 0) {
                return;
            }
            if (hasNext && !isLoading) {
                loadAll();
            } else if (!hasNext && initialResourcesIds.length > 0) {
                // Initially, resources are ordered according to values.sort value
                const resourceItems = initialResources.map((resource) => ({
                    id: getResourceId(resource, values.resourceType),
                    label: getResourceLabel(resource, values.resourceType),
                }));
                // If there is a custom order, apply it
                if (values.resourcesCustomIdOrder.length > 0) {
                    resourceItems.sort((a, b) => {
                        return (
                            values.resourcesCustomIdOrder.indexOf(a.id) -
                            values.resourcesCustomIdOrder.indexOf(b.id)
                        );
                    });
                }
                setOrderedResources(resourceItems);
            }
        }
        // This effect should only run to fetch initially selected resources
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasNext, isLoading, loadAll]);

    return (
        <Flex
            justifyContent="space-between"
            padding={4}
            overflow="hidden"
            height="100%"
            style={{gap: "12px"}}
        >
            <Flex
                flex="0 0 54%"
                flexDirection="column"
                backgroundColor="white"
                border="1px solid"
                borderColor="grey.light"
                borderRadius={1}
                padding={3}
                overflow="scroll"
                id="scheduler-general-settings"
            >
                <Box mt={3}>
                    <TextInput
                        value={values.label ?? ""}
                        onChange={(value: string) => {
                            setFieldValue("label", value);
                        }}
                        required
                        error={errors?.label}
                        label={t("filter.viewLabel")}
                        data-testid="view-label-input"
                    />
                </Box>
                <Text variant="h1" color="grey.dark" mt={3} mb={1}>
                    {t("scheduler.settings.resources")}
                </Text>
                <ResourceTypeSelect
                    value={values.resourceType}
                    onChange={(value) => {
                        setFieldValue("resourceType", value);
                        setFieldValue("resourcesUids", []);
                        setFieldValue("resourcesTags", []);
                        setOrderedResources([]);
                        setInitialResourcesIds([]);
                    }}
                />

                <ActionableExtendedViewContext.Provider
                    value={values.resourceType !== "chartering"}
                >
                    <ExtendedViewSwitch
                        value={values.extendedView}
                        onChange={(value) => setFieldValue("extendedView", value)}
                    />
                </ActionableExtendedViewContext.Provider>

                {values.resourceType && (
                    <>
                        <Text variant="h2" mt={2} mb={1}>
                            {t("scheduler.settings.resourcesDisplay")}
                        </Text>
                        <ResourcesSelect
                            resourceType={values.resourceType}
                            resourcesUids={values.resourcesUids}
                            setResourcesUids={(value) => setFieldValue("resourcesUids", value)}
                            resourcesTags={values.resourcesTags}
                            setResourcesTags={(value) => setFieldValue("resourcesTags", value)}
                            sort={values.sort}
                            setSort={(value) => setFieldValue("sort", value)}
                            extendedView={values.extendedView}
                            currentSelectionMode={currentSelectionMode}
                            setCurrentSelectionMode={setCurrentSelectionMode}
                            selectedResources={orderedResources}
                            setSelectedResources={setOrderedResources}
                        />
                    </>
                )}
            </Flex>
            {currentSelectionMode === "selection_by_id" && (
                <ResourcesReorder
                    resources={orderedResources}
                    isLoading={isLoading}
                    onChange={(resources) => {
                        setOrderedResources(resources);
                        setFieldValue(
                            "resourcesUids",
                            resources.map((resource) => resource.id)
                        );
                    }}
                />
            )}
        </Flex>
    );
}
