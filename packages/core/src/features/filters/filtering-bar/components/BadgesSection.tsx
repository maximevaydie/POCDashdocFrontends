import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    ClickOutside,
    Flex,
    FloatingMenu,
    Icon,
    IconButton,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import sumBy from "lodash.sumby";
import React, {useEffect, useRef} from "react";

import {useIsOverflow} from "../../../../hooks/useIsOverflow";
import {SearchBadges, type SearchQuery} from "../../badges-and-selectors";

import type {FilterData} from "../filtering.types";

type BadgesSectionProps<TQuery> = {
    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    filters: Array<FilterData<TQuery>>;
    resetQuery?: () => void;
    alwaysCollapsed: boolean;
    searchEnabled?: boolean;
    onBadgeClick?: (value: string) => void;
};
export function BadgesSection<TQuery extends SearchQuery>({
    filters,
    query,
    updateQuery,
    resetQuery,
    alwaysCollapsed,
    searchEnabled,
    onBadgeClick,
}: BadgesSectionProps<TQuery>) {
    const [expanded, expand, collapse] = useToggle();
    const badgesWrapperRef = useRef(null);
    const hasHiddenBadges = useIsOverflow(badgesWrapperRef, query);

    const badgesCount = sumBy(
        filters,
        (filter) => filter.getBadges(query, updateQuery).filter(({count}) => count > 0).length
    );
    const searchBadgesCount = query.text ? query.text.length : 0;

    const allBadgesCount = badgesCount + searchBadgesCount;

    useEffect(() => {
        if (allBadgesCount === 0 && expanded) {
            collapse();
        }
    }, [allBadgesCount, expanded, collapse]);

    return (
        <Flex flex={1} alignItems="center" justifyContent="space-between">
            {resetQuery && (
                <TooltipWrapper content={t("filter.reset")} boxProps={{flexShrink: 0}}>
                    <IconButton
                        name="erase"
                        onClick={resetQuery}
                        mr={2}
                        data-testid="reset-filters-button"
                        color="grey.dark"
                    />
                </TooltipWrapper>
            )}
            {expanded && !alwaysCollapsed && <Flex flex={1} />}

            {(!alwaysCollapsed || expanded) && allBadgesCount > 0 ? (
                <Flex style={{flex: alwaysCollapsed ? 0 : 1}}>
                    <ClickOutside
                        onClickOutside={(e) => {
                            if (expanded) {
                                collapse();
                                e.stopPropagation();
                            }
                        }}
                    >
                        {
                            <Flex
                                ref={badgesWrapperRef}
                                style={{
                                    gap: "8px",
                                }}
                                flexDirection={alwaysCollapsed ? "column" : "row"}
                                flexWrap={"wrap"}
                                {...(expanded
                                    ? {
                                          position: "absolute",
                                          top: "100%",
                                          right: 0,
                                          left: 0,
                                          border: "1px solid",
                                          borderTop: "none",
                                          borderColor: "grey.light",
                                          backgroundColor: "grey.white",
                                          boxShadow: "shadows.medium",
                                          zIndex: "level2",
                                          padding: 2,
                                      }
                                    : {overflow: "hidden", flex: 1, height: "32px"})}
                            >
                                {/* Search section */}
                                {searchEnabled && onBadgeClick ? (
                                    <SearchBadges
                                        query={query}
                                        updateQuery={updateQuery}
                                        onBadgeClick={onBadgeClick}
                                    />
                                ) : null}
                                <BadgesList<TQuery>
                                    filters={filters}
                                    query={query}
                                    updateQuery={updateQuery}
                                />
                            </Flex>
                        }
                    </ClickOutside>
                </Flex>
            ) : null}

            {((!alwaysCollapsed && hasHiddenBadges) ||
                (alwaysCollapsed && allBadgesCount > 0) ||
                expanded) && (
                <Badge
                    variant="purple"
                    onClick={expanded ? collapse : expand}
                    noWrap
                    ml={1}
                    paddingX={2}
                    paddingY={1}
                    style={{cursor: "pointer", flex: "none"}}
                >
                    <Flex alignItems="center">
                        <Text color="inherit" variant="caption" ellipsis>
                            {alwaysCollapsed
                                ? t("filter.activeCountShort", {smart_count: allBadgesCount})
                                : t("filter.activeCount", {smart_count: allBadgesCount})}
                        </Text>
                        <Icon
                            scale={0.5}
                            name={expanded ? "arrowUp" : "arrowDown"}
                            color="inherit"
                            ml={1}
                        />
                    </Flex>
                </Badge>
            )}
        </Flex>
    );
}

function BadgesList<TQuery>({
    filters,
    query,
    updateQuery,
}: Omit<BadgesSectionProps<TQuery>, "resetQuery" | "alwaysCollapsed">) {
    return (
        <>
            {filters.map((filter) =>
                filter
                    .getBadges(query, updateQuery)
                    .map(({count, badge, selectorDataType}, index) => {
                        return count > 0 ? (
                            <Box flexShrink={0} key={`${filter.key}-badge-${index}`}>
                                {filter.selector ? (
                                    <FloatingMenu label={badge}>
                                        <Box minWidth="250px" maxWidth="350px" minHeight="200px">
                                            {filter.selector.getFilterSelector(
                                                query,
                                                updateQuery,
                                                selectorDataType
                                            )}
                                        </Box>
                                    </FloatingMenu>
                                ) : (
                                    badge
                                )}
                            </Box>
                        ) : null;
                    })
            )}
        </>
    );
}
