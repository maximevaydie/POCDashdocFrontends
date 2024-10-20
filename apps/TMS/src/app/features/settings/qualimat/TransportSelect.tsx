import {apiService, getConnectedCompany, useTimezone} from "@dashdoc/web-common";
import {getLoadText, t} from "@dashdoc/web-core";
import {AsyncPaginatedSelect, Box, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, useToggle} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {useMemo} from "react";

import {useSelector} from "app/redux/hooks";

import type {TransportListWeb} from "app/types/transport_list_web";

type TransportSelectProps = {
    onChange: (uid: string) => void;
    error?: string;
    required?: boolean;
    fleetType: "vehicles" | "trailers";
    fleetItemId: number;
};

export default function TransportSelect({
    onChange,
    error,
    required,
    fleetType,
    fleetItemId,
}: TransportSelectProps) {
    const [isLoading, startLoading, stopLoading] = useToggle(false);
    const company = useSelector(getConnectedCompany);

    const debouncedSearchTransports = useMemo(
        () =>
            debounce(
                (search, _, {page}) =>
                    new Promise<{
                        options: TransportListWeb[];
                        hasMore: boolean;
                        additional: {page: number};
                    }>((resolve, reject) => {
                        startLoading();
                        searchTransports(
                            search,
                            page,
                            company?.pk,
                            fleetType === "vehicles" ? fleetItemId : undefined,
                            fleetType === "trailers" ? fleetItemId : undefined
                        )
                            .then(({results, next}) => {
                                stopLoading();
                                resolve({
                                    options: results,
                                    hasMore: !!next,
                                    additional: {
                                        page: page + 1,
                                    },
                                });
                            })
                            .catch((error) => {
                                stopLoading();
                                reject(error);
                            });
                    }),
                1000,
                {
                    leading: true,
                }
            ),
        []
    );

    return (
        <>
            <AsyncPaginatedSelect
                isLoading={isLoading}
                label={t("common.transport")}
                placeholder={t("screens.transports.searchBarPlaceholder")}
                loadOptions={debouncedSearchTransports}
                getOptionValue={({uid}) => uid}
                getOptionLabel={(transport) => transport.sequential_id.toString()}
                formatOptionLabel={(transport: TransportListWeb) => {
                    return <TransportOption transport={transport} />;
                }}
                styles={{
                    valueContainer: (provided, {selectProps: {label}}) => ({
                        ...provided,
                        height: label ? "6.5em" : "5.5em",
                    }),
                    singleValue: (provided, {selectProps: {label}}) => ({
                        ...provided,
                        ...(label && {top: "24%"}),
                    }),
                    menu: (provided) => ({
                        ...provided,
                        maxHeight: "400px",
                    }),
                }}
                onChange={(transport) =>
                    onChange((transport as TransportListWeb)?.uid ?? undefined)
                }
                required={required}
                error={error}
                data-testid="transport-select"
            />
        </>
    );
}

function TransportOption({transport}: {transport: TransportListWeb}) {
    const timezone = useTimezone();
    return (
        <Box>
            <Text variant="h2" ellipsis color="inherit" flex={1} lineHeight={1}>
                {t("cmr.number")} {transport.sequential_id}
            </Text>
            <Text ellipsis flex={1} color="inherit" lineHeight={1} mt={-1} mb={-1}>
                {getLoads()}
            </Text>

            <Text ellipsis flex={1} color="inherit" variant="caption" lineHeight={1}>
                {getShipperName() && t("common.for") + " " + getShipperName()}
                {getRealDateOfFirstActivity() &&
                    ", " + t("common.dateOn") + " " + getRealDateOfFirstActivity()}
            </Text>
        </Box>
    );

    function getShipperName() {
        return transport.shipper.name;
    }

    function getLoads() {
        if (transport.deliveries.length === 0) {
            return null;
        }

        const deliveries_loads = transport.deliveries.map((delivery) => delivery.loads).flat();
        return deliveries_loads.map((load) => getLoadText(load)).join("\n");
    }

    function getRealDateOfFirstActivity() {
        const firstActivity = transport.segments[0]?.origin;
        if (!firstActivity || !firstActivity.real_end) {
            return "";
        }
        return formatDate(parseAndZoneDate(firstActivity.real_end, timezone), "P");
    }
}

const searchTransports = (
    search: string,
    page: number,
    carrier_id?: number,
    vehicle_id?: number,
    trailer_id?: number
): Promise<{results: TransportListWeb[]; next: boolean}> => {
    const query: any = {
        text: search,
        page,
        archived: false,
    };
    if (carrier_id) {
        // The API expects comma separated strings and not list for `_in` filters
        query["carrier__in"] = [carrier_id].join(",");
    }
    if (vehicle_id) {
        // The API expects comma separated strings and not list for `_in` filters
        query["vehicle__in"] = [vehicle_id].join(",");
    }
    if (trailer_id) {
        // The API expects comma separated strings and not list for `_in` filters
        query["trailer__in"] = [trailer_id].join(",");
    }
    return apiService.post("/transports/list/", {filters: query}, {apiVersion: "web"});
};
