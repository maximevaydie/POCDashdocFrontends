import {getIsTheOnlyCompanyInGroupView, useSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

import {SettingsScheduler} from "./SettingsScheduler";

export function CompanySettingsScheduler() {
    const isTheOnlyCompanyInGroupView = useSelector(getIsTheOnlyCompanyInGroupView);
    return isTheOnlyCompanyInGroupView ? <SettingsScheduler /> : <NotAllowedSettingsScheduler />;
}
function NotAllowedSettingsScheduler() {
    return (
        <Box p={3}>
            <Text variant="title" mb={3}>
                {t("sidebar.scheduler")}
            </Text>
            <Text mb={3}>{t("settings.scheduler.activationNotEnableFromCompany")}</Text>
        </Box>
    );
}
