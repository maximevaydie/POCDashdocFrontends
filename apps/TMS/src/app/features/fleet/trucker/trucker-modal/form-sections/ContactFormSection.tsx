import {
    LocalizedPhoneNumberInput,
    PlaceAutocompleteInput,
    getConnectedCompany,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, SelectCountry, TextInput} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import {isValidPhoneNumber} from "libphonenumber-js";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import {z} from "zod";

import {
    FieldSet,
    FieldSetLegend,
} from "app/features/fleet/trucker/trucker-modal/form-sections/generic";
import {useSelector} from "app/redux/hooks";

export const contactFormValidationSchema = z.object({
    email: z.string().email("errors.email.invalid").or(z.literal("")).nullable(),
    phone_number: z
        .custom<string>(
            (value: string) => !value || isValidPhoneNumber(value, "FR"),
            "common.invalidPhoneNumber"
        )
        .nullable(),
    phone_number_personal: z
        .custom<string>(
            (value: string) => !value || isValidPhoneNumber(value, "FR"),
            "common.invalidPhoneNumber"
        )
        .nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    country_code: z.string(),
    postcode: z.string().nullable(),
});
export type ContactForm = z.infer<typeof contactFormValidationSchema>;

export function getContactDefaultValues(trucker?: Trucker): ContactForm {
    return trucker
        ? {
              email: trucker.user?.email || "",
              phone_number: trucker.phone_number || "",
              phone_number_personal: trucker.phone_number_personal || "",
              address: trucker.address || "",
              city: trucker.city || "",
              country_code: trucker.country_code || "",
              postcode: trucker.postcode || "",
          }
        : {
              email: "",
              phone_number: "",
              phone_number_personal: "",
              address: "",
              city: "",
              country_code: "",
              postcode: "",
          };
}

export function ContactFormSection() {
    const company = useSelector(getConnectedCompany);
    const form = useFormContext<ContactForm>();
    const [address, postcode, city] = form.watch(["address", "postcode", "city"]);

    return (
        <FieldSet mt={5}>
            <FieldSetLegend>{t("fleet.common.contactSection")}</FieldSetLegend>
            <Flex justifyContent="space-between">
                <Box mt={3} flexBasis={"50%"} mr={2}>
                    <Controller
                        name="phone_number"
                        render={({field: {value, onChange}, fieldState: {error}}) => (
                            <LocalizedPhoneNumberInput
                                label={t("common.phoneNumber")}
                                data-testid="input-phone-number"
                                value={value}
                                onChange={onChange}
                                error={error?.message}
                                country={company?.country}
                            />
                        )}
                    />
                </Box>
                <Box mt={3} flexBasis={"50%"}>
                    <Controller
                        name="phone_number_personal"
                        render={({field: {value, onChange}, fieldState: {error}}) => (
                            <LocalizedPhoneNumberInput
                                label={t("common.personalPhoneNumber")}
                                data-testid="input-phone-number-personal"
                                value={value}
                                onChange={onChange}
                                error={error?.message}
                                country={company?.country}
                            />
                        )}
                    />
                </Box>
            </Flex>
            <Box mt={3}>
                <Controller
                    name="email"
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            {...field}
                            label={t("common.email")}
                            data-testid="input-email"
                            placeholder={t("common.typeHere")}
                            error={error?.message}
                        />
                    )}
                />
            </Box>
            <Flex justifyContent="space-between" mt={3}>
                <Box flexBasis="100%">
                    <Controller
                        name="address"
                        render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                            <PlaceAutocompleteInput
                                {...field}
                                clearError={form.clearErrors as (field: string) => void}
                                setValue={form.setValue}
                                label={t("common.address")}
                                data-testid="address-modal-address"
                                complementaryDataAutocomplete={{
                                    postcode: postcode ?? undefined,
                                    city: city ?? undefined,
                                }}
                                error={error?.message}
                            />
                        )}
                    />
                </Box>
            </Flex>
            <Flex justifyContent="space-between" mt={3}>
                <Box flexBasis="25%">
                    <Controller
                        name="postcode"
                        render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                            <PlaceAutocompleteInput
                                {...field}
                                clearError={form.clearErrors as (field: string) => void}
                                setValue={form.setValue}
                                label={t("common.postalCode")}
                                data-testid="address-modal-postcode"
                                complementaryDataAutocomplete={{
                                    address: address ?? undefined,
                                    city: city ?? undefined,
                                }}
                                customOnChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    form.clearErrors("postcode");
                                    form.setValue("postcode", event.target.value);
                                }}
                                error={error?.message}
                            />
                        )}
                    />
                </Box>
                <Box flexBasis="40%">
                    <Controller
                        name="city"
                        render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                            <PlaceAutocompleteInput
                                {...field}
                                clearError={form.clearErrors as (field: string) => void}
                                setValue={form.setValue}
                                label={t("common.city")}
                                data-testid="address-modal-city"
                                complementaryDataAutocomplete={{
                                    address: address ?? undefined,
                                    postcode: postcode ?? undefined,
                                }}
                                customOnChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    form.clearErrors("city");
                                    form.setValue("city", event.target.value);
                                }}
                                error={error?.message}
                            />
                        )}
                    />
                </Box>
                <Box flexBasis="33%" height="40px">
                    <Controller
                        name="country_code"
                        render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                            <SelectCountry
                                {...field}
                                label={t("common.country")}
                                data-testid="address-modal-country"
                                error={error?.message}
                            />
                        )}
                    />
                </Box>
            </Flex>
        </FieldSet>
    );
}
