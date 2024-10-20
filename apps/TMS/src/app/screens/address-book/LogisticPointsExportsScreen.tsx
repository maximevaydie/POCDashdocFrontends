import {useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, FullHeightMinWidthScreen, Icon, Link, TabTitle} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

import {Exports} from "app/features/export/Exports";
import {LINK_LOGISTIC_POINTS} from "app/features/sidebar/constants";

export function LogisticPointsExportsScreen() {
    const history = useHistory();
    const baseUrl = useBaseUrl();
    return (
        <FullHeightMinWidthScreen p={4}>
            <Flex minHeight="37px" alignItems="center">
                <Link
                    fontWeight={600}
                    onClick={() => history.push(`${baseUrl}${LINK_LOGISTIC_POINTS}`)}
                    display="flex"
                    alignItems="center"
                >
                    <Icon name={"arrowLeftFull"} pr={2} />
                    <Box mb="2px">{t("logisticPoint.backToLogisticPoints")}</Box>
                </Link>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
                <TabTitle title={t("common.exports")} />
            </Flex>
            <Exports dataTypes={["address_book"]} mt={3} overflow="hidden" />
        </FullHeightMinWidthScreen>
    );
}
