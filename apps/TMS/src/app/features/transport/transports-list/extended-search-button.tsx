import {apiService} from "@dashdoc/web-common";
import {useTimezone} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Button, TestableProps} from "@dashdoc/web-ui";
import React, {useEffect, useState} from "react";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";

type ExtendSearchButtonProps = Partial<TestableProps> & {
    currentQuery: any;
    onClick: () => void;
};

export const ExtendedSearchButton = ({
    currentQuery,
    onClick,
    ...testProps
}: ExtendSearchButtonProps) => {
    const timezone = useTimezone();
    const [count, setCount] = useState<number | "-">("-");

    const queryParams = getTransportsQueryParamsFromFiltersQuery(
        {...currentQuery, archived: undefined, business_status: undefined},
        timezone,
        true
    );

    useEffect(() => {
        (async () => {
            const response = await apiService.Transports.request(
                "POST",
                apiService.Transports.getFullPath({subpath: "/list-count/"}),
                {filters: queryService.cleanQuery(queryParams)},
                {apiVersion: "web"}
            );
            setCount(response.count);
        })();
    }, []);

    return (
        <Button onClick={onClick} {...testProps}>
            {t("screens.transports.doExtendedSearch")} ({count})
        </Button>
    );
};
