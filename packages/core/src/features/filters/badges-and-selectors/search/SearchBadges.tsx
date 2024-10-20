import {Box} from "@dashdoc/web-ui";
import React from "react";

import {FilteringBadge} from "../generic/FilteringBadge";

import type {SearchQuery} from "./types";

type SearchBadgesProps<TQuery extends SearchQuery> = {
    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    onBadgeClick: (value: string) => void;
};

export function SearchBadges<TQuery extends SearchQuery>({
    query,
    updateQuery,
    onBadgeClick,
}: SearchBadgesProps<TQuery>) {
    return (
        <>
            {query.text?.map((label: string, i: number) => (
                <Box key={i}>
                    <FilteringBadge
                        data-testid="filters-badges-text"
                        key={label + i}
                        label={label}
                        icon="search"
                        onDelete={() => {
                            updateQuery({
                                text: query.text?.filter((_: any, index: number) => index !== i),
                            } as Partial<TQuery>);
                        }}
                        onClick={() => {
                            onBadgeClick(label);
                        }}
                        variant="neutral"
                    />
                </Box>
            ))}
        </>
    );
}
