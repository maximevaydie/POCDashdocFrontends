import {t} from "@dashdoc/web-core";
import {Box, Flex, RepliedSVG, Text} from "@dashdoc/web-ui";
import React from "react";

export const RequestForwarded = () => (
    <Box>
        <Flex justifyContent="center" my={6}>
            <RepliedSVG />
        </Flex>
        <Explanations />
    </Box>
);

const Explanations = () => (
    <Box>
        <Text textAlign="center" mb={3} variant="h2">
            {t("common.requestPlanUpgrade.sent")}
        </Text>
        <Text textAlign="center" mb={3}>
            {t("common.requestPlanUpgrade.getBack")}
        </Text>
    </Box>
);
