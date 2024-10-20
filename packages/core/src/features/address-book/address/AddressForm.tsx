import {t} from "@dashdoc/web-core";
import {Box, Flex, LatLng, SelectCountry, Text, TextInput} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import {Field, useFormikContext} from "formik";
import React from "react";

import {MapInput} from "./MapInput";
import {PlaceAutocompleteInputWithFormik} from "./PlaceAutocompleteInput";

type Props = {
    canEditCompany: boolean;
    displayRemoteId: boolean;
    showAddressForm: boolean;
    updateCoordinates: (latLng: LatLng) => void;
};

export function AddressForm({
    canEditCompany,
    displayRemoteId,
    showAddressForm,
    updateCoordinates,
}: Props) {
    const {values, errors, setFieldValue, touched} = useFormikContext<Company>();

    return (
        <>
            <Text variant="h1" mb={2}>
                {t("common.informations")}
            </Text>
            <Flex flexDirection="column" flex={1} style={{gap: 16}}>
                <Flex style={{gap: 16}}>
                    <Box flex={7}>
                        <TextInput
                            name="name"
                            value={values.name ?? ""}
                            onChange={(value: string) => {
                                setFieldValue("name", value);
                            }}
                            error={touched.name ? errors.name : undefined}
                            required
                            label={t("common.name")}
                            disabled={!canEditCompany}
                            data-testid="company-modal-name"
                        />
                    </Box>
                    {displayRemoteId && (
                        <Box flex={3}>
                            <TextInput
                                name="remote_id"
                                value={values.remote_id ?? ""}
                                onChange={(value: string) => {
                                    setFieldValue("remote_id", value);
                                }}
                                error={errors.remote_id}
                                label={t("components.remoteId")}
                                data-testid="company-modal-remote-id"
                            />
                        </Box>
                    )}
                </Flex>
                <Flex style={{gap: 16}}>
                    <Flex flex={7} flexDirection="column" justifyContent="space-around">
                        {showAddressForm && (
                            <>
                                <Box>
                                    <Field
                                        component={PlaceAutocompleteInputWithFormik}
                                        name="primary_address.address"
                                        placeholder={t("common.address")}
                                        data-testid="company-modal-address"
                                        complementaryDataAutocomplete={{
                                            postcode: values.primary_address?.postcode,
                                            city: values.primary_address?.city,
                                        }}
                                        error={
                                            (errors.primary_address as Company["primary_address"])
                                                ?.address
                                        }
                                        label={t("common.address")}
                                        disabled={!canEditCompany}
                                    />
                                </Box>
                                <Flex style={{gap: 8}}>
                                    <Box flex={2}>
                                        <Field
                                            component={PlaceAutocompleteInputWithFormik}
                                            error={
                                                (
                                                    errors.primary_address as Company["primary_address"]
                                                )?.postcode
                                            }
                                            label={t("common.postalCode")}
                                            required
                                            name="primary_address.postcode"
                                            placeholder={t("common.postalCode")}
                                            data-testid="company-modal-postcode"
                                            complementaryDataAutocomplete={{
                                                address: values.primary_address?.address,
                                                city: values.primary_address?.city,
                                            }}
                                            disabled={!canEditCompany}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Field
                                            component={PlaceAutocompleteInputWithFormik}
                                            error={
                                                (
                                                    errors.primary_address as Company["primary_address"]
                                                )?.city
                                            }
                                            label={t("common.city")}
                                            required
                                            name="primary_address.city"
                                            placeholder={t("common.city")}
                                            data-testid="company-modal-city"
                                            complementaryDataAutocomplete={{
                                                address: values.primary_address?.address,
                                                postcode: values.primary_address?.postcode,
                                            }}
                                            disabled={!canEditCompany}
                                        />
                                    </Box>
                                </Flex>
                                <Box>
                                    <Field
                                        name="primary_address.country"
                                        placeHolder={t("common.country")}
                                        component={SelectCountry}
                                        error={
                                            (errors.primary_address as Company["primary_address"])
                                                ?.country
                                        }
                                        label={t("common.country")}
                                        required
                                        onChange={(country: string) => {
                                            setFieldValue("primary_address.country", country);
                                            setFieldValue("country", country);
                                        }}
                                        value={values.primary_address?.country}
                                        data-testid="company-modal-country"
                                        isDisabled={!canEditCompany}
                                    />
                                </Box>
                            </>
                        )}
                    </Flex>
                    <Box flex={3}>
                        <Box style={{aspectRatio: "4/3"}}>
                            <MapInput
                                address={values.primary_address ?? undefined}
                                onChange={updateCoordinates}
                                disabled={!canEditCompany}
                            />
                        </Box>
                    </Box>
                </Flex>
            </Flex>
        </>
    );
}
