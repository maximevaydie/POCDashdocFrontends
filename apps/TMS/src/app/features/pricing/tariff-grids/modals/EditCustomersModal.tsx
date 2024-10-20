import {apiService, useFeatureFlag, type PartnerInListOutput} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Box,
    Card,
    Flex,
    Icon,
    Modal,
    OutlinedBigIconAndTextButton,
    Text,
    theme,
    toast,
} from "@dashdoc/web-ui";
import React, {useCallback, useState} from "react";
import {LoadOptions} from "react-select-async-paginate";

import {
    TariffGrid,
    TariffGridCustomer,
    TariffGridOwnerType,
} from "app/features/pricing/tariff-grids/types";

import type {APIListResponse} from "dashdoc-utils";

interface Props {
    tariffGrid: TariffGrid;
    onChange: (newAllCustomers: boolean, newCustomers: TariffGridCustomer[]) => void;
    onClose: () => void;
}

export function EditCustomersModal({tariffGrid, onChange, onClose}: Props) {
    const [isAllCustomers, setAllCustomers] = useState(tariffGrid.is_all_customers);
    const [customers, setCustomers] = useState(
        [...tariffGrid.customers].sort((a, b) => a.name.localeCompare(b.name))
    );

    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;

    return (
        <Modal
            title={t(isPurchaseTariffGrid ? "common.carriers" : "common.shippers")}
            onClose={onClose}
            secondaryButton={{onClick: onClose}}
            mainButton={{
                onClick: () => {
                    onChange(isAllCustomers, customers);
                    onClose();
                },
                children: t("common.validate"),
            }}
        >
            <Flex flexDirection={"row"} justifyContent={"flex-start"} style={{gap: 12}}>
                <OutlinedBigIconAndTextButton
                    iconName={isPurchaseTariffGrid ? "carrier" : "shipper"}
                    onClick={() => {
                        setAllCustomers(true);
                        setCustomers([]);
                    }}
                    active={isAllCustomers}
                    label={t(
                        isPurchaseTariffGrid
                            ? "tariffGrids.allCarriers"
                            : "tariffGrids.allShippers"
                    )}
                    flexGrow={0}
                    dataTestId={"edit-customer-select-all"}
                />
                <OutlinedBigIconAndTextButton
                    iconName={"cursorSelect"}
                    onClick={() => {
                        setAllCustomers(false);
                    }}
                    active={!isAllCustomers}
                    label={t(
                        isPurchaseTariffGrid
                            ? "tariffGrids.selectionOfCarriers"
                            : "tariffGrids.selectionOfShippers"
                    )}
                    flexGrow={0}
                    dataTestId={"edit-customer-select-selection"}
                />
            </Flex>
            {isAllCustomers ? (
                <Card boxShadow={0} backgroundColor="grey.ultralight" p={2} my={3}>
                    <Flex alignItems="center" justifyContent="center">
                        <Icon name="info" color="info" mr={2} />
                        <Text>
                            {t(
                                isPurchaseTariffGrid
                                    ? "tariffGrids.canBeAppliedToAllCarriers"
                                    : "tariffGrids.canBeAppliedToAllShippers"
                            )}
                        </Text>
                    </Flex>
                </Card>
            ) : (
                <Flex my={3}>
                    <Box width="400px">
                        <CustomerSelect
                            customers={customers}
                            isPurchaseTariffGrid={isPurchaseTariffGrid}
                            onChange={(customers) => setCustomers(customers)}
                        />
                    </Box>
                </Flex>
            )}
        </Modal>
    );
}

function CustomerSelect({
    customers,
    isPurchaseTariffGrid,
    onChange,
}: {
    customers: TariffGridCustomer[];
    isPurchaseTariffGrid: boolean;
    onChange: (customers: TariffGridCustomer[]) => void;
}) {
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    const loadOptions: LoadOptions<TariffGridCustomer, {page: number}> = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const options: {pk: number; name: string}[] = [];
                let hasMore = false;
                const category = isPurchaseTariffGrid ? "carrier" : "shipper";
                if (hasBetterCompanyRolesEnabled) {
                    const path = `partners/?${queryService.toQueryString({
                        text,
                        page,
                        role__in: category,
                    })}`;
                    const {results, next}: APIListResponse<PartnerInListOutput> =
                        await apiService.get(path, {
                            apiVersion: "web",
                        });
                    options.push(...results.map(({pk, name}) => ({pk, name})));
                    hasMore = !!next;
                } else {
                    const {results, next} = await apiService.Companies.getAll({
                        query: {
                            text,
                            page,
                            category,
                        },
                    });
                    options.push(...results.map(({pk, name}) => ({pk, name})));
                    hasMore = !!next;
                }

                return {
                    options,
                    hasMore,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("common.error"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [isPurchaseTariffGrid, hasBetterCompanyRolesEnabled]
    );

    return (
        <AsyncPaginatedSelect<TariffGridCustomer>
            menuPortalTarget={document.body}
            styles={{
                menuPortal: (base) => ({
                    ...base,
                    zIndex: theme.zIndices.topbar,
                }),
            }}
            isMulti
            value={customers}
            loadOptions={loadOptions}
            data-testid={"edit-customer-select"}
            defaultOptions
            getOptionValue={({pk}) => pk.toString()}
            getOptionLabel={({name}) => name}
            closeMenuOnSelect={false}
            onChange={onChange}
        />
    );
}
