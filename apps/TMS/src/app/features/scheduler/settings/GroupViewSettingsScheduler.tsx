import {t} from "@dashdoc/web-core";
import {FullHeightMinWidthScreen, Box, TabTitle} from "@dashdoc/web-ui";
import React from "react";

import {SettingsScheduler} from "./SettingsScheduler";

export function GroupViewSettingsScheduler() {
    return (
        <>
            <FullHeightMinWidthScreen p={4}>
                <TabTitle title={t("sidebar.settings")} data-testid="screen-settings-title" />
                <Box p={2} mt={2} backgroundColor="grey.white">
                    <SettingsScheduler fromGroupView />
                </Box>
            </FullHeightMinWidthScreen>
        </>
    );
}
