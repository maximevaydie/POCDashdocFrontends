import {t} from "@dashdoc/web-core";
import {Box, Flex, SelectCountry, Text} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useFormContext, useWatch} from "react-hook-form";

import {PlaceAutocompleteInput} from "../../address/PlaceAutocompleteInput";

type Props = {canEditCompany: boolean};

export function AdministrativeAddressFieldset({canEditCompany}: Props) {
    const administrative_address = useWatch({name: "administrative_address"});
    const {setValue, clearErrors} = useFormContext();
    return (
        <Box>
            <Text variant="h1" mb={4}>
                {t("common.administrativeAddress")}
            </Text>
            <Flex flexDirection="column" style={{gap: "10px"}}>
                <Box>
                    <Controller
                        name="administrative_address.address"
                        render={({field, fieldState: {error}}) => (
                            <PlaceAutocompleteInput
                                {...field}
                                data-testid="company-modal-address"
                                complementaryDataAutocomplete={{
                                    postcode: administrative_address?.postcode,
                                    city: administrative_address?.city,
                                }}
                                setValue={setValue}
                                clearError={clearErrors}
                                label={t("common.address")}
                                error={error?.message}
                                disabled={!canEditCompany}
                            />
                        )}
                    />
                </Box>
                <Flex style={{gap: 8}}>
                    <Box flex={2}>
                        <Controller
                            name="administrative_address.postcode"
                            render={({field, fieldState: {error}}) => (
                                <PlaceAutocompleteInput
                                    {...field}
                                    data-testid="company-modal-postcode"
                                    complementaryDataAutocomplete={{
                                        address: administrative_address?.address,
                                        city: administrative_address?.city,
                                    }}
                                    setValue={setValue}
                                    clearError={clearErrors}
                                    label={t("common.postalCode")}
                                    error={error?.message}
                                    disabled={!canEditCompany}
                                    required
                                />
                            )}
                        />
                    </Box>
                    <Box flex={1}>
                        <Controller
                            name="administrative_address.city"
                            render={({field, fieldState: {error}}) => (
                                <PlaceAutocompleteInput
                                    {...field}
                                    data-testid="company-modal-city"
                                    complementaryDataAutocomplete={{
                                        address: administrative_address?.address,
                                        postcode: administrative_address?.postcode,
                                    }}
                                    setValue={setValue}
                                    clearError={clearErrors}
                                    label={t("common.city")}
                                    error={error?.message}
                                    disabled={!canEditCompany}
                                    required
                                />
                            )}
                        />
                    </Box>
                </Flex>
                <Box>
                    <Controller
                        name="administrative_address.country"
                        render={({field, fieldState: {error}}) => (
                            <SelectCountry
                                {...field}
                                placeholder={t("common.country")}
                                data-testid="company-modal-country"
                                label={t("common.country")}
                                error={error?.message}
                                isDisabled={!canEditCompany}
                                required
                            />
                        )}
                    />
                </Box>
            </Flex>
        </Box>
    );
}
