import {getConnectedCompanies} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Icon, Link, LoadingWheel, Tabs, Text} from "@dashdoc/web-ui";
import React from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router";
import {loadingFlow} from "redux/reducers/flow";
import {selectSite, selectSiteLoading} from "redux/reducers/flow/site.slice";
import {selectZones} from "redux/reducers/flow/zone.slice";

import {SettingsSite} from "./settings-site/SettingsSite";
import {SettingsZone} from "./settings-zone/SettingsZone";

type Props = {
    slug: string;
};
export function Settings({slug}: Props) {
    const history = useHistory();
    return (
        <Box
            style={{
                display: "grid",
                gridTemplateRows: `min-content min-content 1fr`,
            }}
            p={5}
            height="100%"
        >
            <Box>
                <Link
                    onClick={() => {
                        history.push(`/flow/site/${slug}/`);
                    }}
                    data-testid="settings-back-link"
                >
                    <Icon name="thickArrowLeft" mr={2} />
                    {t("common.back")}
                </Link>
            </Box>
            <Text as="h3" variant="title" display="block" data-testid="screen-title" my={3}>
                {t("flow.settings.title")}
            </Text>
            <Tabs
                tabs={[
                    {
                        label: t("flow.settings.infoTabTitle"),
                        testId: "settings-site-tab",
                        content: <SettingsSiteContainer />,
                    },
                    {
                        label: t("flow.settings.zoneSetupTabTitle"),
                        testId: "settings-zone-setup-tab",
                        content: <SettingsZoneContainer />,
                    },
                ]}
            />
        </Box>
    );
}

function SettingsSiteContainer() {
    const companies = useSelector(getConnectedCompanies);
    const site = useSelector(selectSite);
    const loading = useSelector(selectSiteLoading);
    const company = companies.find((c) => c.pk === site?.company) ?? null;

    if (loading === "pending") {
        return <LoadingWheel />;
    } else if (loading === "failed" || site === null || company === null) {
        return <Text>{t("common.error")}</Text>;
    }

    return <SettingsSite company={company} site={site} />;
}

function SettingsZoneContainer() {
    const loading = useSelector(loadingFlow);
    const zones = useSelector(selectZones);
    const site = useSelector(selectSite);
    const siteLoading = useSelector(selectSiteLoading);

    if (
        ["loading", "reloading"].includes(loading) ||
        ["loading", "reloading"].includes(siteLoading)
    ) {
        return <LoadingWheel />;
    } else if (loading === "failed" || siteLoading === "failed" || site === null) {
        return <Text>{t("common.error")}</Text>;
    }

    return <SettingsZone site={site} zones={zones} />;
}
