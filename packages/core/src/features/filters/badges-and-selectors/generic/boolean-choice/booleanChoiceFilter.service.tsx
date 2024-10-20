import {IconNames} from "@dashdoc/web-ui";
import React from "react";

import {FilteringBooleanChoiceBadge} from "./FilteringBooleanChoiceBadge";
import {FilteringBooleanChoiceSelector} from "./FilteringBooleanChoiceSelector";

import type {FilterData} from "../../../filtering-bar";

export function getBooleanChoiceFilter<TQuery extends Record<string, boolean | undefined>>({
    key,
    label,
    icon,
    conditionLabel,
    optionsLabels,
    badgeOptionsLabels,
    queryKey,
    ignore,
    testId,
}: {
    key: string;
    label: string;
    icon: IconNames;
    conditionLabel?: string;
    optionsLabels: {on: string; off: string};
    badgeOptionsLabels?: {on: string; off: string}; // optionsLabels otherwise
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
                      <FilteringBooleanChoiceSelector<TQuery>
                          query={query}
                          updateQuery={updateQuery}
                          queryKey={queryKey}
                          label={label}
                          conditionLabel={conditionLabel}
                          optionsLabels={optionsLabels}
                      />
                  ),
              },
        getBadges: (query, updateQuery) => [
            {
                count: query[queryKey] !== undefined ? 1 : 0,
                badge: (
                    <FilteringBooleanChoiceBadge
                        query={query}
                        updateQuery={updateQuery}
                        queryKey={queryKey}
                        optionsLabels={badgeOptionsLabels ?? optionsLabels}
                        testId={`filters-badges-${testId}`}
                        ignore={ignore}
                    />
                ),
            },
        ],
    };
}
