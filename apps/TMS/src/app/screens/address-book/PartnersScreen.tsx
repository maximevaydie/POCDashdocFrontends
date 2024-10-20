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
import {useSelector} from "react-redux";

import {getTabTranslations} from "app/common/tabs";
import {RESET_PARTNER_SETTINGS} from "app/features/address-book/partners/constants";
import {PartnerList} from "app/features/address-book/partners/PartnerList";
import {PartnersAction} from "app/features/address-book/partners/PartnersAction";
import {PartnersFilteringBar} from "app/features/address-book/partners/PartnersFilteringBar";
import {
    PARTNER_VIEW_CATEGORY,
    PartnersScreenQuery,
    PartnersSettingsSchema,
} from "app/features/address-book/partners/types";
import {getPartnersForCurrentQuery} from "app/redux/selectors/searches";
import {SidebarTabNames} from "app/types/constants";

const parseQuery = (queryString: string): PartnersScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: false,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
    };
};

export function PartnersScreen() {
    const {currentQuery, updateQuery, selectedViewPk, updateSelectedViewPk} =
        useCurrentQueryAndView<PartnersScreenQuery>({
            parseQueryString: parseQuery,
            queryValidation: PartnersSettingsSchema.parse,
            defaultQuery: RESET_PARTNER_SETTINGS,
            viewCategory: PARTNER_VIEW_CATEGORY,
        });
    const [key, setKey] = useState<string>("_");
    const {totalCount} = useSelector(getPartnersForCurrentQuery);

    return (
        <FullHeightMinWidthScreen pt={1}>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" alignItems="center" mb={3}>
                    <TabTitle
                        title={getTabTranslations(SidebarTabNames.PARTNERS)}
                        detailText={`- ${t("partner.xPartners", {
                            smart_count: totalCount ?? 0,
                        })}`}
                    />
                    <PartnersAction onRefresh={handleRefresh} />
                </Flex>
                <PartnersFilteringBar
                    currentQuery={currentQuery}
                    updateQuery={updateQuery}
                    selectedViewPk={selectedViewPk}
                    updateSelectedView={updateSelectedViewPk}
                />
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" p={3} flexDirection="column" flexGrow={1}>
                <PartnerList
                    key={key}
                    currentQuery={currentQuery}
                    updateQuery={updateQuery}
                    onDelete={handleRefresh}
                />
            </Flex>
        </FullHeightMinWidthScreen>
    );

    function handleRefresh() {
        setKey(guid());
    }
}
