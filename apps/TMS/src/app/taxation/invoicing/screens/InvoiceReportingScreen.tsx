import {HasFeatureFlag, HasNotFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Flex,
    FullHeightMinWidthScreen,
    IFrame,
    LoadingWheel,
    TabTitle,
    Text,
} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {getTabTranslations} from "app/common/tabs";
import useSimpleFetch from "app/hooks/useSimpleFetch";
import {LuzmoDashboards, LuzmoWrapper} from "app/taxation/invoicing/screens/LuzmoWrapper";
import {SidebarTabNames} from "app/types/constants";

export function InvoiceReportingScreen() {
    const url = `/invoices/reporting/`;
    const {data, hasError} = useSimpleFetch(url, [], "web");
    const [isIframeLoading, setIsIframeLoading] = useState(true);

    return (
        <FullHeightMinWidthScreen p={4}>
            <HasFeatureFlag flagName="luzmoEnabled">
                <LuzmoWrapper
                    dashboardSlug={LuzmoDashboards.INVOICES}
                    title={getTabTranslations(SidebarTabNames.REVENUE_REPORTS)}
                />
            </HasFeatureFlag>
            <HasNotFeatureFlag flagName="luzmoEnabled">
                <Flex justifyContent="space-between" mb={4} mr={3}>
                    <TabTitle title={getTabTranslations(SidebarTabNames.INVOICES_REPORTS)} />
                </Flex>
                {!hasError && isIframeLoading && <LoadingWheel />}
                {hasError ? (
                    <Text>{t("common.error")}</Text>
                ) : (
                    <IFrame
                        src={data.iframe_url + "#view=FitH"}
                        height={window.innerHeight}
                        onLoad={() => setIsIframeLoading(false)}
                        download={false}
                    />
                )}
            </HasNotFeatureFlag>
        </FullHeightMinWidthScreen>
    );
}
