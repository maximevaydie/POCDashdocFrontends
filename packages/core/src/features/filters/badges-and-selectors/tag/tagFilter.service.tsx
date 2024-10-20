import {t} from "@dashdoc/web-core";
import React from "react";

import {TagBadge} from "./TagBadge";
import {TagSelector} from "./TagSelector";

import type {TagsQuery} from "./tagFilter.types";
import type {FilterData} from "../../filtering-bar";

export function getTagFilter(
    activeQueryKey: keyof TagsQuery = "tags__in",
    sortAndFilters = {}
): FilterData<TagsQuery> {
    return {
        key: "tags",
        testId: "tags",
        selector: {
            label: t("common.tags"),
            icon: "tags",
            getFilterSelector: (query, updateQuery) => (
                <TagSelector
                    query={query}
                    updateQuery={updateQuery}
                    activeQueryKey={activeQueryKey}
                    sortAndFilters={sortAndFilters}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query[activeQueryKey]?.length ?? 0,
                badge: (
                    <TagBadge
                        key="tag"
                        query={query}
                        queryKey={activeQueryKey}
                        updateQuery={updateQuery}
                    />
                ),
            },
        ],
    };
}
