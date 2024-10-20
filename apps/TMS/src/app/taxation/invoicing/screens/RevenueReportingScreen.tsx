import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React from "react";

import {getTabTranslations} from "app/common/tabs";
import {LuzmoDashboards, LuzmoWrapper} from "app/taxation/invoicing/screens/LuzmoWrapper";
import {SidebarTabNames} from "app/types/constants";

export function RevenueReportingScreen() {
    return (
        <FullHeightMinWidthScreen p={4}>
            <LuzmoWrapper
                dashboardSlug={LuzmoDashboards.REVENUE}
                title={getTabTranslations(SidebarTabNames.REVENUE_REPORTS)}
            />
        </FullHeightMinWidthScreen>
    );
}
