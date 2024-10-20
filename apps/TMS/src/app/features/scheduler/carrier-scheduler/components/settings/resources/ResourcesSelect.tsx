import {TagSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, IconNames, ModeDescription, ModeTypeSelector, Text} from "@dashdoc/web-ui";
import {Item} from "@dashdoc/web-ui/src/choice/types";
import React, {useMemo} from "react";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {ResourcesManualSelection} from "app/features/scheduler/carrier-scheduler/components/settings/resources/ResourcesManualSelection";
import {SortOrderSelect} from "app/features/scheduler/carrier-scheduler/components/settings/resources/SortOrderSelect";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

export type SortResource = {order: "" | "-"; criteria: "license_plate" | "fleet_number" | "user"};
type ResourcesSelectProps = {
    resourceType: TripSchedulerView | CharteringView | DedicatedResourcesView;
    resourcesUids: string[];
    setResourcesUids: (resourcesUids: string[]) => void;
    resourcesTags: string[];
    setResourcesTags: (resourcesTags: string[]) => void;
    sort: string | undefined;
    setSort: (value: string | undefined) => void;
    extendedView: boolean;
    currentSelectionMode: "all" | "selection_by_tag" | "selection_by_id";
    setCurrentSelectionMode: (mode: "all" | "selection_by_tag" | "selection_by_id") => void;
    selectedResources: Item[];
    setSelectedResources: (resources: Item[]) => void;
};

export function ResourcesSelect({
    resourceType,
    setResourcesUids,
    resourcesTags,
    setResourcesTags,
    sort,
    setSort,
    extendedView,
    currentSelectionMode,
    setCurrentSelectionMode,
    selectedResources,
    setSelectedResources,
}: ResourcesSelectProps) {
    const labelsAndIcon = useMemo(
        () => ({
            trucker: {
                all: t("scheduler.settings.trucker.all"),
                customSelection: t("scheduler.settings.views.manualSelection"),
                icon: "trucker",
                showSelectByTagMode: true,
            },
            vehicle: {
                all: t("scheduler.settings.vehicle.all"),
                customSelection: t("scheduler.settings.views.manualSelection"),
                icon: "truck",
                showSelectByTagMode: true,
            },
            trailer: {
                all: t("scheduler.settings.trailer.all"),
                customSelection: t("scheduler.settings.views.manualSelection"),
                icon: "trailer",
                showSelectByTagMode: true,
            },
            chartering: {
                all: t("scheduler.settings.carrier.all"),
                customSelection: t("scheduler.settings.views.manualSelection"),
                icon: "carrier",
                showSelectByTagMode: false,
            },
            dedicated_resources: {
                all: t("common.dedicatedResources"),
                customSelection: t("scheduler.settings.views.manualSelection"),
                icon: "acknowledged",
                showSelectByTagMode: false,
            },
        }),
        []
    );
    const resourceSelectionModes: ModeDescription<
        "all" | "selection_by_tag" | "selection_by_id"
    >[] = useMemo(
        () => [
            {
                value: "all",
                label: labelsAndIcon[resourceType].all,
                icon: labelsAndIcon[resourceType].icon as IconNames,
                calloutLabel: t("scheduler.settings.views.allResourcesDescription"),
            },
            {
                value: "selection_by_tag",
                label: t("scheduler.settings.selectionByTags"),
                icon: "tag",
                display: labelsAndIcon[resourceType].showSelectByTagMode,
                calloutLabel: t("scheduler.settings.views.selectionByTagsDescription"),
            },
            {
                value: "selection_by_id",
                label: labelsAndIcon[resourceType].customSelection,
                icon: "select",
                calloutLabel: t("scheduler.settings.views.selectionByIdDescription"),
            },
        ],
        [labelsAndIcon, resourceType]
    );

    return (
        <>
            <ModeTypeSelector<"all" | "selection_by_tag" | "selection_by_id">
                modeList={resourceSelectionModes}
                currentMode={currentSelectionMode}
                setCurrentMode={(mode) => {
                    setCurrentSelectionMode(mode);
                    if (mode !== "selection_by_tag") {
                        setResourcesTags([]);
                    }
                    if (mode !== "selection_by_id") {
                        setResourcesUids([]);
                    }
                }}
            />
            {resourceType !== "chartering" &&
                resourceType !== "dedicated_resources" &&
                currentSelectionMode !== "selection_by_id" && (
                    <Box width="100%">
                        <Text variant="h2" mt={2} mb={1}>
                            {t("common.sortOrder")}
                        </Text>
                        <SortOrderSelect
                            resourceType={resourceType}
                            sort={sort}
                            setSort={setSort}
                            withLabel={true}
                        />
                    </Box>
                )}
            <Flex>
                {currentSelectionMode === "selection_by_tag" && (
                    <ResourcesSelectByTag
                        resourcesTags={resourcesTags}
                        setResourcesTags={setResourcesTags}
                    />
                )}
                {currentSelectionMode === "selection_by_id" && (
                    <>
                        <ResourcesManualSelection
                            resourceType={resourceType}
                            extendedView={extendedView}
                            selectedResources={selectedResources}
                            setSelectedResources={setSelectedResources}
                            setResourcesUids={setResourcesUids}
                            key={resourceType}
                        />
                    </>
                )}
            </Flex>
        </>
    );
}

type ResourcesSelectByTagProps = {
    resourcesTags: string[];
    setResourcesTags: (resourcesTags: string[]) => void;
};

function ResourcesSelectByTag({resourcesTags, setResourcesTags}: ResourcesSelectByTagProps) {
    return (
        <Box width="100%">
            <Text variant="h2" mt={2} mb={1}>
                {t("scheduler.settings.views.tagsOfRessourcesToDisplay")}
            </Text>
            <TagSelector
                query={{tags__in: resourcesTags}}
                updateQuery={(query: {tags__in: string[]}) => {
                    setResourcesTags(query.tags__in ?? []);
                }}
                hideHeader
            />
        </Box>
    );
}
