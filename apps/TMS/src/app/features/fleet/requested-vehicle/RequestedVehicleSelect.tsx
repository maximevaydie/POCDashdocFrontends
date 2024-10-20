import {t} from "@dashdoc/web-core";
import {AsyncCreatableSelect, Box, Text, theme} from "@dashdoc/web-ui";
import {APIListResponse, RequestedVehicle, formatNumber, useToggle} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {useMemo} from "react";

import {RequestedVehicleModal} from "app/features/fleet/requested-vehicle/RequestedVehicleModal";
import {requestedVehiclesApiService} from "app/services/fleet-management/requested-vehicles/requestedVehiclesApi.service";

export interface NewRequestedVehicle {
    label: string;
}

export type KeepExistingRequestedVehicleOption = {
    label: string;
    isKeepExistingRequestedVehicleOption: true;
};

export function getKeepExistingRequestedVehicleOption(): KeepExistingRequestedVehicleOption {
    return {
        label: t("requestedVehicleSelect.keepOriginalValue"),
        isKeepExistingRequestedVehicleOption: true,
    };
}
type NotNewRequestedVehicleOption = RequestedVehicle | KeepExistingRequestedVehicleOption;

export type RequestedVehicleValue = NotNewRequestedVehicleOption | null;

export type RequestedVehicleSelectProps = {
    requestedVehicle?: RequestedVehicleValue | NewRequestedVehicle;
    onChange: (requestedVehicle: RequestedVehicleValue | NewRequestedVehicle) => void;
    error?: string;
    required?: boolean;
    isDisabled?: boolean;
    "data-testid"?: string;
    allowReusingExistingRequestedVehicle?: boolean;
    menuPortalTarget?: HTMLElement;
};

export function RequestedVehicleSelect({
    requestedVehicle,
    onChange,
    error,
    required,
    isDisabled,
    allowReusingExistingRequestedVehicle,
    "data-testid": dataTestId,
    menuPortalTarget,
}: RequestedVehicleSelectProps) {
    const [isLoading, startLoading, stopLoading] = useToggle(false);
    const [createModalParam, setCreateModalParam] = React.useState<string | null>(null);

    const debouncedSearchRequestedVehicles = useMemo(
        () =>
            debounce(
                async (search: string) => {
                    startLoading();
                    try {
                        const {results} = await searchRequestedVehicles(search);
                        if (allowReusingExistingRequestedVehicle && !search) {
                            return [getKeepExistingRequestedVehicleOption(), ...results];
                        } else {
                            return results;
                        }
                    } finally {
                        stopLoading();
                    }
                },
                250,
                {
                    leading: true,
                }
            ),
        [startLoading, stopLoading]
    );
    return (
        <>
            <AsyncCreatableSelect
                isDisabled={isDisabled}
                isLoading={isLoading}
                data-testid={dataTestId}
                label={t("components.requestedVehicle")}
                placeholder={t("transportsForm.vehicleType")}
                loadOptions={debouncedSearchRequestedVehicles}
                defaultOptions={true}
                getOptionValue={({label}) => label}
                getOptionLabel={(requestedVehicle) => requestedVehicle.label}
                formatOptionLabel={(requestedVehicle: RequestedVehicle | NewRequestedVehicle) => {
                    return <RequestedVehicleOption requestedVehicle={requestedVehicle} />;
                }}
                menuPortalTarget={menuPortalTarget}
                formatCreateLabel={(inputValue) => `${t("common.add")} ${inputValue}`}
                styles={{
                    valueContainer: (provided, {selectProps: {label}}) => ({
                        ...provided,
                        height: label ? "5em" : "4em",
                    }),
                    singleValue: (provided, {selectProps: {label}}) => ({
                        ...provided,
                        ...(label && {transform: "translateY(-30%)"}),
                    }),
                    menu: (provided) => ({
                        ...provided,
                        maxHeight: "400px",
                    }),
                    menuPortal: (base) => ({
                        ...base,
                        zIndex: theme.zIndices.topbar,
                    }),
                }}
                value={requestedVehicle}
                onChange={(requestedVehicle: RequestedVehicle | null) => {
                    onChange(requestedVehicle);
                }}
                onCreateOption={setCreateModalParam}
                required={required}
                error={error}
            />

            {createModalParam && (
                <RequestedVehicleModal
                    initialLabel={createModalParam}
                    onClose={() => setCreateModalParam(null)}
                    onSubmit={(requestedVehicle) => {
                        onChange(requestedVehicle);
                        setCreateModalParam(null);
                    }}
                />
            )}
        </>
    );
}

function RequestedVehicleCreateOption({label}: {label: string}) {
    return (
        <Box>
            <Text variant="h2" ellipsis color="inherit" flex={1} lineHeight={1}>
                {label}
            </Text>
        </Box>
    );
}

function KeepExistingRequestedVehicleOption({label}: {label: string}) {
    return (
        <Box>
            <Text ellipsis color="inherit" flex={1} lineHeight={1}>
                {label}
            </Text>
        </Box>
    );
}

function isRequestedVehicle(
    requestedVehicle: NotNewRequestedVehicleOption | NewRequestedVehicle
): requestedVehicle is RequestedVehicle {
    return "uid" in requestedVehicle;
}

function RequestedVehicleOption({
    requestedVehicle,
}: {
    requestedVehicle: NotNewRequestedVehicleOption | NewRequestedVehicle;
}) {
    if ("isKeepExistingRequestedVehicleOption" in requestedVehicle) {
        return <KeepExistingRequestedVehicleOption label={requestedVehicle.label} />;
    }
    if (!isRequestedVehicle(requestedVehicle)) {
        return <RequestedVehicleCreateOption label={requestedVehicle.label} />;
    }

    return (
        <Box>
            <Text ellipsis color="inherit" flex={1} lineHeight={1}>
                {requestedVehicle.label} {requestedVehicle.complementary_information}
            </Text>
            <Text ellipsis flex={1} color="inherit" variant="caption" lineHeight={1}>
                {formatNumber(requestedVehicle.emission_rate, {maximumFractionDigits: 3})}{" "}
                {t("components.requestedVehicle.emissionRateUnit")}
            </Text>
        </Box>
    );
}

const searchRequestedVehicles = (search: string): Promise<APIListResponse<RequestedVehicle>> => {
    return requestedVehiclesApiService.getAll({
        query: {
            text: search,
        },
    });
};
