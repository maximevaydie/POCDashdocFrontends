import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {SettingsZoneSetupEmptyImage} from "./SettingsZoneSetupEmptyImage";

type Props = {
    onAddZoneClick: () => void;
};

export function SettingsZoneSetupEmpty({onAddZoneClick}: Props) {
    return (
        <Flex flexDirection="column" alignItems="center" maxWidth="680px" margin="0 auto">
            <SettingsZoneSetupEmptyImage />
            <Box>
                <Text variant="title">{t("flow.settings.zoneSetupTabTitle")}</Text>
                <Text variant="title" color="grey.dark" mt={4}>
                    {t("flow.settings.zoneSetupEmptyDescription")}
                </Text>
            </Box>
            <Box mt={4}>
                <Button mt={4} variant="primary" onClick={onAddZoneClick}>
                    {t("flow.settings.zoneSetupTab.addZoneButton")}
                </Button>
            </Box>
        </Flex>
    );
}
