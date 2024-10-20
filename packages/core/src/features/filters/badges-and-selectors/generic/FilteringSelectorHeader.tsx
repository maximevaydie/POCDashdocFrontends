import {t} from "@dashdoc/web-core";
import {Box, Flex, FloatingMenu, ItemSelector, Text} from "@dashdoc/web-ui";
import React from "react";

type Item = {
    label: string;
    headerLabel?: string;
    id: string;
};

type Props = {
    dataType: {
        label?: string;
        options: Array<Item>;
        value: string;
        onChange: (value: string) => void;
    };
    condition: {
        options: Array<Item>;
        value: string;
        onChange: (value: string) => void;
    };
};
export function FilteringSelectorHeader({dataType, condition}: Props) {
    const selectedDataType =
        dataType.options.find((option) => dataType.value === option.id) || dataType.options[0];
    const selectedCondition =
        condition.options.find((option) => condition.value === option.id) || condition.options[0];

    const dataTypeHeaderLabel =
        selectedDataType.headerLabel !== undefined
            ? selectedDataType.headerLabel
            : selectedDataType.label;
    const conditionHeaderLabel =
        selectedCondition.headerLabel !== undefined
            ? selectedCondition.headerLabel
            : selectedCondition.label;
    return (
        <Box borderBottom="1px solid" borderColor="grey.light" width="100%">
            {dataType.options.length > 1 || condition.options.length > 1 ? (
                <FloatingMenu
                    label={
                        <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            flex={1}
                            data-testid="filter-selector-header"
                        >
                            <FilteringHeader
                                dataTypeLabel={dataTypeHeaderLabel}
                                conditionLabel={conditionHeaderLabel}
                                withContainer={false}
                            />
                        </Flex>
                    }
                    withSubMenuArrow={true}
                >
                    {dataType.options.length > 1 && (
                        <Box data-testid="data-type-selection">
                            {dataType.label && (
                                <Text variant="subcaption" color="grey.dark" mt={1} px={2}>
                                    {dataType.label}
                                </Text>
                            )}
                            <ItemSelector
                                items={dataType.options}
                                value={dataType.value}
                                onChange={dataType.onChange}
                            />
                        </Box>
                    )}
                    {condition.options.length > 1 && (
                        <>
                            <Text variant="subcaption" color="grey.dark" mt={1} px={2}>
                                {t("filter.condition")}
                            </Text>
                            <ItemSelector
                                items={condition.options}
                                value={condition.value}
                                onChange={condition.onChange}
                            />
                        </>
                    )}
                </FloatingMenu>
            ) : (
                <FilteringHeader
                    dataTypeLabel={dataTypeHeaderLabel}
                    conditionLabel={conditionHeaderLabel}
                />
            )}
        </Box>
    );
}
export function FilteringHeader({
    dataTypeLabel,
    conditionLabel,
    withContainer = true,
}: {
    dataTypeLabel: string;
    conditionLabel: string;
    withContainer?: boolean;
}) {
    return (
        <Box
            borderBottom={withContainer ? "1px solid" : undefined}
            borderColor="grey.light"
            py={withContainer ? 1 : 0}
            px={withContainer ? 3 : 0}
        >
            <Text variant="h2">{dataTypeLabel}</Text>
            <Text variant="caption" color="grey.dark">
                {conditionLabel}
            </Text>
        </Box>
    );
}
