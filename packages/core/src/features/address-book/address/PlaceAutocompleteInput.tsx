import {Place} from "@dashdoc/web-core";
import {Address, Company} from "dashdoc-utils";
import {FieldProps} from "formik";
import React from "react";

import {HereSuggestField} from "./HereSuggestField";

type PlaceAutocompleteInputProps = {
    ["data-testid"]: string;
    label: string;
    required?: boolean;
    complementaryDataAutocomplete: {[key in "address" | "postcode" | "city"]?: string};
    error?: string | boolean;
    disabled?: boolean;
    customOnChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
type PlaceAutocompleteInputWithFormikProps = FieldProps<Address & Company> &
    PlaceAutocompleteInputProps;
/*
@deprecated use PlaceAutocompleteInput in react hook form instead
*/
export function PlaceAutocompleteInputWithFormik({
    field,
    form,
    ...props
}: PlaceAutocompleteInputWithFormikProps) {
    return (
        <PlaceAutocompleteInput
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            clearError={(fieldName) => form.setFieldError(fieldName, undefined)}
            setValue={form.setFieldValue}
            {...props}
        />
    );
}

type PlaceAutocompleteInputWithFormProps = {
    name: string;
    value: unknown;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.ChangeEvent<HTMLInputElement>) => void;
    clearError: (field: string) => void;
    setValue: (field: string, value: unknown) => void;
} & PlaceAutocompleteInputProps;

export function PlaceAutocompleteInput({
    name,
    value,
    onChange,
    onBlur,
    clearError,
    setValue,
    label,
    required,
    complementaryDataAutocomplete,
    error,
    disabled,
    customOnChange,
    ...props
}: PlaceAutocompleteInputWithFormProps) {
    const fieldType = name.split(".").pop() as string;
    const subFieldFormName = name.slice(0, -fieldType.length);
    return (
        <HereSuggestField
            name={name}
            value={value}
            onBlur={onBlur}
            searchMode="discover"
            complementaryDataAutocomplete={complementaryDataAutocomplete}
            label={label}
            error={error}
            required={required}
            disabled={disabled}
            data-testid={props["data-testid"]}
            onChange={customOnChange || onChange}
            onSuggestionClick={(place: Place) => {
                const address: Partial<Address> = {};

                // Doing string and number keys apart to please typescript
                const placeStringKeys = ["city" as const, "postcode" as const];
                for (let key of placeStringKeys) {
                    if (place[key] !== undefined) {
                        address[key] = place[key];
                    }
                }

                const placeNumberKeys = ["latitude" as const, "longitude" as const];
                for (let key of placeNumberKeys) {
                    if (place[key] !== undefined) {
                        address[key] = place[key];
                    }
                }
                if (place.countryCode !== undefined) {
                    address.country = place.countryCode.toUpperCase();
                }

                if (fieldType === "address") {
                    address.address = place.address;
                }

                if (["city", "postcode"].includes(fieldType) && !address.city) {
                    address.city = place.address;
                }
                clearError(subFieldFormName + "address");
                clearError(subFieldFormName + "postcode");
                clearError(subFieldFormName + "city");

                Object.keys(address).map((key: keyof Address) => {
                    const fieldName = subFieldFormName + key;
                    const fieldValue = address[key];
                    setValue(fieldName, fieldValue);
                });
            }}
        />
    );
}
