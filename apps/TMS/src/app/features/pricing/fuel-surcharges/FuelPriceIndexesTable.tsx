import {t} from "@dashdoc/web-core";
import {DatePicker, Link, NumberInput, Table, Text} from "@dashdoc/web-ui";
import {formatDate, formatNumber, FuelPriceIndex} from "dashdoc-utils";
import React, {useCallback, useState} from "react";

import {UpdatedFuelPriceIndex} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexesUpdateFormModal";

type FuelPriceIndexesTableProps = {
    onChange: (fuelPriceIndexes: UpdatedFuelPriceIndex[]) => void;
    onSelect: (fuelPriceIndex: UpdatedFuelPriceIndex | null) => void;
    fuelPriceIndexes: FuelPriceIndex[];
    hasNextPage?: boolean;
    isLoading?: boolean;
    loadNextPage?: () => void;
};

type FuelPriceIndexColumnName =
    | "name"
    | "source"
    | "last_update_date"
    | "last_update_price"
    | "application_date"
    | "updated_price";

type FuelPriceIndexColumn = {
    name: FuelPriceIndexColumnName;
    width: string;
    getLabel: () => string;
};

const fuelPriceIndexColumns: FuelPriceIndexColumn[] = [
    {width: "1em", name: "name", getLabel: () => t("fuelSurcharges.nameFuelPriceIndex")},
    {width: "1em", name: "source", getLabel: () => t("fuelSurcharges.source")},
    {width: "1em", name: "last_update_date", getLabel: () => t("fuelSurcharges.lastUpdateDate")},
    {width: "1em", name: "last_update_price", getLabel: () => t("fuelSurcharges.lastUpdatePrice")},
    {width: "3em", name: "application_date", getLabel: () => t("fuelSurcharges.applicationDate")},
    {width: "3em", name: "updated_price", getLabel: () => t("fuelSurcharges.newFuelPriceIndex")},
];

export const FuelPriceIndexesTable: React.FC<FuelPriceIndexesTableProps> = ({
    onChange,
    onSelect,
    fuelPriceIndexes,
    hasNextPage = false,
    isLoading = false,
    loadNextPage = () => null,
}) => {
    const [updatedFuelPriceIndexes, setUpdatedFuelPriceIndexes] = useState<
        UpdatedFuelPriceIndex[]
    >([]);

    const isUpdatedFuelPriceIndexValid = (updatedFuelPriceIndex: UpdatedFuelPriceIndex) => {
        return !!updatedFuelPriceIndex?.updated_price && !!updatedFuelPriceIndex?.application_date;
    };

    const onNextPage = useCallback(() => {
        if (hasNextPage) {
            loadNextPage();
        }
    }, [hasNextPage, loadNextPage]);

    const onSelectFuelPrixIndex = (fuelPriceIndex: FuelPriceIndex) => {
        const updatedFuelPriceIndex = updatedFuelPriceIndexes.find(
            (updatedFuelPriceIndex) => updatedFuelPriceIndex.uid === fuelPriceIndex.uid
        );
        if (updatedFuelPriceIndex && isUpdatedFuelPriceIndexValid(updatedFuelPriceIndex)) {
            onSelect(updatedFuelPriceIndex);
        } else {
            onSelect(null);
        }
    };

    const onChangeFuelPriceIndex = (
        property: "application_date" | "updated_price",
        value: any,
        updatedFuelPrixIndexIdx: number,
        fuelPriceIndex: FuelPriceIndex
    ) => {
        const copyUpdatedFuelPriceIndexes = [...updatedFuelPriceIndexes];
        let updatedFuelPriceIndex: UpdatedFuelPriceIndex;
        if (updatedFuelPrixIndexIdx !== -1) {
            copyUpdatedFuelPriceIndexes[updatedFuelPrixIndexIdx][property] = value;
            updatedFuelPriceIndex = copyUpdatedFuelPriceIndexes[updatedFuelPrixIndexIdx];
        } else {
            copyUpdatedFuelPriceIndexes.push({...fuelPriceIndex, [property]: value});
            updatedFuelPriceIndex =
                copyUpdatedFuelPriceIndexes[copyUpdatedFuelPriceIndexes.length - 1];
        }
        setUpdatedFuelPriceIndexes(copyUpdatedFuelPriceIndexes);

        if (isUpdatedFuelPriceIndexValid(updatedFuelPriceIndex)) {
            onSelect(updatedFuelPriceIndex);
        } else {
            onSelect(null);
        }

        onChange(
            copyUpdatedFuelPriceIndexes.filter(
                (item) => !!item?.updated_price && !!item?.application_date
            )
        );
    };

    const getRowCellContent = (
        fuelPriceIndex: FuelPriceIndex,
        columnName: FuelPriceIndexColumnName
    ) => {
        const updatedFuelPriceIndexIdx = updatedFuelPriceIndexes.findIndex(
            (item: UpdatedFuelPriceIndex) => item.uid == fuelPriceIndex.uid
        );
        const isUpdatedFuelPriceIndex = updatedFuelPriceIndexIdx !== -1;
        switch (columnName) {
            case "source":
                return (
                    <Link
                        style={{wordBreak: "break-all"}}
                        href={fuelPriceIndex[columnName]}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {fuelPriceIndex[columnName]}
                    </Link>
                );
            case "last_update_date":
                return <Text>{formatDate(fuelPriceIndex[columnName], "dd/MM/yyyy")}</Text>;
            case "last_update_price":
                return (
                    <Text>
                        {formatNumber(fuelPriceIndex[columnName], {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 4,
                        })}
                    </Text>
                );
            case "application_date": {
                const date = isUpdatedFuelPriceIndex
                    ? updatedFuelPriceIndexes[updatedFuelPriceIndexIdx]?.application_date ?? null
                    : null;

                return (
                    <DatePicker
                        clearable
                        label={t("common.date")}
                        date={date}
                        onChange={(date) => {
                            onChangeFuelPriceIndex(
                                "application_date",
                                date,
                                updatedFuelPriceIndexIdx,
                                fuelPriceIndex
                            );
                        }}
                        rootId="react-app-modal-root"
                    />
                );
            }
            case "updated_price": {
                const value = isUpdatedFuelPriceIndex
                    ? updatedFuelPriceIndexes[updatedFuelPriceIndexIdx]?.updated_price ?? null
                    : null;

                return (
                    <NumberInput
                        required
                        min={0}
                        maxDecimals={4}
                        units="€"
                        textAlign="left"
                        label={t("common.price")}
                        value={value}
                        onChange={() => null}
                        onTransientChange={(price) => {
                            onChangeFuelPriceIndex(
                                "updated_price",
                                price as number,
                                updatedFuelPriceIndexIdx,
                                fuelPriceIndex
                            );
                        }}
                    />
                );
            }
            default:
                return <Text style={{wordBreak: "break-all"}}>{fuelPriceIndex[columnName]}</Text>;
        }
    };

    return (
        <Table
            height="40em"
            columns={fuelPriceIndexColumns}
            rows={fuelPriceIndexes}
            getRowCellContent={getRowCellContent}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            onEndReached={onNextPage}
            onClickOnRow={onSelectFuelPrixIndex}
        />
    );
};
