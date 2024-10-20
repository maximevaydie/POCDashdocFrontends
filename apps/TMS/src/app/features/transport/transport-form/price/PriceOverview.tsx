import {t} from "@dashdoc/web-core";
import {Box, ClickableBox, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatNumber, PurchaseCostLine} from "dashdoc-utils";
import {useFormikContext} from "formik";
import React, {FunctionComponent, useContext, useEffect, useMemo, useRef} from "react";

import {
    getInitialPlannedQuantity,
    getPlannedQuantitiesFromLoads,
    getPricingCurrency,
    LOADS_METRICS,
    PricingFormData,
    PricingFormLine,
} from "app/services/invoicing";

import {TransportFormContext} from "../transport-form-context";
import {TransportFormValues} from "../transport-form.types";

type PriceOverviewProps = {
    deliveriesCount: number;
    hasPrice: boolean;
    hasPurchaseCosts: boolean;
    isEditing: boolean;
    setEditing: (value: boolean) => void;
    hideTitle?: boolean;
};
export const PriceOverview: FunctionComponent<PriceOverviewProps> = ({
    deliveriesCount,
    hasPrice,
    hasPurchaseCosts,
    isEditing,
    setEditing,
    hideTitle = false,
}) => {
    const {
        values: {price, loads},
        setFieldValue,
    } = useFormikContext<TransportFormValues>();

    const {volumeDisplayUnit} = useContext(TransportFormContext);

    const computedPrice = useMemo(() => {
        let computedPrice = null;
        if (price?.quotation) {
            const currency = getPricingCurrency(price.quotation);
            const gasIndex =
                (price.quotation.fuel_surcharge_line?.quantity
                    ? parseFloat(price.quotation.fuel_surcharge_line.quantity)
                    : parseFloat(price.quotation.gas_index)) / 100;
            let tariffGridPrice = 0;
            if (price.quotation.tariff_grid_line) {
                const tariffGridLine = price.quotation.tariff_grid_line;
                tariffGridPrice =
                    tariffGridLine.pricing_policy === "flat"
                        ? // @ts-ignore
                          parseFloat(tariffGridLine.final_unit_price)
                        : parseFloat(tariffGridLine.final_quantity) *
                          // @ts-ignore
                          parseFloat(tariffGridLine.final_unit_price);
                if (gasIndex && tariffGridLine.is_gas_indexed) {
                    tariffGridPrice *= 1 + gasIndex;
                }
            }
            const totalQuotationPrice =
                tariffGridPrice +
                price.quotation.lines.reduce((totalPrice: number, priceLine: PricingFormLine) => {
                    // @ts-ignore
                    let price = parseFloat(priceLine.quantity) * parseFloat(priceLine.unit_price);
                    if (gasIndex && priceLine.is_gas_indexed) {
                        price += price * gasIndex;
                    }
                    if (isNaN(price)) {
                        return totalPrice;
                    }
                    return price + totalPrice;
                }, 0);

            computedPrice = hasPrice
                ? `${formatNumber(totalQuotationPrice, {style: "currency", currency})} HT`
                : hasPurchaseCosts
                  ? null
                  : t("common.price");
        }
        return computedPrice;
    }, [price?.quotation, hasPrice, hasPurchaseCosts]);

    const computedPurchaseCosts = useMemo(() => {
        let computedPurchaseCosts = null;
        if (price?.purchaseCosts) {
            const totalPurchaseCosts = price.purchaseCosts.lines.reduce(
                (totalPrice: number, priceLine: PurchaseCostLine) => {
                    const price =
                        parseFloat(priceLine.quantity) * parseFloat(priceLine.unit_price);
                    if (isNaN(price)) {
                        return totalPrice;
                    }
                    return price + totalPrice;
                },
                0
            );

            computedPurchaseCosts = hasPurchaseCosts
                ? `${formatNumber(totalPurchaseCosts, {style: "currency", currency: "EUR"})} HT`
                : null;
        }
        return computedPurchaseCosts;
    }, [price?.purchaseCosts, hasPurchaseCosts]);

    useEffect(() => {
        const plannedQuantities = getPlannedQuantitiesFromLoads(loads, volumeDisplayUnit);
        let priceChanges: {
            quotation?: PricingFormData;
            purchaseCosts?: {lines: PurchaseCostLine[]};
        } = {};
        if (price?.quotation) {
            const newQuotation = {...price.quotation};
            newQuotation.lines = newQuotation.lines.map((pricingLine) => {
                let newQuantity = pricingLine.quantity;

                if (
                    ["FLAT", ...LOADS_METRICS].includes(pricingLine.metric) &&
                    !pricingLine.isOverridden
                ) {
                    newQuantity = getInitialPlannedQuantity(pricingLine.metric, plannedQuantities);
                }

                return {
                    ...pricingLine,
                    quantity: newQuantity,
                };
            });

            priceChanges["quotation"] = newQuotation;
        }

        if (price?.purchaseCosts?.lines) {
            const newPurchaseCosts = {...price.purchaseCosts};
            newPurchaseCosts.lines = newPurchaseCosts.lines.map((purchaseCostLine) => {
                let newQuantity = purchaseCostLine.quantity;

                if (
                    LOADS_METRICS.includes(purchaseCostLine.metric) &&
                    purchaseCostLine.quantity_source === "AUTO"
                ) {
                    newQuantity = getInitialPlannedQuantity(
                        purchaseCostLine.metric,
                        plannedQuantities
                    );
                }

                return {
                    ...purchaseCostLine,
                    quantity: newQuantity,
                };
            });

            priceChanges["purchaseCosts"] = newPurchaseCosts;
        }

        if (Object.keys(priceChanges).length > 0) {
            setFieldValue("price", {...price, ...priceChanges});
        }
    }, [loads]);

    useEffect(() => {
        if ((!hasPrice && !hasPurchaseCosts) || !price) {
            return;
        }

        // update purchase cost lines and pricing lines that depend on the number of deliveries
        const newQuotation = {...price.quotation};
        // @ts-ignore
        newQuotation.lines = newQuotation.lines.map((pricingLine) => {
            if (pricingLine.metric === "NB_DELIVERIES" && !pricingLine.isOverridden) {
                return {
                    ...pricingLine,
                    quantity: deliveriesCount.toString(),
                };
            }

            return pricingLine;
        });

        const newPurchaseCosts = {...price.purchaseCosts};
        if (newPurchaseCosts.lines) {
            newPurchaseCosts.lines = newPurchaseCosts.lines.map((purchaseCostLine) => {
                if (
                    purchaseCostLine.metric === "NB_DELIVERIES" &&
                    purchaseCostLine.quantity_source === "AUTO"
                ) {
                    return {
                        ...purchaseCostLine,
                        quantity: deliveriesCount.toString(),
                    };
                }

                return purchaseCostLine;
            });
        }

        setFieldValue("price", {
            ...price,
            quotation: newQuotation,
            purchaseCosts: newPurchaseCosts,
        });
    }, [deliveriesCount]);

    const priceRef = useRef(null);
    useEffect(() => {
        if (isEditing) {
            // @ts-ignore
            priceRef.current?.scrollIntoView();
        }
    }, [isEditing]);

    return hasPrice || hasPurchaseCosts ? (
        <>
            {!hideTitle && (
                <Flex
                    mt={4}
                    mb={3}
                    ml={4}
                    flexDirection={"row"}
                    justifyContent={"flex-start"}
                    alignItems={"center"}
                >
                    <Text variant="h1" mr={3}>
                        {t("common.price")}
                    </Text>
                    {price?.quotation?.tariff_grid_line && (
                        <TooltipWrapper content={t("tariffGrids.PriceIsLinkedToTariffGrid")}>
                            <Icon name="tariffGrid" fontSize={3} color="blue.default" />
                        </TooltipWrapper>
                    )}
                </Flex>
            )}
            <ClickableBox
                px={4}
                py={3}
                onClick={() => setEditing(true)}
                width="100%"
                border="1px solid"
                borderColor={isEditing ? "grey.light" : "transparent"}
                bg={isEditing ? "grey.light" : undefined}
                data-testid="transport-creation-price"
            >
                <Text color="grey.dark">{computedPrice}</Text>
                <Text color="grey.dark">
                    {computedPurchaseCosts &&
                        (hasPrice
                            ? t("priceOverview.includingPurchaseCosts", {
                                  totalPurchaseCosts: computedPurchaseCosts,
                              })
                            : t("priceOverview.purchaseCosts", {
                                  totalPurchaseCosts: computedPurchaseCosts,
                              }))}
                </Text>
            </ClickableBox>
        </>
    ) : isEditing ? (
        <>
            <Text variant="h1" mt={4} mb={3} ml={4} ref={priceRef}>
                {t("common.price")}
            </Text>
            <Box
                border="1px solid"
                borderColor="grey.light"
                bg="grey.light"
                height="46px"
                mx={4}
            />
        </>
    ) : (
        <></>
    );
};
