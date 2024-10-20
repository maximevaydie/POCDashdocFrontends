import {t} from "@dashdoc/web-core";
import {
    AsyncPaginatedCreatableSelect,
    Box,
    Flex,
    Icon,
    FiltersSelectAsyncPaginatedProps,
} from "@dashdoc/web-ui";
import {FuelPriceIndex} from "dashdoc-utils";
import React, {useCallback} from "react";

import {fetchFuelPriceIndexes} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useDispatch} from "app/redux/hooks";

type FuelPriceIndexSelectorProps = {
    errorMessage?: string | null;
    "data-testid"?: string;
    fuelPriceIndex: FuelPriceIndex | null;
    onCreateFuelPriceIndex: () => void;
    onChange: (value: FuelPriceIndex) => void;
};

export const FuelPriceIndexSelector: React.FC<FuelPriceIndexSelectorProps> = ({
    onChange,
    onCreateFuelPriceIndex,
    errorMessage,
    fuelPriceIndex,
    ...props
}) => {
    const dispatch = useDispatch();

    const handleOnChange = (fuelPriceIndex: FuelPriceIndex) => {
        onChange(fuelPriceIndex);
    };

    const getOptionValue = useCallback(({uid}: FuelPriceIndex) => uid, []);
    const getOptionLabel = useCallback(({name}: FuelPriceIndex) => name, []);

    const loadItemsOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = async (
        text: string,
        _,
        {page}: {page: number}
    ) => {
        try {
            const result = await dispatch(fetchFuelPriceIndexes(text, page));
            const items = result.response.results ?? [];

            return {
                options: items,
                hasMore: result.response.next != null,
                additional: {
                    page: page + 1,
                },
            };
        } catch (error) {
            return {
                options: [],
                hasMore: undefined,
            };
        }
    };

    const onFormatOptionLabel = (option: {name?: string; value: string; __isNew__: boolean}) => (
        <>
            {option.__isNew__ ? (
                <Flex alignItems="center">
                    <Icon name="add" mr={1} />
                    {t("fuelSurcharges.createNewFuelPriceIndex")}
                </Flex>
            ) : (
                <Box display="inline-block">{option.name}</Box>
            )}
        </>
    );

    return (
        <AsyncPaginatedCreatableSelect
            required
            defaultOptions
            isClearable={false}
            label={t("fuelSurcharges.index")}
            value={fuelPriceIndex}
            loadOptions={loadItemsOptions}
            onChange={handleOnChange}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            error={errorMessage || ""}
            data-testid={props["data-testid"]}
            formatOptionLabel={onFormatOptionLabel}
            onCreateOption={onCreateFuelPriceIndex}
            isValidNewOption={() => true}
            styles={{
                valueContainer: (provided) => ({
                    ...provided,
                    height: "3.5em",
                }),
            }}
        />
    );
};
