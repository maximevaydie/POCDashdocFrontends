import {IconNames} from "@dashdoc/web-ui";
import React from "react";

import {FilteringStaticListBadge} from "./FilteringStaticListBadge";
import {FilteringStaticListSelector} from "./FilteringStaticListSelector";

import type {FilterData} from "../../../filtering-bar";

export function getStaticListFilter<TQuery extends Record<string, string[]>>({
    key,
    label,
    icon,
    items,
    queryKey,
    ignore,
    testId,
}: {
    key: string;
    label: string;
    icon: IconNames;
    items: Array<{label: string; value: string}>;
    queryKey: keyof TQuery;
    ignore?: boolean;
    testId?: string;
}): FilterData<TQuery> {
    return {
        key,
        testId,
        selector: ignore
            ? null
            : {
                  label,
                  icon,
                  getFilterSelector: (query, updateQuery) => (
                      <FilteringStaticListSelector<TQuery>
                          query={query}
                          updateQuery={updateQuery}
                          queryKey={queryKey}
                          items={items}
                          label={label}
                      />
                  ),
              },
        getBadges: (query, updateQuery) => [
            {
                count: query[queryKey]?.length ?? 0,
                badge: (
                    <FilteringStaticListBadge<TQuery>
                        key={key}
                        query={query}
                        updateQuery={updateQuery}
                        queryKey={queryKey}
                        items={items}
                        label={label}
                        testId={`badge-${testId}`}
                        ignore={ignore}
                    />
                ),
            },
        ],
    };
}
