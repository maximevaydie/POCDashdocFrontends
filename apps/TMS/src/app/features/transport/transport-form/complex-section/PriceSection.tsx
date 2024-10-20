import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Text, ClickableFlex, TooltipWrapper, Icon} from "@dashdoc/web-ui";
import {isEmptyPricing, type SlimCompany} from "dashdoc-utils";
import {useFormikContext} from "formik";
import React from "react";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {TariffGridApplicationInfo} from "app/features/pricing/tariff-grids/types";

import {PriceFormPanel} from "../price/PriceFormPanel";
import {PriceOverview} from "../price/PriceOverview";
import {TransportFormValues} from "../transport-form.types";

interface PriceSectionProps {
    isCarrier: boolean;
    isCarrierGroupOfTransport: boolean;
    isOwnerOfCurrentFuelSurchargeAgreement: boolean;
    canEditCustomerToInvoice: boolean;
    matchingTariffGrids: TariffGridApplicationInfo[];
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    invoiceItemSuggestionArguments?: InvoiceItemSuggestionArguments;
}

export function PriceSection({
    isCarrier,
    isCarrierGroupOfTransport,
    isOwnerOfCurrentFuelSurchargeAgreement,
    canEditCustomerToInvoice,
    matchingTariffGrids,
    matchingFuelSurchargeAgreement,
    invoiceItemSuggestionArguments,
}: PriceSectionProps) {
    const [openEdition, setOpenEdition] = React.useState(false);
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const {values, setFieldValue} = useFormikContext<TransportFormValues>();
    const price = values.price;
    const hasPrice = !!price?.quotation && !isEmptyPricing(price.quotation);
    const hasPurchaseCosts = !!price?.purchaseCosts && price.purchaseCosts.lines.length > 0;
    const shipper: SlimCompany | undefined = hasBetterCompanyRolesEnabled
        ? values.shipper?.shipper
        : //This code will disappear when the feature flag is removed, Partial<Company> is not compatible with SlimCompany
          (values.shipper?.address?.company as SlimCompany | undefined);
    const deliveriesCount = values.deliveries.length;

    return (
        <>
            <Flex flexDirection="column" flex={1}>
                <Flex>
                    <Text variant="h1" mt={4} mb={3}>
                        {t("common.price")}
                    </Text>
                    {price?.quotation?.tariff_grid_line && (
                        <TooltipWrapper content={t("tariffGrids.PriceIsLinkedToTariffGrid")}>
                            <Icon name="tariffGrid" fontSize={3} color="blue.default" />
                        </TooltipWrapper>
                    )}
                </Flex>
                <Flex
                    minHeight="90px"
                    flex={1}
                    borderWidth="1px"
                    borderColor="grey.light"
                    borderStyle={hasPrice || hasPurchaseCosts ? "solid" : "dashed"}
                    data-testid="transport-form-add-price-button"
                >
                    {hasPrice || hasPurchaseCosts ? (
                        <PriceOverview
                            deliveriesCount={deliveriesCount}
                            hasPrice={hasPrice}
                            hasPurchaseCosts={hasPurchaseCosts}
                            isEditing={openEdition}
                            setEditing={() => setOpenEdition(true)}
                            hideTitle={true}
                        />
                    ) : (
                        <ClickableFlex
                            onClick={() => setOpenEdition(true)}
                            padding={3}
                            paddingBottom={5}
                            flex={1}
                        >
                            <Text variant="h2">{t("transportsForm.addPrice")}</Text>
                        </ClickableFlex>
                    )}
                </Flex>
            </Flex>
            {openEdition && shipper && (
                <PriceFormPanel
                    isCarrier={isCarrier}
                    isCarrierGroupOfTransport={isCarrierGroupOfTransport}
                    isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                    canEditCustomerToInvoice={canEditCustomerToInvoice}
                    shipper={shipper}
                    matchingTariffGrids={matchingTariffGrids}
                    matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                    invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                    onSubmit={(value) => {
                        setFieldValue("price", value);
                        setOpenEdition(false);
                    }}
                    onClose={() => setOpenEdition(false)}
                />
            )}
        </>
    );
}
