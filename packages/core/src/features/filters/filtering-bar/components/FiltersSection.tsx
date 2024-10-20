import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, FloatingMenu, Icon, Text} from "@dashdoc/web-ui";
import sumBy from "lodash.sumby";
import React from "react";

import type {FilterData} from "../filtering.types";

type FiltersSectionProps<TQuery> = {
    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    filters: Array<FilterData<TQuery>>;
    displayLabel: boolean;
};

export function FiltersSection<TQuery>({
    filters,
    query,
    updateQuery,
    displayLabel,
}: FiltersSectionProps<TQuery>) {
    return (
        <FloatingMenu
            icon="filter"
            label={
                <Flex
                    borderRight="1px solid"
                    borderColor="grey.light"
                    alignItems="center"
                    mr={2}
                    height="25px"
                    data-testid="filter-label"
                    color="grey.dark"
                >
                    {displayLabel && t("filter.label")}
                    <Icon name="arrowDown" ml={displayLabel ? 1 : -1} mr={1} scale={0.5} />
                </Flex>
            }
            openNestedMenuOnHover={false}
            dataTestId="open-filters-button"
        >
            {filters.map(({key, selector, getBadges, testId}) => {
                const badgeCount = sumBy(getBadges(query, updateQuery), ({count}) => count);
                return selector ? (
                    <FloatingMenu
                        key={key}
                        label={
                            <Flex justifyContent="space-between" width="100%">
                                <Text ellipsis>{selector.label}</Text>
                                {badgeCount > 0 && (
                                    <Badge paddingX={2} paddingY={1} fontSize={1} ml={2}>
                                        {badgeCount}
                                    </Badge>
                                )}
                            </Flex>
                        }
                        icon={selector.icon}
                        openNestedMenuOnHover={false}
                        dataTestId={`filter-${testId}`}
                    >
                        <Box minWidth="250px" maxWidth="350px" minHeight="200px">
                            {selector.getFilterSelector(query, updateQuery)}
                        </Box>
                    </FloatingMenu>
                ) : null;
            })}
        </FloatingMenu>
    );
}
