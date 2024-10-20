import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

export function NewCompanyPrimaryAddressBanner() {
    return (
        <Box p={4} backgroundColor="yellow.ultralight">
            <Text>{t("newCompanyPrimaryAddressBanner.warning")}</Text>
        </Box>
    );
}
