import {t} from "@dashdoc/web-core";
import React from "react";

import {FilteringBooleanSelector} from "../FilteringBooleanSelector";
import {FilteringHeader} from "../FilteringSelectorHeader";

type Props<TQuery extends Record<string, boolean | undefined>> = {
    query: TQuery;
    updateQuery: (query: TQuery) => void;
    queryKey: keyof TQuery;
    label: string;
    optionsLabels: {on: string; off: string};
    conditionLabel?: string;
};

export function FilteringBooleanChoiceSelector<
    TQuery extends Record<string, boolean | undefined>,
>({query, updateQuery, queryKey, label, optionsLabels, conditionLabel}: Props<TQuery>) {
    const value = query[queryKey];

    return (
        <>
            <FilteringHeader
                dataTypeLabel={label}
                conditionLabel={conditionLabel ?? t("filter.in")}
            />
            <FilteringBooleanSelector
                labels={optionsLabels}
                value={value}
                onChange={(newValue) => updateQuery({[queryKey]: newValue} as TQuery)}
            />
        </>
    );
}
