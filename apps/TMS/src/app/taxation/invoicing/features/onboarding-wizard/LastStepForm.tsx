import {useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, FlexProps, Text} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

import {LINK_PARTNERS} from "app/features/sidebar/constants";
import {InvoiceableCustomersSVG} from "app/taxation/invoicing/features/onboarding-wizard/InvoiceableCustomersSVG";
import {ItemCatalogSVG} from "app/taxation/invoicing/features/onboarding-wizard/ItemCatalogSVG";

type LastStepFormPros = {
    onSubmit: () => void;
    onLinkClick: () => void;
};

export function LastStepForm({onSubmit, onLinkClick}: LastStepFormPros) {
    const flexProps: FlexProps = {
        width: "50%",
        backgroundColor: "grey.ultralight",
        flexDirection: "column",
        py: 3,
        px: 5,
        alignItems: "center",
    };
    const history = useHistory();
    const baseurl = useBaseUrl();

    return (
        <form id="last-step-form" onSubmit={onSubmit}>
            <Flex flexDirection={"column"}>
                <Text mb={4} variant="h1">
                    {t("invoicingOnboardingWizard.lastStepHeader")}
                </Text>
                <Text>{t("invoicingOnboardingWizard.lastStepDescription")}</Text>
                <Flex flexDirection={"row"} my={3}>
                    <Flex {...flexProps} mr={3}>
                        <Text variant="h2">{t("invoicingOnboardingWizard.itemCatalogTitle")}</Text>
                        <Box alignSelf={"center"}>
                            <InvoiceableCustomersSVG />
                        </Box>
                        <Text alignSelf={"flex-start"}>
                            {t("invoicingOnboardingWizard.itemCatalogDescription")}
                        </Text>
                        <Box flex={1} />
                        <Button
                            mt={2}
                            variant="secondary"
                            onClick={() => {
                                onLinkClick();
                                history.push("/app/settings/invoice-item-catalog");
                            }}
                        >
                            {t("invoicingOnboardingWizard.itemCatalogLink")}
                        </Button>
                    </Flex>
                    <Flex {...flexProps} ml={3}>
                        <Text variant="h2">
                            {t("invoicingOnboardingWizard.invoiceableCustomersTitle")}
                        </Text>
                        <Box alignSelf={"center"}>
                            <ItemCatalogSVG />
                        </Box>
                        <Text alignSelf={"flex-start"}>
                            {t("invoicingOnboardingWizard.invoiceableCustomersDescription")}
                        </Text>
                        <Box flex={1} />
                        <Button
                            mt={2}
                            variant="secondary"
                            onClick={() => {
                                onLinkClick();
                                history.push(`${baseurl}${LINK_PARTNERS}`);
                            }}
                        >
                            {t("invoicingOnboardingWizard.invoiceableCustomersLink")}
                        </Button>
                    </Flex>
                </Flex>
                <Text mt={2} variant="h2">
                    {t("invoicingOnboardingWizard.lastStepLastWord")}
                </Text>
            </Flex>
        </form>
    );
}
