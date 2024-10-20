import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {t} from "@dashdoc/web-core";
import {Box, Flex, SearchableItemsSelector, Text} from "@dashdoc/web-ui";
import {Item} from "@dashdoc/web-ui/src/choice/types";
import uniqBy from "lodash.uniqby";
import React, {useState} from "react";

import {FleetTagsSelect} from "app/features/scheduler/carrier-scheduler/components/settings/resources/FleetTagsSelect";

import {
    fetchResourcesApiVersion,
    fetchResourcesUrl,
    getResourceId,
    getResourceLabel,
} from "./resources.service";
import {ResourceType, SchedulerResource} from "./resources.types";

type ResourceSelectByIdProps = {
    resourceType: ResourceType;
    setResourcesUids: (resourcesUids: string[]) => void;
    extendedView: boolean;
    selectedResources: Item[];
    setSelectedResources: (selectedResources: Item[]) => void;
};

export function ResourcesManualSelection({
    resourceType,
    setResourcesUids,
    extendedView,
    selectedResources,
    setSelectedResources,
}: ResourceSelectByIdProps) {
    const [tagsUids, setTagsUids] = useState<string[]>([]);

    const [searchText, setSearchText] = useState("");
    const searchQuery = {text: searchText};

    const {items, hasNext, loadNext, loadAll, isLoading} = usePaginatedFetch<SchedulerResource>(
        fetchResourcesUrl(resourceType),
        {
            ...searchQuery,
            tags__in: tagsUids,
            extended_view: extendedView,
            ordering: getSelectorOrdering(resourceType),
            hide_disabled: true,
        },
        {
            apiVersion: fetchResourcesApiVersion(resourceType),
        }
    );

    // Paginated items may not contain already selected resources coming from view settings and fetched separately.
    // We need to merge them to have a complete list of resources.
    const normalizedItems = uniqBy(
        [
            ...items.map((item) => ({
                id: getResourceId(item, resourceType),
                label: getResourceLabel(item, resourceType),
            })),
            ...selectedResources,
        ],
        "id"
    );

    return (
        <Flex flex={1} flexDirection="column">
            <Flex justifyContent="space-between" alignItems="center" zIndex="level1" padding={2}>
                <Text variant="h2" mt={2} mb={1}>
                    {t("scheduler.settings.views.ressourcesToDisplay")}
                </Text>
                {resourceType !== "chartering" && (
                    <FleetTagsSelect tagsUids={tagsUids} setTagsUids={setTagsUids} />
                )}
            </Flex>
            <Box>
                <SearchableItemsSelector<SchedulerResource>
                    items={items}
                    getItemId={(item) => getResourceId(item, resourceType)}
                    getItemLabel={(item) => getResourceLabel(item, resourceType)}
                    searchText={searchText}
                    onSearchTextChange={setSearchText}
                    values={selectedResources ? selectedResources.map((r) => r.id) : []}
                    onChange={(ids) => {
                        setSelectedResources(
                            ids
                                .map((id) => normalizedItems.find((item) => item.id === id))
                                .filter(Boolean) as Item[]
                        );
                        setResourcesUids(ids);
                    }}
                    enableSelectAll
                    hasMore={hasNext}
                    loadAll={loadAll}
                    loadNext={loadNext}
                    isLoading={isLoading}
                    displayMode="addButton"
                    listContainerStyle={{maxHeight: "300px", overflow: "scroll"}}
                />
            </Box>
        </Flex>
    );

    function getSelectorOrdering(resourceType: ResourceType) {
        switch (resourceType) {
            case "trucker":
                return "user__last_name,user__first_name,pk";
            case "vehicle":
            case "trailer":
                return "license_plate";
            case "chartering":
            case "dedicated_resources":
                return undefined;
        }
    }
}
