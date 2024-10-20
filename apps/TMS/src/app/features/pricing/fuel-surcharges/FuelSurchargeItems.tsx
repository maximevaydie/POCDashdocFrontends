import {t} from "@dashdoc/web-core";
import {Badge, Flex, Icon, Table, Text, TooltipWrapper, theme} from "@dashdoc/web-ui";
import {FuelSurchargeItem, formatDate, formatNumber} from "dashdoc-utils";
import React, {CSSProperties, useMemo} from "react";

import {FuelSurchargeItemTooltip} from "app/features/pricing/fuel-surcharges/FuelSurchargeItemTooltip";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {FuelSurchargeAgreementWithSurchargeItems} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";

type FuelSurchargeItemColumnName =
    | "start_date"
    | "fuel_price"
    | "variation"
    | "fuel_part"
    | "computed_rate";

type FuelSurchargeItemColumn = {
    name: FuelSurchargeItemColumnName;
    width: string;
    getLabel: () => string;
};

const fuelSurchargeItemColumns: FuelSurchargeItemColumn[] = [
    {width: "1em", name: "start_date", getLabel: () => t("fuelSurcharges.applicationDate")},
    {width: "1em", name: "fuel_price", getLabel: () => t("fuelSurcharges.newPrice")},
    {width: "1em", name: "variation", getLabel: () => t("fuelSurcharges.variation")},
    {width: "1em", name: "fuel_part", getLabel: () => t("fuelSurcharges.fuelPart")},
    {width: "1em", name: "computed_rate", getLabel: () => t("fuelSurcharges.fuelSurcharge")},
];

type FuelSurchargeItemsProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
};

export function FuelSurchargeItems({fuelSurchargeAgreement}: FuelSurchargeItemsProps) {
    const fuelSurchargeItems = useMemo(() => {
        return [...fuelSurchargeAgreement.fuel_surcharge_items].reverse();
    }, [fuelSurchargeAgreement]);

    return (
        <Table
            height="100%"
            columns={fuelSurchargeItemColumns}
            rows={fuelSurchargeItems}
            getRowCellContent={getRowCellContent}
            getRowCellStyle={(_, columnName, index) => getRowCellStyle(columnName, index)}
        />
    );

    function getRowCellContent(
        fuelSurchargeItem: FuelSurchargeItem,
        columnName: FuelSurchargeItemColumnName,
        index: number
    ) {
        let variation;

        switch (columnName) {
            case "start_date": {
                const dateText = (
                    <Text>{formatDate(fuelSurchargeItem.start_date, "dd/MM/yyyy")}</Text>
                );
                if (index === 0) {
                    return (
                        <Flex flexDirection="column">
                            <Flex
                                backgroundColor={"blue.ultralight"}
                                borderRadius={1}
                                position="absolute"
                                pl={3}
                                pr={2}
                                py={1}
                            >
                                <Text whiteSpace="nowrap" fontSize={1}>
                                    {t("fuelSurcharges.lastFuelSurcharge")}
                                </Text>
                            </Flex>
                            <Flex mt={7} ml={3}>
                                {dateText}
                            </Flex>
                        </Flex>
                    );
                }
                return dateText;
            }
            case "fuel_price":
                return (
                    <Text>
                        {formatNumber(fuelSurchargeItem.fuel_price, {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 4,
                        })}
                    </Text>
                );
            case "variation":
                variation =
                    parseFloat(fuelSurchargeItem.fuel_price) /
                        fuelSurchargeAgreement.reference_price -
                    1;
                return (
                    <Text>
                        {formatNumber(variation, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                    </Text>
                );
            case "fuel_part":
                return (
                    <Text>
                        {formatNumber(fuelSurchargeAgreement.fuel_part / 100, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                    </Text>
                );
            case "computed_rate":
                return (
                    <Badge
                        shape="squared"
                        height="30px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        variant={fuelSurchargeService.getFuelSurchargeBadgeVariant(
                            parseFloat(fuelSurchargeItem.computed_rate)
                        )}
                    >
                        <Text
                            variant="captionBold"
                            color={fuelSurchargeService.getFuelSurchargeImpactBadgeColor(
                                parseFloat(fuelSurchargeItem.computed_rate)
                            )}
                        >
                            <Flex style={{columnGap: "4px"}}>
                                {formatNumber(+fuelSurchargeItem.computed_rate / 100, {
                                    style: "percent",
                                    maximumFractionDigits: 2,
                                })}
                                <TooltipWrapper
                                    boxProps={{display: "flex", alignItems: "center"}}
                                    placement="bottom"
                                    content={
                                        <FuelSurchargeItemTooltip
                                            fuelSurchargeItem={fuelSurchargeItem}
                                            fuelSurchargeAgreement={fuelSurchargeAgreement}
                                        />
                                    }
                                >
                                    <Icon name="info" strokeWidth={2} />
                                </TooltipWrapper>
                            </Flex>
                        </Text>
                    </Badge>
                );
        }
    }

    function getRowCellStyle(columnName: string, index?: number): CSSProperties {
        if (index !== 0) {
            return {};
        }
        const borderBottom = `3px solid ${theme.colors.grey.light}`;
        if (columnName === "start_date") {
            return {
                paddingLeft: 0,
                borderLeft: `5px solid ${theme.colors.blue.default}`,
                borderBottom,
            };
        }
        return {
            verticalAlign: "bottom",
            borderBottom,
        };
    }
}
