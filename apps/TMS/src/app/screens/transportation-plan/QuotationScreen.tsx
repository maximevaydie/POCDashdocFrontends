import {SimpleNavbar} from "@dashdoc/web-common";
import {cookiesService, t} from "@dashdoc/web-core";
import {Box, Callout, Flex, LoadingOverlay, Text} from "@dashdoc/web-ui";
import {PublicScreen} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {RouteChildrenProps, useParams} from "react-router";

import {Quotation} from "app/features/transportation-plan/rfq/quotation/Quotation";

import {useQuotationProps} from "./hooks/useQuotationProps";

export const QuotationScreen: FunctionComponent<RouteChildrenProps> = () => {
    const {quotationUid} = useParams<{quotationUid: string}>();
    const {quotationProps, isLoading, error} = useQuotationProps(quotationUid);

    let content: React.ReactNode | null = null;
    if (isLoading) {
        content = <LoadingOverlay />;
    } else if (error) {
        content = (
            <Callout variant="warning" mt={10}>
                <Text variant="title" as="h4">
                    {error}
                </Text>
            </Callout>
        );
    } else if (!quotationProps || quotationProps.transport.business_privacy) {
        content = (
            <Flex
                height="100%"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                mt={10}
            >
                <Text variant="title" as="h4">
                    {t("publicDelivery.errors.transportNotFound")}
                </Text>
            </Flex>
        );
    } else {
        content = <Quotation {...quotationProps} />;
    }

    return (
        <>
            <PublicScreen>
                <SimpleNavbar
                    newColors
                    showLanguageSelector
                    onLanguageChange={cookiesService.setLanguageCookieAndReload}
                />
                <Box height="100%" minWidth="1100px" width="100%" pt="50px" pb={0} px={4}>
                    {content}
                </Box>
            </PublicScreen>
        </>
    );
};
