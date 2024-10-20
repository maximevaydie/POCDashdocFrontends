import {t} from "@dashdoc/web-core";
import {Box, Tabs} from "@dashdoc/web-ui";
import {Pricing} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {TransportPrice} from "app/features/pricing/transport-price/TransportPrice";
import {InformationBlockTitle} from "app/features/transport/transport-information/information-block-title";
import {TransportPurchaseCost} from "app/features/transport/transport-information/TransportPurchaseCost";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {canUpsertPurchaseCost} from "app/taxation/pricing/services/purchaseCostRight.service";

import type {Transport} from "app/types/transport";

interface TransportPriceTabsProps {
    transport: Transport;
    agreedPrice: Pricing | null;
    invoicedPrice: Pricing | null;
    shipperFinalPrice: Pricing | null;
    onClickOnPrice: (tab: "pricing" | "purchaseCost") => void;
}

export const TransportPriceTabs: FunctionComponent<TransportPriceTabsProps> = ({
    transport,
    agreedPrice,
    invoicedPrice,
    shipperFinalPrice,
    onClickOnPrice,
}) => {
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const purchaseCostsTabVisibility = canUpsertPurchaseCost(
        transport,
        companiesFromConnectedGroupView
    );

    const purchaseCostTab = purchaseCostsTabVisibility
        ? {
              label: t("common.purchaseCosts"),
              testId: "transport-purchase-cost-tab",
              content: (
                  <Box pt={3}>
                      <TransportPurchaseCost
                          transport={transport}
                          onClick={() => onClickOnPrice("purchaseCost")}
                      />
                  </Box>
              ),
          }
        : null;
    const tabs = [
        {
            label: t("common.price"),
            testId: "transport-price-tab",
            content: (
                <TransportPrice
                    transport={transport}
                    agreedPrice={agreedPrice}
                    invoicedPrice={invoicedPrice}
                    shipperFinalPrice={shipperFinalPrice}
                    onClickOnPrice={() => onClickOnPrice("pricing")}
                />
            ),
        },
    ];

    if (purchaseCostTab) {
        tabs.push(purchaseCostTab);
    }

    if (tabs.length === 1) {
        return (
            <InformationBlockTitle
                iconName="euro"
                label={t("common.price")}
                pl={1}
                data-testid="transport-detail-pricing-block"
            >
                <Tabs
                    tabs={tabs}
                    hideHeaderWhenSingleTab
                    borderBottom={tabs.length === 1 ? null : "1px solid"}
                />
            </InformationBlockTitle>
        );
    }

    return (
        <Tabs
            tabs={tabs}
            hideHeaderWhenSingleTab
            borderBottom={tabs.length === 1 ? null : "1px solid"}
        />
    );
};
