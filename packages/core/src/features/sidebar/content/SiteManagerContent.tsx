import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    ClickableFlex,
    Flex,
    Icon,
    LoadingWheel,
    OnDesktop,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {ExportAction} from "features/export/ExportAction";
import {Statistics} from "features/sidebar/content/statistics/Statistics";
import {SiteDate} from "features/site-date/SiteDate";
import React from "react";
import {useHistory, useParams} from "react-router";
import {useSelector} from "redux/hooks";
import {selectSite} from "redux/reducers/flow/site.slice";
import {selectStatistics} from "redux/reducers/flow/statistic.slice";

export function SiteManagerContent() {
    const history = useHistory();
    const {slug} = useParams<{slug: string}>();
    const site = useSelector(selectSite);
    const slotStatistics = useSelector(selectStatistics);
    return (
        <>
            <Box mx={3} py={4}>
                <Box pb={4}>
                    <SiteDate />
                </Box>
                {slotStatistics !== null ? (
                    <Statistics {...slotStatistics} reloading={false} />
                ) : (
                    <LoadingWheel noMargin />
                )}
            </Box>
            <Flex flexGrow={1}></Flex>
            {site !== null && <ExportAction site={site} />}
            <ClickableFlex
                mx={3}
                onClick={() => {
                    history.push(`/flow/site/${slug}/reporting/`);
                }}
                p={4}
                borderTop="1px solid"
                borderColor="grey.light"
            >
                <Icon name="reports" mr={2} />
                <Text>{t("flow.reporting.title")}</Text>
                <TooltipWrapper content={t("common.betaFeatureTooltip")}>
                    <Badge mr={1} marginLeft={3} shape="squared" noWrap>
                        {t("common.beta")}
                    </Badge>
                </TooltipWrapper>
            </ClickableFlex>
            <OnDesktop>
                <ClickableFlex
                    mx={3}
                    onClick={() => {
                        history.push(`/flow/site/${slug}/settings/`);
                    }}
                    p={4}
                    data-testid="flow-settings-link"
                >
                    <Icon name="cog" mr={2} />
                    <Text>{t("flow.settings.title")}</Text>
                </ClickableFlex>
            </OnDesktop>
        </>
    );
}
