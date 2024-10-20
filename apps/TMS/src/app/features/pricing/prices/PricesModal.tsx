import {guid} from "@dashdoc/core";
import {PartnerTooltip, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Modal, Tabs, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {
    Company,
    InvoiceableCompany,
    InvoicingAddress,
    Pricing,
    PurchaseCostLine,
} from "dashdoc-utils";
import React from "react";

import {
    PURCHASE_COST_TAB,
    usePurchaseCostTab,
} from "app/features/pricing/purchase-cost/usePurchaseCostTab";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {PricingFormData, invoicingRightService, pricingService} from "app/services/invoicing";
import {isPricingEmpty} from "app/services/invoicing/pricingEntity.service";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {PricingTab} from "./tabs/types";
import {useAgreedPriceTab, AGREED_PRICE_TAB} from "./tabs/useAgreedPriceTab";
import {useInvoicedPriceTab} from "./tabs/useInvoicedPriceTab";
import {SHIPPER_FINAL_PRICE_TAB, useShipperFinalPriceTab} from "./tabs/useShipperFinalPriceTab";

import type {Transport} from "app/types/transport";

export type PricesModalProps = {
    transport: Transport;
    connectedCompany: Company | null;
    defaultTab: "pricing" | "purchaseCost";

    shipperFinalPrice: Pricing | null;
    onSubmitShipperFinalPrice: (shipperFinalPrice: PricingFormData) => void;

    agreedPrice: Pricing | null;
    onSubmitAgreedPrice: (agreedPrice: PricingFormData) => void;

    invoicedPrice: Pricing | null;
    onSubmitInvoicedPrice: (invoicedPrice: PricingFormData) => void;

    onSubmitPurchaseCost: (purchaseCost: PurchaseCostLine[]) => void;

    onClose: () => void;
    onCopyToFinalPrice: (source: "agreedPrice" | "invoicedPrice") => void;
};

export function PricesModal({
    transport,
    connectedCompany,
    defaultTab,

    agreedPrice,
    onSubmitAgreedPrice,

    invoicedPrice,
    onSubmitInvoicedPrice,

    shipperFinalPrice,
    onSubmitShipperFinalPrice,

    onSubmitPurchaseCost,

    onClose,
    onCopyToFinalPrice,
}: PricesModalProps) {
    const hasCarrierAndShipperPriceEnabled = useFeatureFlag("carrierAndShipperPrice");
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");

    const isCarrier = transportViewerService.isCarrierOf(transport, connectedCompany?.pk);
    const isShipper = transportViewerService.isShipperOf(transport, connectedCompany?.pk);
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const useLargeLabels = hasShipperFinalPriceEnabled && (!isCarrier || isShipper);

    const canCopyToFinalPrice =
        connectedCompany &&
        invoicingRightService.canEditShipperFinalPrice(
            transport,
            connectedCompany.pk,
            hasShipperFinalPriceEnabled
        );

    const agreedPriceTab = useAgreedPriceTab({
        transport,
        connectedCompany,
        agreedPrice,
        invoicedPrice,
        useLargeLabels,
        onSubmit: onSubmitAgreedPrice,
        onCopyToFinalPrice: canCopyToFinalPrice
            ? () => handleCopyToFinalPrice("agreedPrice")
            : undefined,
    });
    const invoicedPriceTab = useInvoicedPriceTab({
        transport,
        connectedCompany,
        invoicedPrice,
        useLargeLabels,
        onSubmit: onSubmitInvoicedPrice,
        onCopyToFinalPrice: canCopyToFinalPrice
            ? () => handleCopyToFinalPrice("invoicedPrice")
            : undefined,
    });
    const shipperFinalPriceTab = useShipperFinalPriceTab({
        transport,
        connectedCompany,
        pricing: shipperFinalPrice,
        useLargeLabels,
        onSubmit: onSubmitShipperFinalPrice,
        onCopyFromInvoicedPrice:
            canCopyToFinalPrice && invoicedPrice && !isPricingEmpty(invoicedPrice)
                ? () => handleCopyToFinalPrice("invoicedPrice")
                : undefined,
    });
    const purchaseCostTab = usePurchaseCostTab({
        transport,
        useLargeLabels,
        onSubmit: onSubmitPurchaseCost,
    });

    const tabs: PricingTab[] = [];
    if (agreedPriceTab) {
        tabs.push(agreedPriceTab);
    }
    if (invoicedPriceTab) {
        tabs.unshift(invoicedPriceTab);
    }
    if (shipperFinalPriceTab) {
        tabs.unshift(shipperFinalPriceTab);
    }
    if (purchaseCostTab) {
        tabs.push(purchaseCostTab);
    }

    const defaultPricing = pricingService.getTransportPricing({
        transport,
        companyPk: connectedCompany?.pk,
        agreedPrice,
        invoicedPrice,
        shipperFinalPrice,
        hasCarrierAndShipperPriceEnabled,
        hasShipperFinalPriceEnabled,
        companiesFromConnectedGroupView,
    });
    const defaultTabIndex = Math.max(
        0,
        tabs.findIndex((tab) => {
            if (defaultTab === "purchaseCost") {
                return tab.tab === PURCHASE_COST_TAB;
            }

            if (tab.pricing) {
                return tab.pricing === defaultPricing;
            }
            return false;
        })
    );
    const [activeTabIndex, setActiveTabIndex] = React.useState(defaultTabIndex);
    const [tabsKey, setTabsKey] = React.useState("_");

    const activeTab = tabs[activeTabIndex];
    if (!activeTab) {
        return null;
    }
    const customerToInvoice: InvoiceableCompany | null = transport.customer_to_invoice;
    return (
        <Modal
            id="prices-modal"
            data-testid="prices-modal"
            size="xlarge"
            title={t("pricesModal.title")}
            onClose={onClose}
            secondaryButton={activeTab.readOnly ? {children: t("common.close")} : null}
            mainButton={
                !activeTab.readOnly
                    ? {
                          ["data-testid"]: "submit-prices-form-button",
                          children: t("common.save"),
                          type: "submit",
                          form:
                              activeTab.tab === PURCHASE_COST_TAB
                                  ? "purchase-cost-form"
                                  : "pricing-form",
                      }
                    : null
            }
            minWidth="900px"
        >
            {customerToInvoice && (
                <>
                    <Text variant="h1" mb={4}>
                        {t("common.customerToInvoice")}
                    </Text>
                    <Box
                        alignItems="center"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "max-content 1fr",
                            gap: "4px",
                        }}
                    >
                        <Text data-testid="name">{customerToInvoice.name}</Text>
                        <Flex ml={2} color="blue.default">
                            <TooltipWrapper
                                boxProps={{display: "flex"}}
                                onlyOnDesktop
                                content={<CustomerToInvoiceTooltip company={customerToInvoice} />}
                            >
                                <Icon name="building" />
                            </TooltipWrapper>
                            <Box flexGrow={1} />
                        </Flex>
                    </Box>
                    <Text variant="h1" mt={4} mb={2}>
                        {t("common.price")}
                    </Text>
                </>
            )}
            <Tabs
                key={tabsKey}
                tabs={tabs}
                actionButton={null}
                initialActiveTab={activeTabIndex}
                onTabChanged={handleTabChanged}
                hideHeaderWhenSingleTab={hasShipperFinalPriceEnabled}
            />
        </Modal>
    );

    function handleTabChanged(index: number) {
        if (activeTab.ref.current?.isDirty) {
            const confirmTabChange = confirm(t("pricesModal.confirmChangeTabAndLoseChanges"));
            if (confirmTabChange) {
                setActiveTabIndex(index);
                return true;
            }
            return false;
        }
        setActiveTabIndex(index);
        return true;
    }

    function handleCopyToFinalPrice(source: "agreedPrice" | "invoicedPrice") {
        if (!canCopyToFinalPrice) {
            return;
        }

        // Ask the user to save the changes first if copying from the agreed price with unsaved changes.
        // The invoiced price will never have unsaved changes as it is readonly for the shipper.
        // The shipper price can be replaced entirely, this is the whole point of the action.
        if (activeTab.ref.current?.isDirty && activeTab.tab === AGREED_PRICE_TAB) {
            alert(t("pricesModal.saveChangesBeforeCopy"));
            return;
        }

        // Delegate to the parent to make the copy,
        // and the updated shipper price will be passed back as props
        onCopyToFinalPrice(source);

        // Focus shipper price tab
        const shipperTabIndex = tabs.findIndex((tab) => tab.tab === SHIPPER_FINAL_PRICE_TAB);
        setActiveTabIndex(shipperTabIndex);
        setTabsKey(guid());
    }
}

function CustomerToInvoiceTooltip({company}: {company: InvoiceableCompany}) {
    const invoiceAddress: InvoicingAddress | undefined = company.invoicing_address;
    const address = invoiceAddress
        ? {
              address: invoiceAddress.address ?? "",
              postcode: invoiceAddress.postcode,
              city: invoiceAddress.city,
              country: invoiceAddress.country,
          }
        : undefined;
    const notes = company.notes;
    return <PartnerTooltip name={company.name} notes={notes} address={address} />;
}
