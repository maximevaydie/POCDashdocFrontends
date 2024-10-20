import {utilsService} from "@dashdoc/web-common";
import {t, translateMetricUnit} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    Flex,
    Icon,
    IconButton,
    NumberInput,
    Text,
    TextInput,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatNumber, InvoiceItem, mapMetricToMaxQuantityDecimals} from "dashdoc-utils";
import {FormikErrors, FormikTouched} from "formik";
import React, {FunctionComponent, useContext} from "react";

import {InvoiceItemSelector} from "app/features/pricing/invoices/invoice-item/InvoiceItemSelector";
import {pricingTableService} from "app/features/pricing/pricing-form/table/pricingTable.service";
import {TransportContext} from "app/features/transport/transport-details/TransportDetails";
import {
    getManualOrAutomaticIcon,
    getMetricLabel,
    getQuantityTooltipContent,
    PricingFormData,
    PricingFormLine,
} from "app/services/invoicing";

import {ReadOnlyPricingTableColumn, UpdatePricingTableColumn} from "../types";

type PricingCellProps = {
    pricingLine: PricingFormLine;
    rowIndex: number;
};

type ReadOnlyPricingCellProps = PricingCellProps & {
    columnName: ReadOnlyPricingTableColumn;
    readOnly: true;
};
type EditablePricingCellProps = PricingCellProps & {
    columnName: UpdatePricingTableColumn;
    errors: FormikErrors<PricingFormData>;
    touched: FormikTouched<PricingFormData>;
    onUpdateLineInvoiceItem: (
        invoiceItem: InvoiceItem | null,
        lineIndex: number,
        autoCompleted: boolean,
        dismissedSuggestion?: boolean
    ) => void;
    onUpdateLineDescription: (
        event: React.ChangeEvent<HTMLInputElement>,
        lineIndex: number
    ) => void;
    onUpdateLineQuantity: (value: number | null, lineIndex: number) => void;
    onUpdateLineUnitPrice: (value: number | null, lineIndex: number) => void;
    onUpdateLineGasIndex: (event: React.ChangeEvent<HTMLInputElement>, lineIndex: number) => void;
    onDeleteLine?: (lineIndex: number) => void;
};

export const PricingCell: FunctionComponent<
    ReadOnlyPricingCellProps | EditablePricingCellProps
> = (props) => {
    if ("readOnly" in props) {
        return <ReadOnlyPricingCell {...props} />;
    } else {
        return <EditablePricingCell {...props} />;
    }
};

/**
 * WARNING!
 * Modify ReadOnly and Editable implementation in the same way.
 */
const ReadOnlyPricingCell: FunctionComponent<ReadOnlyPricingCellProps> = ({
    pricingLine,
    columnName,
    rowIndex,
}) => {
    const metricUnit = translateMetricUnit(pricingLine.metric);
    // @ts-ignore
    const totalPrice = parseFloat(pricingLine.quantity) * parseFloat(pricingLine.unit_price);
    const currency = pricingLine.currency;

    switch (columnName) {
        case "invoiceItem":
            return <Text>{pricingLine.invoice_item?.description}</Text>;
        case "description":
            return <Text>{pricingLine.description}</Text>;
        case "quantity": {
            const icon = getManualOrAutomaticIcon(pricingLine.metric, pricingLine.isOverridden);
            return (
                <Flex alignItems={"center"}>
                    <TooltipWrapper
                        content={
                            pricingLine.isOverridden
                                ? t("pricingMetrics.tooltipManualValue")
                                : t("pricingMetrics.tooltipAutomaticValue")
                        }
                    >
                        {icon && <Icon mr={2} name={icon} />}
                    </TooltipWrapper>
                    <Text width={"100%"} textAlign="right">
                        {formatNumber(pricingLine.quantity, {
                            maximumFractionDigits:
                                mapMetricToMaxQuantityDecimals[pricingLine.metric],
                        })}
                    </Text>
                </Flex>
            );
        }
        case "unit":
            return <Text textAlign={"center"}>{metricUnit || ""}</Text>;
        case "unitPrice":
            return (
                <Text data-testid={`pricing-line-${rowIndex}-unit-price`} textAlign="right">
                    {formatNumber(pricingLine.unit_price, {
                        style: "currency",
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 3,
                    })}
                </Text>
            );
        case "price":
            return (
                <Text data-testid={`pricing-line-${rowIndex}-price`} textAlign="right">
                    {formatNumber(totalPrice, {
                        style: "currency",
                        currency,
                    })}
                </Text>
            );
        case "priceAndVat":
            return (
                <>
                    <Text data-testid={`pricing-line-${rowIndex}-price`} textAlign="right">
                        {formatNumber(totalPrice, {
                            style: "currency",
                            currency,
                        })}
                    </Text>
                    <Text
                        data-testid={`pricing-line-${rowIndex}-vat`}
                        textAlign="right"
                        variant="subcaption"
                    >
                        {t("components.VAT")}{" "}
                        {formatNumber(
                            // @ts-ignore
                            parseFloat(pricingLine?.invoice_item?.tax_code?.tax_rate) / 100,
                            {
                                style: "percent",
                                maximumFractionDigits: 2,
                            }
                        )}
                    </Text>
                </>
            );
        case "gasIndex":
            return (
                <Flex justifyContent="center" mt={2}>
                    <Checkbox
                        data-testid={`pricing-line-${rowIndex}-gas-index`}
                        name={`lines[${rowIndex}].is_gas_indexed`}
                        checked={pricingLine.is_gas_indexed}
                        disabled
                    />
                </Flex>
            );
        default:
            return null;
    }
};

