import {useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Box,
    Button,
    FiltersSelectAsyncPaginatedProps,
    Flex,
    Popover,
    theme,
} from "@dashdoc/web-ui";
import {RequestedVehicle} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

import {TariffGrid, TariffGridRequestedVehicle} from "app/features/pricing/tariff-grids/types";
import {fetchSearchRequestedVehicles} from "app/redux/actions/requested-vehicles";
import {REQUESTED_VEHICLE_QUERY_NAME} from "app/types/constants";

interface Props {
    tariffGrid: TariffGrid;
    onChange: (requestedVehicle: TariffGridRequestedVehicle[]) => unknown;
}

export function EditRequestedVehiclesAction({tariffGrid, onChange}: Props) {
    const dispatch = useDispatch();

    const [requestedVehicles, setRequestedVehicles] = useState(initialRequestedVehicles());

    useEffect(() => {
        setRequestedVehicles(initialRequestedVehicles());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tariffGrid.requested_vehicles]);

    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = async (
        text: string,
        _: TariffGridRequestedVehicle[],
        additional?: {page: number}
    ): Promise<{
        options: TariffGridRequestedVehicle[];
        hasMore: boolean | undefined;
        additional?: {page: number};
    }> => {
        const page = additional?.page || 1;

        try {
            const searchResponse = await dispatch(
                fetchSearchRequestedVehicles(REQUESTED_VEHICLE_QUERY_NAME, {text: [text]}, page)
            );

            const results = searchResponse?.response?.entities?.["requested-vehicles"];
            let items: RequestedVehicle[] = results ? Object.values(results) : [];

            return {
                // the endpoint outputs RequestedVehicle[], but we return them as TariffGridRequestedVehicle (a subtype) in this component
                options: items,
                hasMore: searchResponse?.response?.next != null,
                additional: {
                    page: page + 1,
                },
            };
        } catch (error) {
            Logger.error(error);
            return {
                options: [],
                hasMore: undefined,
                additional: undefined,
            };
        }
    };

    return (
        <Popover placement="bottom-start" onClose={() => onChange(requestedVehicles)}>
            <Popover.Trigger>
                <Flex>
                    <Button mt={3} variant={"plain"} data-testid={"edit-requestedVehicle-button"}>
                        {t("tariffGrids.EditClients")}
                    </Button>
                </Flex>
            </Popover.Trigger>
            <Popover.Content width="400px">
                <Box width="100%">
                    <AsyncPaginatedSelect
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: theme.zIndices.topbar,
                            }),
                        }}
                        isMulti={true}
                        value={requestedVehicles}
                        loadOptions={loadOptions}
                        defaultOptions={true}
                        getOptionValue={getOptionValue}
                        formatOptionLabel={formatOptionLabel}
                        closeMenuOnSelect={false}
                        onChange={(options: TariffGridRequestedVehicle[]) => {
                            setRequestedVehicles(
                                options.sort((a, b) => {
                                    return a.label.localeCompare(b.label);
                                })
                            );
                        }}
                    />
                </Box>
            </Popover.Content>
        </Popover>
    );

    function initialRequestedVehicles() {
        return [...tariffGrid.requested_vehicles].sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
    }

    function getOptionValue(requestedVehicle: TariffGridRequestedVehicle) {
        return requestedVehicle.uid ?? "";
    }

    function formatOptionLabel(requestedVehicle: TariffGridRequestedVehicle) {
        return <Flex style={{gap: "8px"}}>{requestedVehicle.label}</Flex>;
    }
}
