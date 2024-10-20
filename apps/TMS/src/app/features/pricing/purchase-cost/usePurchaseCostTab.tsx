import {t} from "@dashdoc/web-core";
import {Callout, Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import {PurchaseCostLine, getLocale} from "dashdoc-utils";
import React, {useRef} from "react";

import {PriceLabel} from "app/features/pricing/prices/tabs/PriceLabel";
import {PurchaseCostForm} from "app/features/pricing/purchase-cost/PurchaseCostForm";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useTransportPricingMetricQuantities} from "app/hooks/useTransportPricingMetricQuantities";
import {canReadPurchaseCost} from "app/taxation/pricing/services/purchaseCostRight.service";

import type {Transport} from "app/types/transport";

export const PURCHASE_COST_TAB = "purchase-cost";

type Props = {
    transport: Transport;
    useLargeLabels: boolean;
    onSubmit: (purchaseCostLines: PurchaseCostLine[]) => void;
};

export function usePurchaseCostTab({transport, useLargeLabels, onSubmit}: Props) {
    const locale = getLocale();

    const ref = useRef<{
        isDirty: boolean;
    }>(null);
    const transportPricingMetricQuantities = useTransportPricingMetricQuantities(transport.uid);
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();

    const canRead = canReadPurchaseCost(transport, companiesFromConnectedGroupView);

    if (!canRead) {
        return null;
    }

    const label = useLargeLabels ? (
        <PriceLabel label={t("common.purchaseCosts")} price="" />
    ) : (
        t("common.purchaseCosts")
    );
    const content = (
        <>
            <Callout mt={5}>
                <Text as="span"> {t("purchaseCosts.informativeCallout")} </Text>
                {locale === "fr" && (
                    <Link
                        href="https://help.dashdoc.com/fr/articles/9250659-gerer-mes-couts-d-achats-dans-dashdoc"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("common.learnMore")}
                    </Link>
                )}
            </Callout>
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
                key="purchase-cost"
                ref={ref}
                transport={transport}
                initialPurchaseCostLines={transport.purchase_costs?.lines}
                pricingMetricQuantities={transportPricingMetricQuantities}
                onSubmit={onSubmit}
            />
        </>
    );

    return {
        tab: PURCHASE_COST_TAB,
        label,
        content,
        testId: "prices-modal-purchase-cost-tab",
        ref,
        readOnly: false,
        pricing: null,
    };
}
