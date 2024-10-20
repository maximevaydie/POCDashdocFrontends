import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {FilteringListBadge} from "../generic/FilteringBadge";

import type {TagsQuery} from "./tagFilter.types";

type TagBadgeProps = {
    query: TagsQuery;
    queryKey: keyof TagsQuery;
    updateQuery: (query: TagsQuery) => void;
};

export const TagBadge: FunctionComponent<TagBadgeProps> = ({query, queryKey, updateQuery}) => {
    return (
        <FilteringListBadge
            queryKey={queryKey}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-tag"
        />
    );
    function getLabel(count: number) {
        let label: ReactNode = `1 ${t("common.tag").toLowerCase()}`;

        // if (count === 1 && tags) {
        //     label = tags[query.tags__in[0]]?.name;
        // }
        if (count > 1) {
            label = `${count} ${t("common.tags", {
                smart_count: count,
            })}`;
        }
        return label;
    }
};
