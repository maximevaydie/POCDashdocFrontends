import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React from "react";

import {SettingsFormSection} from "../../SettingsFormSection";

import {ZoneOpeningDays} from "./components/ZoneOpeningDays";

export function ZoneOpeningDaysSection() {
    return (
        <Box my={2} ml={2} pl={6} borderLeft={"1px solid"} borderLeftColor="grey.light">
            <SettingsFormSection
                title={t("flow.settings.zoneSetupTab.openingDaysSection")}
                maxWidth={"350px"}
                mt={4}
            >
                <ZoneOpeningDays />
            </SettingsFormSection>
        </Box>
    );
}
