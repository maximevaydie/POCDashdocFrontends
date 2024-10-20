import {apiService} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedCreatableSelect,
    Box,
    Flex,
    Icon,
    Link,
    AsyncPaginatedSelectProps,
    CreatableSelectProps,
    FiltersSelectAsyncPaginatedProps,
    Text,
    theme,
} from "@dashdoc/web-ui";
import React, {FunctionComponent, useCallback} from "react";
import {components} from "react-select";

export const PurchaseCostTemplateSelect: FunctionComponent<
    Partial<CreatableSelectProps & AsyncPaginatedSelectProps>
> = ({...props}) => {
    const searchPurchaseCostTemplate: FiltersSelectAsyncPaginatedProps["loadOptions"] =
        useCallback(async (text: string, _: any, {page}: {page: number}) => {
            try {
                const response = await apiService.get(
                    `purchase-cost-template/?${queryService.toQueryString({
                        text,
                        page: page ?? 1,
                    })}`,
                    {apiVersion: "web"}
                );

                return {
                    options: response.results,
                    hasMore: !!response.next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                return {
                    options: [],
                    hasMore: false,
                };
            }
        }, []);

    return (
        <AsyncPaginatedCreatableSelect
            autoFocus
            menuIsOpen
            blurInputOnSelect
            isClearable={false}
            placeholder={<Text color="grey.default">{t("common.search")}</Text>}
            components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: () => null,
                ValueContainer: ({children, ...props}) => (
                    <components.ValueContainer {...props}>
                        <Icon name="search" position="absolute" left={3} />
                        {children}
                    </components.ValueContainer>
                ),
                Option: ({children, ...props}) => {
                    // Add new option case
                    if (props.data.__isNew__) {
                        return props.options.length === 1 ? (
                            <Flex mb={2}>
                                <Icon
                                    mr={2}
                                    color="grey.default"
                                    name="accountingCalculator"
                                    svgWidth={"36px"}
                                    svgHeight={"36px"}
                                />
                                <Box>
                                    <Text>
                                        {t("purchaseCosts.noPurchaseCostsRecordedInTheCatalog")}
                                        <Link
                                            ml={1}
                                            target="#"
                                            rel="noopener noreferrer"
                                            color="blue.default"
                                            data-testid="add-purchase-cost-manually-link"
                                            onClick={() => props.selectOption(props.data)}
                                        >
                                            {t("purchaseCosts.addAPurchaseCost")}
                                        </Link>
                                    </Text>
                                </Box>
                            </Flex>
                        ) : (
                            <Flex px={2} pb={2}>
                                <Link
                                    target="#"
                                    rel="noopener noreferrer"
                                    color="blue.default"
                                    data-testid="add-purchase-cost-manually-link"
                                    fontSize={2}
                                    onClick={() => props.selectOption(props.data)}
                                >
                                    {t("purchaseCosts.addPurchaseCostManually")}
                                </Link>
                            </Flex>
                        );
                    }

                    // Select existing option case
                    return <components.Option {...props}>{children}</components.Option>;
                },
            }}
            styles={{
                valueContainer: (base) => ({
                    ...base,
                    paddingLeft: theme.space[7],
                }),
                menuList: (base) => ({
                    ...base,
                    paddingBottom: 0,
                    maxHeight: "146px",
                }),
                menu: (base) => ({
                    ...base,
                    boxShadow: "none",
                    position: "unset",
                }),
            }}
            loadOptions={searchPurchaseCostTemplate}
            getOptionLabel={(element) => {
                if (element.__isNew__) {
                    return element.label;
                }

                return element.description;
            }}
            isValidNewOption={() => true}
            {...props}
        />
    );
};
