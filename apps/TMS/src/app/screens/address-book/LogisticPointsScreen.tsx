import {guid} from "@dashdoc/core";
import {Arrayify, useCurrentQueryAndView} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Flex,
    FullHeightMinWidthScreen,
    ScrollableTableFixedHeader,
    TabTitle,
} from "@dashdoc/web-ui";
import {parseQueryString} from "dashdoc-utils";
import React, {useState} from "react";

import {getTabTranslations} from "app/common/tabs";
import {LogisticPointsActions} from "app/features/address-book/logistic-points/actions/LogisticPointsActions";
import {RESET_LOGISTIC_POINTS_FILTER} from "app/features/address-book/logistic-points/constants";
import {LogisticPointList} from "app/features/address-book/logistic-points/LogisticPointList";
import {LogisticPointsFilteringBar} from "app/features/address-book/logistic-points/LogisticPointsFilteringBar";
import {
    LOGISTIC_POINTS_VIEW_CATEGORY,
    LogisticPointsFilterSchema,
    type LogisticPointsFilter,
} from "app/features/address-book/logistic-points/types";
import {useSelector} from "app/redux/hooks";
import {getLogisticPointsForCurrentQuery} from "app/redux/selectors/searches";
import {SidebarTabNames} from "app/types/constants";

const parseQuery = (queryString: string): LogisticPointsFilter => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: false,
        arrayFormat: "comma",
    });
    const cleanedParams = {
        ...RESET_LOGISTIC_POINTS_FILTER,
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
        creation_method__in: Arrayify(parsedParams.creation_method__in || []),
    };
    const query = LogisticPointsFilterSchema.parse(cleanedParams);
    return query;
};

export function LogisticPointsScreen() {
    const {currentQuery, updateQuery, selectedViewPk, updateSelectedViewPk} =
        useCurrentQueryAndView<LogisticPointsFilter>({
            parseQueryString: parseQuery,
            queryValidation: LogisticPointsFilterSchema.parse,
            defaultQuery: RESET_LOGISTIC_POINTS_FILTER,
            viewCategory: LOGISTIC_POINTS_VIEW_CATEGORY,
        });
    const [key, setKey] = useState("_");

    const {totalCount} = useSelector(getLogisticPointsForCurrentQuery);

    return (
        <FullHeightMinWidthScreen pt={1}>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" alignItems="center" mb={3}>
                    <TabTitle
                        title={getTabTranslations(SidebarTabNames.LOGISTIC_POINTS)}
                        detailText={`- ${t("logisticPoint.xLogisticPoints", {
                            smart_count: totalCount ?? 0,
                        })}`}
                    />
                    <LogisticPointsActions onRefresh={handleRefresh} />
                </Flex>
                <LogisticPointsFilteringBar
                    currentQuery={currentQuery}
                    updateQuery={updateQuery}
                    selectedViewPk={selectedViewPk}
                    updateSelectedView={updateSelectedViewPk}
                />
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" p={3} flexDirection="column" flexGrow={1}>
                <LogisticPointList
                    currentQuery={currentQuery}
                    updateQuery={updateQuery}
                    onRefresh={handleRefresh}
                    key={key}
                />
            </Flex>
        </FullHeightMinWidthScreen>
    );

    function handleRefresh() {
        setKey(guid());
    }
}
