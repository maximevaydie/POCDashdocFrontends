import {t} from "@dashdoc/web-core";
import {Box, Icon} from "@dashdoc/web-ui";
import React from "react";

export function AccessDeniedScreen() {
    return (
        <Box m={8} color="red.dark" data-testid="access-denied-screen">
            <Icon name="warning" mr={1} /> {t("common.accessDeniedError-v2")}
        </Box>
    );
}