/**
 * WARNING!
 * Modify ReadOnly and Editable implementation in the same way.
 */
const EditablePricingCell: FunctionComponent<EditablePricingCellProps> = ({
    pricingLine,
    errors,
    touched,
    columnName,
    rowIndex,
    onUpdateLineInvoiceItem,
    onUpdateLineDescription,
    onUpdateLineQuantity,
    onUpdateLineUnitPrice,
    onUpdateLineGasIndex,
    onDeleteLine,
}) => {
    const metricUnit = translateMetricUnit(pricingLine.metric);
    const totalPrice = parseFloat(pricingLine.quantity ?? "") * parseFloat(pricingLine.unit_price);
    const transport = useContext(TransportContext);
    const currency = pricingLine.currency;

    switch (columnName) {
        case "invoiceItem":
            return (
                <InvoiceItemSelector
                    data-testid={`pricing-line-${rowIndex}-invoice-item`}
                    onChange={(invoiceItem, autoCompleted, dismissedSuggestion) =>
                        onUpdateLineInvoiceItem(
                            invoiceItem,
                            rowIndex,
                            autoCompleted,
                            dismissedSuggestion
                        )
                    }
                    selectedInvoiceItem={pricingLine.invoice_item}
                    shouldAutoComplete={pricingLine.isNewLine} // If the line is new, the invoice item should autocomplete
                    shouldAutoFocus={!pricingLine.invoice_item}
                    shouldAutoSuggest={!pricingLine.dismissed_suggested_invoice_item}
                    previouslyDismissedSuggestion={pricingLine.dismissed_suggested_invoice_item}
                    errorMessage={pricingTableService.getFormikErrorMessage(errors, [
                        "lines",
                        rowIndex,
                        "invoice_item",
                    ])}
                />
            );
        case "description":
            return (
                <TextInput
                    data-testid={`pricing-line-${rowIndex}-description`}
                    name={`lines[${rowIndex}].description`}
                    aria-label={getMetricLabel(pricingLine.metric)}
                    onChange={(_, event) => onUpdateLineDescription(event, rowIndex)}
                    value={pricingLine.description}
                    error={pricingTableService.getFormikErrorMessage(errors, [
                        "lines",
                        rowIndex,
                        "description",
                    ])}
                    fontSize={1}
                />
            );
        case "quantity": {
            const icon = getManualOrAutomaticIcon(pricingLine.metric, pricingLine.isOverridden);
            return (
                <Box>
                    <NumberInput
                        placeholder={
                            !pricingLine.isOverridden ? t("pricing.automaticQuantity") : ""
                        }
                        leftIcon={icon ?? undefined}
                        leftTooltipContent={getQuantityTooltipContent(
                            pricingLine.metric,
                            pricingLine.isOverridden,
                            transport
                        )}
                        data-testid={`pricing-line-${rowIndex}-quantity`}
                        name={`lines[${rowIndex}].quantity`}
                        value={parseFloat(pricingLine.quantity ?? "")}
                        // @ts-ignore
                        onChange={(value) => onUpdateLineQuantity(value, rowIndex)}
                        // @ts-ignore
                        onTransientChange={(value) => onUpdateLineQuantity(value, rowIndex)} // Update the UI as the user types
                        min={0}
                        maxDecimals={mapMetricToMaxQuantityDecimals[pricingLine.metric]}
                        units={metricUnit}
                        error={pricingTableService.getFormikErrorMessage(errors, [
                            "lines",
                            rowIndex,
                            "quantity",
                        ])}
                    />
                </Box>
            );
        }
        case "unitPrice":
            return (
                <Box>
                    <NumberInput
                        data-testid={`pricing-line-${rowIndex}-unit-price`}
                        name={`lines[${rowIndex}].unit_price`}
                        value={parseFloat(pricingLine.unit_price)}
                        onChange={(value) => onUpdateLineUnitPrice(value, rowIndex)}
                        onTransientChange={(value) => onUpdateLineUnitPrice(value, rowIndex)} // Update the UI as the user types
                        maxDecimals={3}
                        units={utilsService.getCurrencySymbol(currency)}
                        error={
                            pricingTableService.getFormikTouched(touched, [
                                "lines",
                                rowIndex,
                                "unit_price",
                            ])
                                ? pricingTableService.getFormikErrorMessage(errors, [
                                      "lines",
                                      rowIndex,
                                      "unit_price",
                                  ])
                                : undefined
                        }
                    />
                </Box>
            );
        case "price":
            return (
                <Text data-testid={`pricing-line-${rowIndex}-price`} textAlign="right" mt={2}>
                    {formatNumber(totalPrice, {
                        style: "currency",
                        currency,
                    })}
                </Text>
            );
        case "priceAndVat":
            return (
                <>
                    <Text data-testid={`pricing-line-${rowIndex}-price`} textAlign="right">
                        {formatNumber(totalPrice, {
                            style: "currency",
                            currency,
                        })}
                    </Text>
                    <Flex justifyContent="flex-end">
                        <TooltipWrapper
                            content={
                                pricingLine.invoice_item?.tax_code?.tax_rate === undefined
                                    ? t("pricing.fillInvoiceItem")
                                    : null
                            }
                        >
                            <Text
                                data-testid={`pricing-line-${rowIndex}-vat`}
                                textAlign="right"
                                variant="subcaption"
                            >
                                {t("components.VAT")}{" "}
                                {formatNumber(
                                    pricingLine.invoice_item?.tax_code?.tax_rate !== undefined
                                        ? parseFloat(
                                              pricingLine.invoice_item?.tax_code?.tax_rate
                                          ) / 100
                                        : undefined,
                                    {
                                        style: "percent",
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </Text>
                        </TooltipWrapper>
                    </Flex>
                </>
            );
        case "gasIndex":
            return (
                <Flex justifyContent="center" mt={2} pl="0.5em">
                    <Checkbox
                        data-testid={`pricing-line-${rowIndex}-gas-index`}
                        name={`lines[${rowIndex}].is_gas_indexed`}
                        checked={pricingLine.is_gas_indexed}
                        onChange={(_, event) => onUpdateLineGasIndex(event, rowIndex)}
                    />
                </Flex>
            );
        case "delete":
            if (onDeleteLine) {
                return (
                    <Flex justifyContent="center">
                        <IconButton
                            type="button"
                            data-testid={`pricing-line-${rowIndex}-delete`}
                            name="bin"
                            fontSize={3}
                            color="grey.dark"
                            onClick={(event) => {
                                event.preventDefault();
                                onDeleteLine(rowIndex);
                            }}
                        />
                    </Flex>
                );
            } else {
                return null;
            }
        default:
            return null;
    }
};
