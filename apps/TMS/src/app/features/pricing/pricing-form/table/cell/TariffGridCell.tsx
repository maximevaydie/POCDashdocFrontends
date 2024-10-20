import {getConnectedCompany} from "@dashdoc/web-common/src/redux/accountSelector";
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
import {formatNumber, mapMetricToMaxQuantityDecimals} from "dashdoc-utils";
import {FormikErrors} from "formik";
import {cloneDeep} from "lodash";
import React, {FunctionComponent} from "react";

import {InvoiceItemSelector} from "app/features/pricing/invoices/invoice-item/InvoiceItemSelector";
import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {useSelector} from "app/redux/hooks";
import {getMetricLabel, PricingFormData, TariffGridLineForm} from "app/services/invoicing";

import {pricingTableService} from "../pricingTable.service";
import {ReadOnlyPricingTableColumn, UpdatePricingTableColumn} from "../types";

type TariffGridCellProps = {
    columns: {
        width: number;
        name: string;
    }[];
    gridLine: TariffGridLineForm;
    rowIndex: number;
};

type ReadOnlyTariffGridCellProps = TariffGridCellProps & {
    columnName: ReadOnlyPricingTableColumn;
    readOnly: true;
};
type EditableTariffGridCellProps = TariffGridCellProps & {
    columnName: UpdatePricingTableColumn;
    errors: FormikErrors<PricingFormData>;
    onUpdateTariffGridLine: (gridLine: TariffGridLineForm) => unknown;
    onDeleteTariffGridLine: () => unknown;
};

const useShouldDisplayTariffGridTitle = (tariffGridLine: TariffGridLineForm) => {
    const connectedCompany = useSelector(getConnectedCompany);
    return tariffGridService.isInTariffGridCreatorGroup(tariffGridLine, connectedCompany);
};

export const TariffGridCell: FunctionComponent<
    ReadOnlyTariffGridCellProps | EditableTariffGridCellProps
> = (props) => {
    if ("readOnly" in props) {
        return <ReadOnlyTariffGridCell {...props} />;
    } else {
        return <EditableTariffGridCell {...props} />;
    }
};

type TariffGridTitleProps = {
    columns: {
        width: number;
    }[];
    title: string;
};
/**
 * A hack to display the tariff grid name like it was in a dedicated
 * ``` html
 * <tr><td colspan={priceColumns.length}>...</td></tr>
 * ```
 * It's not perfect.
 * It's based on the table column width setup.
 * As a side effect, when the user resize the window under this cumulated width, the text will be out of bound.
 * A best way could be a dedicated `<tr>` but we loose the style diff on each line with this approach.
 **/
const AbsoluteTitle: FunctionComponent<TariffGridTitleProps> = ({columns, title}) => (
    <Box position="absolute" width={columns.reduce((acc, column) => acc + column.width, 0)} mt={2}>
        <Flex
            flexDirection={"row"}
            justifyContent={"left"}
            alignItems={"center"}
            data-testid={`tariff-grid-line-title-${title}`}
        >
            <Icon name="tariffGrid" fontSize={4} color="blue.default" />
            <Text ml={2} whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                {title}
            </Text>
        </Flex>
    </Box>
);

/**
 * The previous `AbsoluteTitle` component involves an overlay for following DOM items.
 * We need to "simulate" a free space area with this component... This in not perfect.
 */
const AbsoluteTitleFreeSpace: FunctionComponent<{}> = () => (
    <Box mt={2} mb={2}>
        <Text>&nbsp;</Text>
    </Box>
);

/**
 * WARNING!
 * Modify ReadOnly and Editable implementation in the same way.
 */
