import {arrayToObject} from "@dashdoc/web-common";
import {Company} from "dashdoc-utils";
import React, {useState} from "react";

import {FiltersSite, FiltersSiteProps} from "app/features/filters/FiltersSite";

type Props = {
    currentQuery: {company?: string};
    updateQuery: (value: {company?: string}) => void;
    onNoResultFound: () => void;
};

export function CompanySelector({currentQuery, updateQuery, onNoResultFound}: Props) {
    const [sites, setSites] = useState(
        currentQuery.company as unknown as FiltersSiteProps["sites"]
    );
    return (
        <>
            <FiltersSite
                currentQuery={currentQuery}
                updateQuery={updateQuery}
                sites={sites}
                setLoadedSites={setLoadedSites}
                onNoResultFound={onNoResultFound}
            />
        </>
    );

    function setLoadedSites(values: Company[]) {
        setSites((prev) => ({
            ...prev,
            ...arrayToObject(values),
        }));
    }
}
