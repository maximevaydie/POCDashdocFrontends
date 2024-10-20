import {
    CompanyModal,
    companyService,
    fetchCompany,
    fetchPartner,
    getAdministrativeAddress,
    HasFeatureFlag,
    HasNotFeatureFlag,
    PartnerDetailOutput,
    PartnerModal,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {getReadableAddress, t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Card,
    ClickableBox,
    ClickableUpdateRegionStyle,
    Flex,
    Icon,
    NoWrap,
    Text,
} from "@dashdoc/web-ui";
import {Company, companyGetFullTradeNumber, useToggle} from "dashdoc-utils";
import React from "react";

import {useDispatch} from "app/redux/hooks";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

import {CompanyMap} from "./CompanyMap";
import {InfoItem} from "./InfoItem";

type Props = {
    company: Company | PartnerDetailOutput;
    onUpdate: () => void;
};

export function InfoCard({company, onUpdate}: Props) {
    const [editing, openEdition, closeEdition] = useToggle();
    const dispatch = useDispatch();
    const hasBetterCompanyRoles = useFeatureFlag("betterCompanyRoles");

    const handleReload = async (company: Company | PartnerDetailOutput) => {
        closeEdition();
        if (hasBetterCompanyRoles) {
            await dispatch(fetchPartner(company.pk));
        } else {
            await dispatch(fetchCompany(company.pk.toString()));
        }
        onUpdate();
    };
    return (
        <>
            <Card>
                <Box style={{display: "grid", gridTemplateColumns: "2fr minmax(300px, 1fr)"}}>
                    <ClickableBox
                        as={ClickableUpdateRegionStyle}
                        p={4}
                        onClick={openEdition}
                        data-testid="company-detail-update"
                    >
                        <InfoContent company={company} />
                    </ClickableBox>
                    <Box>
                        <CompanyMap company={company} />
                    </Box>
                </Box>
            </Card>
            {editing && (
                <>
                    <HasFeatureFlag flagName="betterCompanyRoles">
                        <PartnerModal
                            partner={company as PartnerDetailOutput}
                            onSaved={handleReload}
                            onClose={closeEdition}
                        />
                    </HasFeatureFlag>
                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                        <CompanyModal
                            company={company}
                            onSave={handleReload}
                            onClose={closeEdition}
                        />
                    </HasNotFeatureFlag>
                </>
            )}
        </>
    );
}

function InfoContent({company}: {company: Company | PartnerDetailOutput}) {
    const address = getAdministrativeAddress(company);
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    const isShipper = companyService.isShipper(company);
    const isCarrier = companyService.isCarrier(company);
    const isOther = !isShipper && !isCarrier;
    return (
        <Box>
            <Flex>
                <Icon name="building" mr={2} />
                <Text variant="h1">{t("common.informations")}</Text>
            </Flex>
            <Flex mt={3} alignItems="center">
                <HasFeatureFlag flagName="betterCompanyRoles">
                    <InfoItem valuePrefix={`${t("common.type")} :`}>
                        <Flex ml={1} style={{gap: "4px"}}>
                            {isShipper && (
                                <Badge variant="purple" shape="squared" fontWeight="bold">
                                    <NoWrap>{t("common.shipper")}</NoWrap>
                                </Badge>
                            )}
                            {isCarrier && (
                                <Badge variant="blue" shape="squared" fontWeight="bold">
                                    <NoWrap>{t("common.carrier")}</NoWrap>
                                </Badge>
                            )}
                            {isOther && (
                                <Badge variant="pink" shape="squared" fontWeight="bold">
                                    <NoWrap>{t("common.other")}</NoWrap>
                                </Badge>
                            )}
                        </Flex>
                    </InfoItem>
                </HasFeatureFlag>
            </Flex>
            <Flex mt={3} alignItems="center">
                <InfoItem valuePrefix={`${t("common.administrativeAddress")} : `}>
                    {getReadableAddress(address)}
                </InfoItem>
            </Flex>
            <InfoItem
                data-testid="company-information-email"
                valuePrefix={`${t("common.email")} : `}
                mt={3}
            >
                {company.email}
            </InfoItem>
            <InfoItem
                data-testid="company-information-phone-number"
                valuePrefix={`${t("settings.tel")} : `}
                mt={3}
            >
                {company.phone_number}
            </InfoItem>

            <Flex borderTop="1px solid" borderColor="grey.light" mt={4} pt={1}>
                <Box flex={1}>
                    <InfoItem
                        data-testid="company-information-trade-number"
                        valuePrefix={`${t("components.tradeNumber")} : `}
                        mt={3}
                    >
                        {companyGetFullTradeNumber(company)}
                    </InfoItem>
                    <InfoItem
                        data-testid="company-information-vat-number"
                        valuePrefix={`${t("components.VAT")} : `}
                        mt={3}
                    >
                        {company.vat_number}
                    </InfoItem>
                </Box>
                <Box flex={1}>
                    {hasInvoiceEntityEnabled && !hasDashdocInvoicingEnabled && (
                        <InfoItem
                            data-testid="company-information-invoicing-remote-id"
                            valuePrefix={`${t("components.invoicingRemoteId")} : `}
                            mt={3}
                        >
                            {company.invoicing_remote_id}
                        </InfoItem>
                    )}
                    <InfoItem
                        data-testid="company-information-remote-id"
                        valuePrefix={`${t("components.remoteId")} : `}
                        mt={3}
                    >
                        {company.remote_id}
                    </InfoItem>
                </Box>
            </Flex>
        </Box>
    );
}
