import {t} from "@dashdoc/web-core";
import {Box, Flex, OnDesktop, OnMobile, TabTitle} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React from "react";
import {Helmet} from "react-helmet";
import {useHistory} from "react-router";

import SettingsSidebar from "app/features/settings/SettingsSidebar";

import {SettingsSwitch} from "./SettingsSwitch";

export function SettingsScreen() {
    const history = useHistory();
    const handleSidebarClick = (link: string) => {
        history.push("/app/settings/" + link);
    };

    const helmetTitle = t("sidebar.settings") + " · Dashdoc";
    return (
        <>
            <Helmet>
                <title>{helmetTitle}</title>
            </Helmet>
            <FullHeightMinWidthScreen p={4}>
                <Box
                    height="100%"
                    style={{
                        display: "grid",
                        gridTemplateRows: "min-content 1fr",
                        gap: "8px",
                    }}
                >
                    <TabTitle title={t("sidebar.settings")} data-testid="screen-settings-title" />
                    <OnDesktop>
                        <Box
                            height="100%"
                            overflowY="auto"
                            style={{display: "grid", gridTemplateColumns: "3fr 9fr"}}
                        >
                            <Box
                                p={4}
                                backgroundColor="grey.white"
                                height="100%"
                                overflowY="scroll"
                            >
                                <SettingsSidebar onLinkClick={handleSidebarClick} />
                            </Box>
                            <Box
                                ml={2}
                                p={2}
                                backgroundColor="grey.white"
                                height="100%"
                                overflowY="scroll"
                            >
                                <SettingsSwitch />
                            </Box>
                        </Box>
                    </OnDesktop>
                    <OnMobile>
                        <Flex flexDirection="column">
                            <Box p={4} backgroundColor="grey.white">
                                <SettingsSidebar onLinkClick={handleSidebarClick} />
                            </Box>
                            <Box ml={2} p={2} backgroundColor="grey.white">
                                <SettingsSwitch />
                            </Box>
                        </Flex>
                    </OnMobile>
                </Box>
            </FullHeightMinWidthScreen>
        </>
    );
}
