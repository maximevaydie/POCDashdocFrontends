import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, IconButton, NumberInput, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {FuelSurchargeLine, formatNumber} from "dashdoc-utils";
import React from "react";

import {
    ReadOnlyPricingTableColumn,
    UpdatePricingTableColumn,
} from "app/features/pricing/pricing-form/table/types";

type FuelSurchargeCellProps = {
    fuelSurchargeLine: FuelSurchargeLine;
    totalFuelSurchargePrice: number;
    isOwner: boolean;
};

type ReadonlyFuelSurchargeCellProps = FuelSurchargeCellProps & {
    columnName: ReadOnlyPricingTableColumn;
    readOnly: true;
};

type EditableFuelSurchargeCellProps = FuelSurchargeCellProps & {
    columnName: UpdatePricingTableColumn;
    onDeleteFuelSurchargeLine: () => void;
    columns: {
        name: string;
        width: number;
    }[];
};

export const FuelSurchargeCell: React.FC<
    ReadonlyFuelSurchargeCellProps | EditableFuelSurchargeCellProps
> = (props) => {
    if ("readOnly" in props) {
        return <ReadonlyFuelSurchargeCell {...props} />;
    } else {
        return <EditableFuelSurchargeCell {...props} />;
    }
};

const ReadonlyFuelSurchargeCell: React.FC<ReadonlyFuelSurchargeCellProps> = ({
    columnName,
    fuelSurchargeLine,
    totalFuelSurchargePrice,
    isOwner,
}) => {
    switch (columnName) {
        case "invoiceItem":
            return <Text>{fuelSurchargeLine?.invoice_item?.description}</Text>;
        case "description":
            return (
                <Text>
                    {t(isOwner ? "components.gasIndex" : "components.gasIndexFromPartner")}
                </Text>
            );
        case "quantity":
            return (
                <Text textAlign="right">
                    {formatNumber(fuelSurchargeLine.quantity, {
                        maximumFractionDigits: 2,
                    })}
                </Text>
            );
        case "unit":
            return <Text textAlign="right">{"%"}</Text>;
        case "price":
            return (
                <Text textAlign="right">
                    {formatNumber(totalFuelSurchargePrice, {
                        style: "currency",
                        currency: "EUR",
                    })}
                </Text>
            );
        case "priceAndVat": {
            const vat = fuelSurchargeLine?.invoice_item?.tax_code?.tax_rate
                ? parseFloat(fuelSurchargeLine.invoice_item.tax_code.tax_rate) / 100
                : NaN;
            return (
                <>
                    <Text textAlign="right">
                        {formatNumber(totalFuelSurchargePrice, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                    <Text data-testid={`gas-index-vat`} textAlign="right" variant="subcaption">
                        {t("components.VAT")}{" "}
                        {formatNumber(vat, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                    </Text>
                </>
            );
        }
        default:
            return null;
    }
};

function AbsoluteTitle({
    fuelSurchargeLine,
    columns,
}: {
    fuelSurchargeLine: FuelSurchargeLine;
    columns: {width: number}[];
}) {
    return (
        <Flex
            position="absolute"
            width={columns.reduce((acc, column) => acc + column.width, 0)}
            justifyContent={"left"}
            alignItems={"center"}
            mt="2"
            mb="2"
        >
            <Icon name="gasIndex" fontSize={4} color="blue.default" />
            <Text
                ml={2}
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
                data-testid="automatic-fuel-surcharge-name"
            >
                {fuelSurchargeLine.name}
            </Text>
        </Flex>
    );
}

const AbsoluteTitleFreeSpace: React.FC = () => (
    <Box mt={2} mb={2}>
        <Text>&nbsp;</Text>
    </Box>
);

const EditableFuelSurchargeCell: React.FC<EditableFuelSurchargeCellProps> = ({
    totalFuelSurchargePrice,
    fuelSurchargeLine,
    onDeleteFuelSurchargeLine,
    columnName,
    columns,
    isOwner,
}) => {
    const hasInvoiceItemColumn = columns.some((col) => col.name === "invoiceItem");

    switch (columnName) {
        case "invoiceItem":
            return (
                <>
                    {isOwner && (
                        <>
                            <AbsoluteTitle
                                fuelSurchargeLine={fuelSurchargeLine}
                                columns={columns}
                            />
                            <AbsoluteTitleFreeSpace />
                            <Text variant="caption">
                                {fuelSurchargeLine?.invoice_item?.description}
                            </Text>
                        </>
                    )}
                </>
            );
        case "description":
            return (
                <>
                    {isOwner && (
                        <>
                            {!hasInvoiceItemColumn && (
                                <AbsoluteTitle
                                    fuelSurchargeLine={fuelSurchargeLine}
                                    columns={columns}
                                />
                            )}
                            <AbsoluteTitleFreeSpace />
                        </>
                    )}
                    <Text
                        variant="caption"
                        ml={isOwner && !hasInvoiceItemColumn ? 0 : 3}
                        mt={isOwner && !hasInvoiceItemColumn ? 0 : 3}
                    >
                        {t(isOwner ? "components.gasIndex" : "components.gasIndexFromPartner")}
                    </Text>
                </>
            );
        case "quantity":
            return (
                <>
                    {isOwner && <AbsoluteTitleFreeSpace />}
                    <NumberInput
                        disabled
                        onChange={() => null}
                        leftIcon="horizontalAttach"
                        value={parseFloat(fuelSurchargeLine.quantity)}
                        units={"%"}
                        data-testid="fuel-surcharge-value"
                    />
                </>
            );
        case "price":
            return (
                <>
                    {isOwner && <AbsoluteTitleFreeSpace />}
                    <Text textAlign="right" mt={2}>
                        {formatNumber(totalFuelSurchargePrice, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                </>
            );
        case "priceAndVat": {
            const vat = fuelSurchargeLine?.invoice_item?.tax_code?.tax_rate
                ? parseFloat(fuelSurchargeLine.invoice_item.tax_code.tax_rate) / 100
                : undefined;
            return (
                <>
                    {isOwner && <AbsoluteTitleFreeSpace />}
                    <Text textAlign="right">
                        {formatNumber(totalFuelSurchargePrice, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                    <Flex justifyContent="flex-end">
                        <TooltipWrapper
                            content={vat === undefined ? t("pricing.fillInvoiceItem") : null}
                        >
                            <Text textAlign="right" variant="subcaption">
                                {t("components.VAT")}{" "}
                                {formatNumber(vat, {
                                    style: "percent",
                                    maximumFractionDigits: 2,
                                })}
                            </Text>
                        </TooltipWrapper>
                    </Flex>
                </>
            );
        }
        case "delete":
            return (
                <>
                    {isOwner && <AbsoluteTitleFreeSpace />}
                    <Flex justifyContent="center">
                        <IconButton
                            type="button"
                            name="bin"
                            fontSize={3}
                            color="grey.dark"
                            onClick={() => {
                                onDeleteFuelSurchargeLine();
                            }}
                        />
                    </Flex>
                </>
            );
        default:
            return null;
    }
};
