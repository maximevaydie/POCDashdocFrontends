import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {t} from "@dashdoc/web-core";
import {Flex, Table, Text} from "@dashdoc/web-ui";
import {FuelPriceIndex} from "dashdoc-utils";
import React, {useCallback} from "react";

import {FuelPriceIndexesActions} from "app/features/pricing/fuel-surcharges/actions/FuelPriceIndexesActions";

type FuelPriceIndexColumnName = "name" | "source" | "fuel_surcharge_agreements" | "actions";

type FuelPriceIndexColumn = {
    name: FuelPriceIndexColumnName;
    width: string;
    getLabel: () => string;
};

const fuelPriceIndexColumns: FuelPriceIndexColumn[] = [
    {width: "2em", name: "name", getLabel: () => t("common.name")},
    {width: "3em", name: "source", getLabel: () => t("fuelSurcharges.source")},
    {
        width: "4em",
        name: "fuel_surcharge_agreements",
        getLabel: () => t("fuelSurcharges.fuelSurchargeAgreementsAssociated"),
    },
    {width: "1em", name: "actions", getLabel: () => ""},
];

export const FuelPriceIndexesPanel: React.FC = () => {
    const {
        items: fuelPriceIndexes = [],
        hasNext: hasNextPage,
        loadNext: loadNextPage,
        isLoading,
        reload,
    } = usePaginatedFetch<FuelPriceIndex>("fuel-price-indexes/", {});

    const getRowCellContent = (
        fuelPriceIndex: FuelPriceIndex,
        columnName: FuelPriceIndexColumnName
    ) => {
        switch (columnName) {
            case "fuel_surcharge_agreements":
                return (
                    <Text style={{wordBreak: "break-all"}}>
                        {fuelPriceIndex.fuel_surcharge_agreements
                            .map((agreement) => agreement.name)
                            .join(", ")}
                    </Text>
                );
            case "actions":
                return (
                    <FuelPriceIndexesActions
                        fuelPriceIndex={fuelPriceIndex}
                        onActionSuccess={reload}
                    />
                );

            default:
                return <Text style={{wordBreak: "break-all"}}>{fuelPriceIndex[columnName]}</Text>;
        }
    };

    const onNextPage = useCallback(() => {
        if (hasNextPage) {
            loadNextPage();
        }
    }, [hasNextPage, loadNextPage]);

    return (
        <Flex flexDirection="column" style={{rowGap: "12px"}} m="4">
            <Flex justifyContent="space-between">
                <Text variant="h1" alignSelf="center">
                    {t("fuelSurcharges.parameterFuelPriceIndexes")}
                </Text>
            </Flex>
            <Table
                height="calc(100vh - 8em)"
                columns={fuelPriceIndexColumns}
                rows={fuelPriceIndexes}
                getRowCellContent={getRowCellContent}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                onEndReached={onNextPage}
            />
        </Flex>
    );
};
