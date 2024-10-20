import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    EditableField,
    Icon,
    LoadingWheel,
    Text,
    TooltipWrapper,
    theme,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Pricing, formatNumber} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React from "react";

import {TransportInvoiceNumber} from "app/features/transport/transport-information/transport-invoice-number";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useSelector} from "app/redux/hooks";
import {invoicingRightService} from "app/services/invoicing";
import {getChildTransportCost} from "app/services/transport";

import type {Transport} from "app/types/transport";

export type InvoiceInfoForTransport = {
    uid: string;
    document_number: string | null;
};

export type TransportInvoicingInformationProps = {
    transport: Transport;
    invoice: InvoiceInfoForTransport | null;
    isInvoiceLoading: boolean;
    isPricesLoading: boolean;
    agreedPrice: Pricing | null;
    invoicedPrice: Pricing | null;
    shipperFinalPrice: Pricing | null;
    onClickOnInvoiceNumber: () => void;
    onClickOnAgreedPrice: () => void;
    onClickOnInvoicedPrice: () => void;
};

enum MarginTypeValues {
    estimatedMargin = "estimatedMargin",
    realMargin = "realMargin",
    noMargin = "noMargin",
}

type MarginType = keyof typeof MarginTypeValues;

const Margin = styled.span<{isPositive: boolean; type: MarginType}>`
    font-size: 12px;
    background-color: ${({type}) =>
        type === MarginTypeValues.noMargin ? theme.colors.yellow.ultralight : "transparent"};
    color: ${({isPositive, type}) => {
        if (type === MarginTypeValues.noMargin) {
            return theme.colors.yellow.default;
        }
        return isPositive ? theme.colors.green.default : theme.colors.red.default;
    }};
`;

