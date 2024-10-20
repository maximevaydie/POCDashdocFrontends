import {Box, Button, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";

import {SearchQuery} from "features/filters/badges-and-selectors";
import {FilteringListBadge} from "features/filters/badges-and-selectors/generic/FilteringBadge";
import {TagBadge} from "features/filters/badges-and-selectors/tag/TagBadge";
import {TagsQuery} from "features/filters/badges-and-selectors/tag/tagFilter.types";
import {FilterData} from "features/filters/filtering-bar/filtering.types";
import {
    FilteringBar as FilteringBarComponent,
    FilteringBarProps,
} from "features/filters/filtering-bar/FilteringBar";

type Query = TagsQuery & {filters__in?: Array<string>};

export default {
    title: "app/features/filters/FilteringBar",
    component: FilteringBarComponent,
    decorators: [],
    args: {
        filters: [
            {
                key: "tags",
                testId: "tags",
                selector: {
                    label: "tags",
                    icon: "tags",
                    getFilterSelector: (query, updateQuery) => (
                        <>
                            <Text>Tag selector</Text>
                            <Text>{query.tags__in?.join(",")}</Text>
                            <Button
                                onClick={() =>
                                    updateQuery({
                                        ...query,
                                        tags__in: [
                                            ...(query.tags__in ?? []),
                                            `${query.tags__in?.length ?? 0 + 1}`,
                                        ],
                                    })
                                }
                            >
                                Add one tag{" "}
                            </Button>
                        </>
                    ),
                },
                getBadges: (query, updateQuery) => [
                    {
                        count: query["tags__in"]?.length ?? 0,
                        badge: (
                            <TagBadge
                                key="tag"
                                query={query}
                                updateQuery={updateQuery}
                                queryKey="tags__in"
                            />
                        ),
                    },
                ],
            },
            {
                key: "filters__in",
                testId: "filters__in",
                selector: {
                    label: "custom filters",
                    icon: "eye",
                    getFilterSelector: (query, updateQuery) => (
                        <>
                            <Text>custom filters selector</Text>
                            <Text>{query.filters__in?.join(",")}</Text>
                            <Button
                                onClick={() =>
                                    updateQuery({
                                        ...query,
                                        filters__in: [
                                            ...(query.filters__in ?? []),
                                            `${query.filters__in?.length ?? 0 + 1}`,
                                        ],
                                    })
                                }
                            >
                                Add one filter{" "}
                            </Button>
                        </>
                    ),
                },
                getBadges: (query, updateQuery) => [
                    {
                        count: query["filters__in"]?.length ?? 0,
                        badge: (
                            <FilteringListBadge
                                queryKey={"filters__in"}
                                query={query}
                                updateQuery={updateQuery}
                                getLabel={(count) => `${count} custom filters`}
                            />
                        ),
                    },
                ],
            },
        ] as Array<FilterData<Query>>,
        query: {tags__in: ["0", "1"], filters__in: ["A", "B"]},
        updateQuery: (query: Query) => alert(JSON.stringify(query)),
        resetQuery: () => alert("reset query"),
    },
} as Meta;

const Template: Story<FilteringBarProps> = ({filters, query}) => {
    const [currentQuery, updateCurrentQuery] = useState<SearchQuery>(query);

    return (
        <>
            <Text my={2}> Filtering bar with all visible badges</Text>
            <FilteringBarComponent
                filters={filters}
                query={currentQuery}
                updateQuery={updateCurrentQuery}
                resetQuery={{}}
                viewsParams={{
                    selectedViewPk: undefined,
                    setSelectedViewPk: () => {},
                    viewCategory: "pool_of_unplanned",
                    addEnabled: true,
                    deleteEnabled: true,
                }}
                data-testid="story-all-badges-filtering-bar"
            />

            <Text my={2}> Filtering bar with hidden badges</Text>
            <Box width="70%">
                <FilteringBarComponent
                    filters={filters}
                    query={currentQuery}
                    updateQuery={updateCurrentQuery}
                    resetQuery={{}}
                    viewsParams={{
                        selectedViewPk: undefined,
                        setSelectedViewPk: () => {},
                        viewCategory: "pool_of_unplanned",
                        addEnabled: true,
                        deleteEnabled: true,
                    }}
                    data-testid="story-hidden-badges-filtering-bar"
                />
            </Box>
        </>
    );
};

export const FilteringBar = Template.bind({});
FilteringBar.storyName = "FilteringBar";
