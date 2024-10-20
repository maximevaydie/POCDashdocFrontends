import {getAdministrativeAddress, PartnerDetailOutput} from "@dashdoc/web-common";
import {getReadableAddress, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Card,
    ClickableUpdateRegionStyle,
    Flex,
    Icon,
    LoadingWheel,
    Text,
} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React from "react";

import {CompanyInvoicingModal} from "app/features/company/CompanyInvoicingModal";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

import {ShipperOnlyDecorator} from "../../ShipperOnlyDecorator";
import {InfoItem} from "../info/InfoItem";

import {InvoicingData, useInvoicingData} from "./useInvoicingData";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function InvoicingCard({company}: Props) {
    const [editing, openEdition, closeEdition] = useToggle();

    const {loading, ...invoicingData} = useInvoicingData(company.pk);

    const {pk: companyPk, invoicing_remote_id} = company;
    const administrativeAddress = getAdministrativeAddress(company);
    const hasInvoicingRemoteId = !!invoicing_remote_id;
    return (
        <>
            <Card
                p={4}
                as={ClickableUpdateRegionStyle}
                onClick={openEdition}
                data-testid="company-invoicing-update"
            >
                <Flex>
                    <Icon name="balance" mr={2} />
                    <Text variant="h1">{t("common.billing")}</Text>
                    <ShipperOnlyDecorator company={company} />
                    {loading && (
                        <Flex ml={2}>
                            <LoadingWheel noMargin small />
                        </Flex>
                    )}
                </Flex>
                {!loading && <InvoicingContent company={company} invoicingData={invoicingData} />}
            </Card>
            {editing && (
                <CompanyInvoicingModal
                    companyPk={companyPk}
                    primaryAddress={administrativeAddress}
                    hasInvoicingRemoteId={hasInvoicingRemoteId}
                    {...invoicingData}
                    onClose={closeEdition}
                />
            )}
        </>
    );
}

export function InvoicingContent({
    company,
    invoicingData,
}: Props & {invoicingData: InvoicingData}) {
    const administrativeAddress = getAdministrativeAddress(company);
    const hasDashdocInvoicing = useHasDashdocInvoicingEnabled();
    const {invoiceable, invoicingAddress, accountCode, sideAccountCode} = invoicingData;
    const readablePrimaryAddress = getReadableAddress(administrativeAddress);
    const readableInvoicingAddress = getReadableAddress(invoicingAddress);
    if (!invoiceable) {
        return (
            <Callout variant="warning" mt={3} data-testid="not-invoiceable">
                {t("company.notInvoiceable")}
            </Callout>
        );
    }
    return (
        <Flex>
            <InfoItem
                valuePrefix={`${t("components.invoicingAddress")} : `}
                mt={3}
                pr={2}
                flex={1}
            >
                {readablePrimaryAddress === readableInvoicingAddress
                    ? t("company.invoicing.sameInvoicingPrimaryAddress")
                    : readableInvoicingAddress}
            </InfoItem>
            {hasDashdocInvoicing && (
                <Box flex={1}>
                    <InfoItem
                        valuePrefix={`${t("invoicing.accountCode")} : `}
                        mt={3}
                        data-testid="account-code"
                    >
                        {accountCode}
                    </InfoItem>
                    <InfoItem
                        valuePrefix={`${t("invoicing.sideAccountCode")} : `}
                        mt={3}
                        data-testid="side-account-code"
                    >
                        {sideAccountCode}
                    </InfoItem>
                </Box>
            )}
        </Flex>
    );
}
