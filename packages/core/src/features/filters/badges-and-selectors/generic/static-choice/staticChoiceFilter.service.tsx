import {IconNames} from "@dashdoc/web-ui";
import React from "react";

import {FilteringStaticChoiceBadge} from "./FilteringStaticChoiceBadge";
import {FilteringStaticChoiceSelector} from "./FilteringStaticChoiceSelector";

import type {FilterData} from "../../../filtering-bar";

export function getStaticChoiceFilter<TQuery extends Record<string, string | undefined>>({
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
                      <FilteringStaticChoiceSelector<TQuery>
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
                count: query[queryKey] ? 1 : 0,
                badge: (
                    <FilteringStaticChoiceBadge<TQuery>
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