export function TransportInvoicingInformation(props: TransportInvoicingInformationProps) {
    const connectedCompany = useSelector(getConnectedCompany);
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const hasCarrierAndShipperPriceEnabled = useFeatureFlag("carrierAndShipperPrice");
    const {
        transport,
        invoice,
        isInvoiceLoading,
        isPricesLoading,
        agreedPrice,
        invoicedPrice,
        // shipperFinalPrice, // TODO
        onClickOnInvoiceNumber,
        onClickOnAgreedPrice,
        onClickOnInvoicedPrice,
    } = props;

    const canUpdatePricing = invoicingRightService.canEditInvoicedPrice(
        transport,
        connectedCompany?.pk,
        hasCarrierAndShipperPriceEnabled,
        companiesFromConnectedGroupView
    );
    const canReadPrices = invoicingRightService.canReadPrices(
        transport,
        companiesFromConnectedGroupView
    );

    const costs = transport.segments.reduce(
        (acc, segment) => {
            const childTransport = segment.child_transport;
            if (childTransport?.uid) {
                if (!acc[childTransport.uid]) {
                    acc[childTransport.uid] = true;
                    const segmentCost = getChildTransportCost(childTransport);
                    if (!isNil(segmentCost)) {
                        acc.total = (acc.total || 0) + segmentCost;
                    }
                }
            }
            return acc;
        },
        // @ts-ignore
        {total: undefined} as Record<string, boolean> & {total: number}
    );

    const totalCost = formatNumber(costs.total, {
        style: "currency",
        currency: "EUR",
    });

    const invoicedPriceValue = formatNumber(invoicedPrice?.final_price_with_gas_indexed, {
        style: "currency",
        currency: "EUR",
    });

    const agreedPriceValue = formatNumber(agreedPrice?.final_price_with_gas_indexed, {
        style: "currency",
        currency: "EUR",
    });

    const _renderAgreedPrice = () => {
        const canUpdateQuotation = invoicingRightService.canEditAgreedPrice(
            transport,
            connectedCompany?.pk,
            hasCarrierAndShipperPriceEnabled
        );
        const clickable =
            canUpdateQuotation ||
            (canReadPrices &&
                agreedPrice &&
                (agreedPrice.lines.length > 0 || agreedPrice.tariff_grid_line !== null));
        const updateButtonLabel =
            !canUpdateQuotation && canReadPrices ? t("common.view") : t("common.edit");

        return (
            <EditableField
                // @ts-ignore
                clickable={clickable}
                label={t("components.agreedPrice")}
                updateButtonLabel={updateButtonLabel}
                value={agreedPriceValue}
                onClick={onClickOnAgreedPrice}
                data-testid={"update-quotation-price-button"}
            />
        );
    };

    const _renderInvoicedPrice = () => {
        const updateButtonLabel =
            !canUpdatePricing && canReadPrices ? t("common.view") : t("common.edit");

        return (
            <EditableField
                // @ts-ignore
                clickable={
                    canUpdatePricing ||
                    // @ts-ignore
                    (canReadPrices && invoicedPrice?.lines.length > 0)
                }
                updateButtonLabel={updateButtonLabel}
                label={t("components.invoicedPriceLabel")}
                value={invoicedPriceValue}
                placeholder={canUpdatePricing ? t("components.addPrice") : ""}
                onClick={onClickOnInvoicedPrice}
                data-testid={"update-invoiced-price-button"}
            />
        );
    };

    const _renderCost = () => {
        const agreedPriceValue = agreedPrice?.final_price_with_gas_indexed;
        const invoicedPriceValue = invoicedPrice?.final_price_with_gas_indexed;
        const estimatedMargin = agreedPriceValue ? +agreedPriceValue - costs.total : null;
        const realMargin = invoicedPriceValue ? +invoicedPriceValue - costs.total : null;

        const formattedEstimatedMargin = formatNumber(estimatedMargin, {
            style: "currency",
            currency: "EUR",
        });

        const formattedRealMargin = formatNumber(realMargin, {
            style: "currency",
            currency: "EUR",
        });

        const _getTextMarginContent = (marginType: MarginType) => {
            if (marginType === "estimatedMargin") {
                return t("chartering.estimatedMargin");
            }
            if (marginType === "realMargin") {
                return t("chartering.realMargin");
            }
            return t("chartering.noMargin");
        };

        const _getTooltipContent = (marginType: MarginType) => {
            if (marginType === "estimatedMargin") {
                return t("chartering.estimatedMargin.tooltip");
            }
            if (marginType === "realMargin") {
                return t("chartering.realMargin.tooltip");
            }
            return t("chartering.noMargin.tooltip");
        };

        const _renderMargin = (
            margin: number | null,
            formattedMargin: string,
            marginType: MarginType
        ) => {
            return (
                <Box position="relative" top="-10px" display="flex">
                    <Text variant="captionBold" fontWeight={700} lineHeight={1}>
                        <span>(</span>
                        {_getTextMarginContent(marginType)}
                        {}
                        <Margin
                            /*
                            // @ts-ignore */
                            isPositive={margin >= 0}
                            type={marginType}
                            data-testid="invoicing-info-margin"
                        >
                            {formattedMargin}
                        </Margin>
                        <span>)</span>
                    </Text>
                    <TooltipWrapper
                        content={_getTooltipContent(marginType)}
                        boxProps={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                        }}
                    >
                        <Icon name={"info"} color="grey.dark" ml={2} />
                    </TooltipWrapper>
                </Box>
            );
        };
        const _getMargin = () => {
            if (!isNil(costs.total)) {
                if (isNil(invoicedPriceValue) && !isNil(agreedPriceValue)) {
                    return _renderMargin(
                        estimatedMargin,
                        formattedEstimatedMargin,
                        MarginTypeValues.estimatedMargin
                    );
                } else if (!isNil(invoicedPriceValue)) {
                    return _renderMargin(
                        realMargin,
                        formattedRealMargin,
                        MarginTypeValues.realMargin
                    );
                }
            }
            return _renderMargin(null, "?", MarginTypeValues.noMargin);
        };

        return (
            Object.keys(costs).length > 1 && (
                <>
                    <EditableField
                        data-testid="invocing-data-chartering-cost"
                        clickable={false}
                        label={t("chartering.cost")}
                        value={totalCost}
                        // @ts-ignore
                        onClick={null}
                    />
                    {_getMargin()}
                </>
            )
        );
    };

    return (
        <>
            {/* Invoice number */}

            <TransportInvoiceNumber
                transport={transport}
                isInvoiceLoading={isInvoiceLoading}
                invoice={invoice}
                onClickOnInvoiceNumber={onClickOnInvoiceNumber}
            />

            {isPricesLoading ? (
                <LoadingWheel noMargin />
            ) : (
                <>
                    {/* Agreed price */}
                    {_renderAgreedPrice()}

                    {/* Invoiced price */}
                    {_renderInvoicedPrice()}

                    {/* Cost */}
                    {_renderCost()}
                </>
            )}
        </>
    );
}
