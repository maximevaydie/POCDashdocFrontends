import {apiService, useFeatureFlag, type PartnerInListOutput} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Box,
    Button,
    FiltersSelectAsyncPaginatedProps,
    Flex,
    Popover,
    theme,
    toast,
} from "@dashdoc/web-ui";
import React, {useCallback, useEffect, useState} from "react";

import {TariffGrid, TariffGridOwnerType} from "app/features/pricing/tariff-grids/types";

import type {APIListResponse} from "dashdoc-utils";

interface EditClientActionProps {
    tariffGrid: TariffGrid;
    onChange: (clients: {pk: number; name: string}[]) => unknown;
}

export function EditClientActionDeprecated({tariffGrid, onChange}: EditClientActionProps) {
    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const [clients, setClients] = useState(
        [...tariffGrid.customers].sort((clientA, clientB) => {
            return clientA.name.localeCompare(clientB.name);
        })
    );

    useEffect(() => {
        setClients(
            [...tariffGrid.customers].sort((clientA, clientB) => {
                return clientA.name.localeCompare(clientB.name);
            })
        );
    }, [tariffGrid.customers]);

    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
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
                toast.error(t("tariffGrids.CouldNotFetchShippers"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        []
    );
    return (
        <Popover placement="bottom-start" onClose={() => onChange(clients)}>
            <Popover.Trigger>
                <Flex>
                    <Button mt={3} variant={"plain"} data-testid={"edit-client-button"}>
                        {t("tariffGrids.EditClients")}
                    </Button>
                </Flex>
            </Popover.Trigger>
            <Popover.Content width="400px">
                <Box p={2} width="100%">
                    <AsyncPaginatedSelect
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: theme.zIndices.topbar,
                            }),
                        }}
                        isMulti={true}
                        value={clients}
                        loadOptions={loadOptions}
                        data-testid={"edit-client-select"}
                        defaultOptions={true}
                        getOptionValue={({pk}) => pk}
                        getOptionLabel={({name}) => name}
                        closeMenuOnSelect={false}
                        onChange={(options) => {
                            setClients(
                                (options as {pk: number; name: string}[]).sort(
                                    (clientA, clientB) => {
                                        return clientA.name.localeCompare(clientB.name);
                                    }
                                )
                            );
                        }}
                    />
                </Box>
            </Popover.Content>
        </Popover>
    );
}
