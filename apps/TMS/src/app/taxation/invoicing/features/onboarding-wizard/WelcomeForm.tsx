import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {WelcomeSVG} from "app/taxation/invoicing/features/onboarding-wizard/WelcomeSVG";

export function WelcomeForm({onSubmit}: {onSubmit: () => void}) {
    return (
        <form id="welcome-form" onSubmit={onSubmit}>
            <Flex flexDirection={"column"}>
                <Box alignSelf={"center"}>
                    <WelcomeSVG />
                </Box>
                <Text mt={5} variant="h1">
                    {t("invoicingOnboardingWizard.welcomeStepHeader")}
                </Text>
                <Text mt={3}>{t("invoicingOnboardingWizard.welcomeStepBody")}</Text>
            </Flex>
        </form>
    );
}
