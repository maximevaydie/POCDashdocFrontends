import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {AddressesQuery} from "./addressFilter.types";

type AddressBadgeProps = {
    query: AddressesQuery;
    updateQuery: (query: Partial<AddressesQuery>) => void;
    type: "origin" | "destination" | "all";
};

export const AddressBadge: FunctionComponent<AddressBadgeProps> = ({query, updateQuery, type}) => {
    return (
        <FilteringListBadge
            queryKey={getQueryKey()}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid={`badge-addresses-${type}`}
        />
    );
    function getQueryKey() {
        switch (type) {
            case "origin":
                return "origin_address__in";
            case "destination":
                return "destination_address__in";
            default:
                return "address__in";
        }
    }
    function getLabel(count: number) {
        switch (type) {
            case "origin": {
                let label: ReactNode = `1 ${t("common.originSite").toLowerCase()}`;
                if (count > 1) {
                    label = `${count} ${t("common.originSites").toLowerCase()}`;
                }
                return label;
            }
            case "destination": {
                let label: ReactNode = `1 ${t("common.destinationSite").toLowerCase()}`;
                if (count > 1) {
                    label = `${count} ${t("common.destinationSites").toLowerCase()}`;
                }
                return label;
            }
            default: {
                let label: ReactNode = `1 ${t("common.site").toLowerCase()}`;
                if (count > 1) {
                    label = `${count} ${t("common.sites").toLowerCase()}`;
                }
                return label;
            }
        }
    }
};
