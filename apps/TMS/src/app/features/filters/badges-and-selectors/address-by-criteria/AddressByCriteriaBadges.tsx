import {FilteringBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {TranslationKeys, t} from "@dashdoc/web-core";
import isNil from "lodash.isnil";
import omitBy from "lodash.omitby";
import React, {FunctionComponent, useMemo} from "react";

import {AddressesCriteriaQuery} from "./addressByCriteriaFilter.types";

type AddressBadgeProps = {
    query: AddressesCriteriaQuery;
    updateQuery: (query: Partial<AddressesCriteriaQuery>) => void;
    type: "origin" | "destination" | "all";
};

export const AddressByCriteriaBadge: FunctionComponent<AddressBadgeProps> = ({
    query,
    updateQuery,
    type,
}) => {
    const prefixKey = useMemo(() => {
        switch (type) {
            case "origin":
                return "origin_";
            case "destination":
                return "destination_";
            default:
                return "";
        }
    }, [type]);

    const queryKeys = useMemo(() => {
        return [
            `${prefixKey}address_postcode__in`,
            `${prefixKey}address_country__in`,
            `${prefixKey}address_text`,
        ];
    }, [prefixKey]);

    const resetQuery = useMemo(() => {
        return {
            [`${prefixKey}address_postcode__in`]: "",
            [`${prefixKey}address_country__in`]: "",
            [`${prefixKey}address_text`]: "",
        };
    }, [prefixKey]);

    const hasValue = queryKeys.some(
        (queryKey) => !!query[queryKey as keyof AddressesCriteriaQuery]
    );

    return hasValue ? (
        <FilteringBadge
            data-testid={`badge-postcodes-${type}`}
            label={getLabel()}
            onDelete={() => updateQuery(resetQuery)}
        />
    ) : null;

    function getLabel() {
        let defaultLabel: string = t("common.sites");
        switch (type) {
            case "origin":
                defaultLabel = t("common.originSites");
                break;
            case "destination":
                defaultLabel = t("common.destinationSites");
                break;
        }
        const addressQuery = omitBy(
            {
                address: query?.[`${prefixKey}address_text`] || null,
                postcode: query?.[`${prefixKey}address_postcode__in`] || null,
                country: query?.[`${prefixKey}address_country__in`] || null,
            },
            isNil
        );
        return getAllSitesLabelBySiteQueries(addressQuery, defaultLabel);
    }
};

const getAllSitesLabelBySiteQueries = (
    siteQueries: Record<string, string>,
    defaultLabel: string
) => {
    const label = Object.keys(siteQueries)
        .reduce((filters: string[], query): string[] => {
            const keyword = `common.${query}` as TranslationKeys;
            filters.push(`${t(keyword)} : ${siteQueries[query]}`);
            return filters;
        }, [])
        .join(", ");

    return label ? `${defaultLabel} (${label})` : defaultLabel;
};
