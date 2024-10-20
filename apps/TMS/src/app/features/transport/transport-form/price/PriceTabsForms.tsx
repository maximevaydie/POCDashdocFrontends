// import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Tabs, Text} from "@dashdoc/web-ui";
import {PlannedQuantities, PricingQuantities, PurchaseCostLine} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {PricingForm} from "app/features/pricing/pricing-form/PricingForm";
import {PurchaseCostForm} from "app/features/pricing/purchase-cost/PurchaseCostForm";
// import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {TariffGridApplicationInfo} from "app/features/pricing/tariff-grids/types";
import {TransportPricingMetricQuantities} from "app/hooks/useTransportPricingMetricQuantities";
import {PricingFormData} from "app/services/invoicing";

interface PriceTabsFormsProps {
    pricingFormRef: React.MutableRefObject<any>;
    purchaseCostsFormRef: React.MutableRefObject<any>;
    initialPurchaseCostLines: PurchaseCostLine[];
    isCarrierOfTransport: boolean;
    isCarrierGroupOfTransport: boolean;
    isOwnerOfCurrentFuelSurchargeAgreement: boolean;
    initialPricing?: PricingFormData | null;
    initialPlannedQuantities?: PlannedQuantities;
    initialRealQuantities?: PricingQuantities;
    matchingTariffGrids: TariffGridApplicationInfo[];
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    invoiceItemSuggestionArguments?: InvoiceItemSuggestionArguments;
    canEditCustomerToInvoice: boolean;
    pricingMetricQuantities: TransportPricingMetricQuantities;
    onSubmitQuotation: (pricing: PricingFormData, hasErrors: boolean) => void;
    onSubmitPurchaseCostLines: (purchaseCostLines: PurchaseCostLine[]) => unknown;
}

export const PriceTabsForms: FunctionComponent<PriceTabsFormsProps> = ({
    // refs
    pricingFormRef,
    purchaseCostsFormRef,

    // pricing props
    isCarrierOfTransport,
    isOwnerOfCurrentFuelSurchargeAgreement,
    initialPricing,
    initialPlannedQuantities,
    initialRealQuantities,
    matchingTariffGrids,
    matchingFuelSurchargeAgreement,
    invoiceItemSuggestionArguments,
    onSubmitQuotation,
    canEditCustomerToInvoice,

    // purchase cost props
    isCarrierGroupOfTransport,
    initialPurchaseCostLines,
    pricingMetricQuantities,
    onSubmitPurchaseCostLines,
}) => {
    const [activeTab, setActiveTab] = useState(0);

    const canAccessPurchaseCost = isCarrierGroupOfTransport;
    const purchaseCostTab = canAccessPurchaseCost
        ? {
              label: t("common.purchaseCosts"),
              testId: "purchase-cost-tab",
              content: (
                  <>
                      <Flex my={5}>
                          <Flex>
                              <Icon color="red.default" name="viewOff" />
                              <Text ml={2}>{t("purchaseCosts.notVisibleToTheShipper")}</Text>
                          </Flex>

                          <Flex ml={5}>
                              <Icon name="analyticsBars" color="blue.default" />
                              <Text ml={2}>{t("purchaseCosts.impactOnReportsAndTurnover")}</Text>
                          </Flex>
                      </Flex>
                      <PurchaseCostForm
                          ref={purchaseCostsFormRef}
                          transport={null} // In the creation form we don't have a transport
                          initialPurchaseCostLines={initialPurchaseCostLines}
                          pricingMetricQuantities={pricingMetricQuantities}
                          onSubmit={onSubmitPurchaseCostLines}
                      />
                  </>
              ),
          }
        : null;

    const quotationTab = initialPricing
        ? {
              label: t("common.price"),
              testId: "price-tab",
              content: (
                  <PricingForm
                      ref={pricingFormRef}
                      isCarrierOfTransport={isCarrierOfTransport}
                      isOwnerOfCurrentFuelSurchargeAgreement={
                          isOwnerOfCurrentFuelSurchargeAgreement
                      }
                      formId="transport-creation-price-subform"
                      initialPricing={initialPricing}
                      initialPlannedQuantities={initialPlannedQuantities}
                      initialRealQuantities={initialRealQuantities}
                      onSubmit={onSubmitQuotation}
                      matchingTariffGridInfos={matchingTariffGrids}
                      matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                      invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                  />
              ),
          }
        : null;

    const tabs = [];

    if (quotationTab) {
        tabs.push(quotationTab);
    }

    if (purchaseCostTab) {
        tabs.push(purchaseCostTab);
    }

    if (tabs.length === 0) {
        return null;
    }

    return (
        <>
            {initialPricing && tabs.length === 1 && (
                <Text variant="h1" mb={3} mt={canEditCustomerToInvoice ? 5 : 0}>
                    {t("common.price")}
                </Text>
            )}
            <Tabs
                mt={canEditCustomerToInvoice && tabs.length > 1 ? 5 : 0}
                tabs={tabs}
                actionButton={null}
                hideHeaderWhenSingleTab
                borderBottom={tabs.length === 1 ? null : "1px solid"}
                initialActiveTab={activeTab}
                onTabChanged={(index) => {
                    let isCurrentFormValid = true;
                    if (pricingFormRef.current?.isDirty) {
                        pricingFormRef.current?.submitForm();
                        isCurrentFormValid =
                            pricingFormRef.current?.isValid || pricingFormRef.current?.isEmpty;
                    } else if (purchaseCostsFormRef.current?.isDirty) {
                        purchaseCostsFormRef.current?.submitForm();
                        isCurrentFormValid =
                            purchaseCostsFormRef.current?.isValid ||
                            purchaseCostsFormRef.current?.isEmpty;
                    }

                    if (isCurrentFormValid) {
                        setActiveTab(index);
                        return true;
                    }

                    return false;
                }}
            />
        </>
    );
};
