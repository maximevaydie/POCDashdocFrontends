import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

export function NoAvailabilities() {
    return (
        <Box
            borderBottom="1px solid"
            borderRadius={1}
            marginY={4}
            paddingY={1}
            backgroundColor={"white"}
            borderColor="grey.light"
            width="90px"
        >
            <Box justifyContent="center" alignItems="center">
                <Text color="grey.dark" variant="subcaption" textAlign="center">
                    {t("flow.noAvailableSlot")}
                </Text>
            </Box>
        </Box>
    );
}