const ReadOnlyTariffGridCell: FunctionComponent<ReadOnlyTariffGridCellProps> = ({
    gridLine,
    columns,
    columnName,
    rowIndex,
}) => {
    const displayAbsoluteTitle = useShouldDisplayTariffGridTitle(gridLine);
    const hasInvoiceItemColumn = columns.some((col) => col.name === "invoiceItem");
    const metricUnit = translateMetricUnit(gridLine.metric);
    const totalPrice = gridLine.final_price === null ? null : parseFloat(gridLine.final_price);

    switch (columnName) {
        case "invoiceItem":
            return (
                <>
                    {displayAbsoluteTitle && (
                        <>
                            <AbsoluteTitle columns={columns} title={gridLine.tariff_grid_name} />
                            <AbsoluteTitleFreeSpace />
                        </>
                    )}
                    <Text>{gridLine.invoice_item?.description}</Text>
                </>
            );
        case "description":
            return (
                <>
                    {displayAbsoluteTitle && (
                        <>
                            {!hasInvoiceItemColumn && (
                                <AbsoluteTitle
                                    columns={columns}
                                    title={gridLine.tariff_grid_name}
                                />
                            )}
                            <AbsoluteTitleFreeSpace />
                        </>
                    )}
                    <Text>{gridLine.description}</Text>
                </>
            );
        case "quantity":
            if (gridLine.pricing_policy === "flat") {
                return null;
            }
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Text width={"100%"} textAlign="right">
                        {parseFloat(gridLine.final_quantity)}
                    </Text>
                </>
            );
        case "unit":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Text width={"100%"} textAlign="right">
                        {metricUnit}
                    </Text>
                </>
            );
        case "unitPrice":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Text
                        width={"100%"}
                        textAlign="right"
                        data-testid={`tariff-grid-unit-price-${gridLine.tariff_grid_name}`}
                    >
                        {parseFloat(gridLine.final_unit_price || "")}
                    </Text>
                </>
            );
        case "price":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Text
                        data-testid={`pricing-line-${rowIndex}-price`}
                        width={"100%"}
                        textAlign="right"
                    >
                        {formatNumber(totalPrice, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                </>
            );
        case "priceAndVat":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Text
                        data-testid={`pricing-line-${rowIndex}-price`}
                        width={"100%"}
                        textAlign="right"
                    >
                        {formatNumber(totalPrice, {
                            style: "currency",
                            currency: "EUR",
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
                            parseFloat(gridLine?.invoice_item?.tax_code?.tax_rate) / 100,
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
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex justifyContent="center" mt={2}>
                        <Checkbox
                            data-testid={`pricing-line-${rowIndex}-gas-index`}
                            name={`lines[${rowIndex}].is_gas_indexed`}
                            checked={gridLine.is_gas_indexed}
                            disabled
                        />
                    </Flex>
                </>
            );
        default:
            return null;
    }
};

/**
 * WARNING!
 * Modify ReadOnly and Editable implementation in the same way.
 */
const EditableTariffGridCell: FunctionComponent<EditableTariffGridCellProps> = ({
    gridLine,
    columnName,
    rowIndex,
    columns,
    errors,
    onUpdateTariffGridLine,
    onDeleteTariffGridLine,
}) => {
    const displayAbsoluteTitle = useShouldDisplayTariffGridTitle(gridLine);
    let errorMessage = "";
    const hasInvoiceItemColumn = columns.some((col) => col.name === "invoiceItem");
    const metricUnit = translateMetricUnit(gridLine.metric);
    const totalPrice = gridLine.final_price === null ? null : parseFloat(gridLine.final_price);

    switch (columnName) {
        case "invoiceItem":
            // At the moment, we cannot set the invoice item of a tariff grid,
            // because it should be set on the grid itself, not within the transport pricing.
            // Eventually it will show as readonly on the form, but for now, hide the field completely.
            // When implementing this, remember to update `vat` field below
            // and both fields on `ReadOnlyPricingTable` as well.
            return (
                <>
                    {displayAbsoluteTitle && (
                        <>
                            <AbsoluteTitle columns={columns} title={gridLine.tariff_grid_name} />
                            <AbsoluteTitleFreeSpace />
                        </>
                    )}
                    <InvoiceItemSelector
                        data-testid={`pricing-line-${rowIndex}-invoice-item`}
                        selectedInvoiceItem={gridLine.invoice_item}
                        onChange={(value, autoCompleted) => {
                            const newGridLine: TariffGridLineForm = cloneDeep(gridLine);
                            newGridLine.invoice_item = value;
                            if (value && !autoCompleted) {
                                newGridLine.description = value.description;
                            }
                            onUpdateTariffGridLine(newGridLine);
                        }}
                        shouldAutoFocus={!gridLine.invoice_item}
                        errorMessage={pricingTableService.getFormikErrorMessage(errors, [
                            "lines",
                            rowIndex,
                            "invoice_item",
                        ])}
                    />
                </>
            );
        case "description":
            return (
                <>
                    {displayAbsoluteTitle && (
                        <>
                            {!hasInvoiceItemColumn && (
                                <AbsoluteTitle
                                    columns={columns}
                                    title={gridLine.tariff_grid_name}
                                />
                            )}
                            <AbsoluteTitleFreeSpace />
                        </>
                    )}
                    <TextInput
                        data-testid={`pricing-line-${rowIndex}-description`}
                        name={`lines[${rowIndex}].description`}
                        aria-label={getMetricLabel(gridLine.metric)}
                        onChange={(value) => {
                            const newGridLine: TariffGridLineForm = cloneDeep(gridLine);
                            newGridLine.description = value;
                            onUpdateTariffGridLine(newGridLine);
                        }}
                        value={gridLine.description}
                        error={pricingTableService.getFormikErrorMessage(errors, [
                            "lines",
                            rowIndex,
                            "description",
                        ])}
                        fontSize={1}
                    />
                </>
            );
        case "quantity":
            errorMessage = pricingTableService.getFormikErrorMessage(errors, [
                "lines",
                rowIndex,
                "quantity",
            ]);
            if (gridLine.pricing_policy === "flat") {
                return null;
            }
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex>
                        <NumberInput
                            leftIcon={"horizontalAttach"}
                            disabled={true}
                            leftTooltipContent={t("pricingMetrics.tooltipAutomaticValue")}
                            data-testid={`pricing-line-${rowIndex}-quantity`}
                            name={`lines[${rowIndex}].quantity`}
                            value={parseFloat(gridLine.final_quantity)}
                            onChange={() => {}}
                            min={0}
                            maxDecimals={mapMetricToMaxQuantityDecimals[gridLine.metric]}
                            units={metricUnit}
                            error={errorMessage}
                        />
                        {errorMessage && (
                            <Text variant="caption" color="red.default">
                                {errorMessage}
                            </Text>
                        )}
                    </Flex>
                </>
            );
        case "unitPrice":
            errorMessage = pricingTableService.getFormikErrorMessage(errors, [
                "lines",
                rowIndex,
                "unit_price",
            ]);
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex data-testid={`tariff-grid-unit-price-${gridLine.tariff_grid_name}`}>
                        <NumberInput
                            leftIcon={"horizontalAttach"}
                            disabled={true}
                            data-testid={`pricing-line-${rowIndex}-unit-price`}
                            name={`lines[${rowIndex}].unit_price`}
                            value={
                                gridLine.final_unit_price === null
                                    ? null
                                    : parseFloat(gridLine.final_unit_price)
                            }
                            onChange={() => {}}
                            min={0}
                            maxDecimals={3}
                            units={"€"}
                            error={errorMessage}
                        />
                        {errorMessage && (
                            <Text variant="caption" color="red.default">
                                {errorMessage}
                            </Text>
                        )}
                    </Flex>
                </>
            );
        case "priceAndVat":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex justifyContent="flex-end">
                        <Text data-testid={`pricing-line-${rowIndex}-price`} textAlign="right">
                            {formatNumber(totalPrice, {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </Text>
                    </Flex>
                    <Flex justifyContent="flex-end">
                        <TooltipWrapper
                            content={
                                gridLine.invoice_item?.tax_code?.tax_rate === undefined
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
                                    gridLine.invoice_item?.tax_code?.tax_rate === undefined
                                        ? undefined
                                        : parseFloat(gridLine.invoice_item?.tax_code?.tax_rate) /
                                              100,
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
        case "price":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex mt={2} justifyContent="flex-end">
                        <Text
                            data-testid={`pricing-line-${rowIndex}-price`}
                            textAlign="right"
                            mt={2}
                        >
                            {formatNumber(totalPrice, {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </Text>
                    </Flex>
                </>
            );
        case "gasIndex":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex justifyContent="center" mt={2} pl="0.5em">
                        <Box mt={2}>
                            <Checkbox
                                data-testid={`tariff-grid-line-gas-index`}
                                name={`tariff-grid-line.is_gas_indexed`}
                                checked={gridLine.is_gas_indexed}
                                onChange={(checked) => {
                                    const newGridLine: TariffGridLineForm = cloneDeep(gridLine);
                                    newGridLine.is_gas_indexed = checked;
                                    onUpdateTariffGridLine(newGridLine);
                                }}
                            />
                        </Box>
                    </Flex>
                </>
            );
        case "delete":
            return (
                <>
                    {displayAbsoluteTitle && <AbsoluteTitleFreeSpace />}
                    <Flex justifyContent="center">
                        <IconButton
                            type="button"
                            data-testid={`pricing-line-${rowIndex}-delete`}
                            name="bin"
                            fontSize={3}
                            color="grey.dark"
                            onClick={() => {
                                onDeleteTariffGridLine();
                            }}
                        />
                    </Flex>
                </>
            );
        default:
            return null;
    }
};
