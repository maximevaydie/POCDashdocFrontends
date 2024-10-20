import {CreatableSelect, SelectOption} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {Option} from "react-select/src/filters";

import {Item} from "./Item";

export type ItemPickerProps = {
    placeholder: string;
    defaultValue?: SelectOption<string>;
    "data-testid"?: string;
    options: SelectOption<string>[];
    onSelect: (item: SelectOption<string>) => void;
    isValid?: (value: string) => boolean;
};
const MAX_LENGTH = 40;
const validationSchema = yup.object().shape({
    name: yup.string().min(2).max(MAX_LENGTH),
});
const defaultIsValid = (value: string) => validationSchema.isValidSync({name: value});

/**
 * Generic select picker based on select options.
 * This component is used to select an item from a list of options (and allow to add a new one).
 */
export const ItemPicker: FunctionComponent<ItemPickerProps> = ({
    placeholder,
    defaultValue,
    onSelect,
    options,
    isValid = defaultIsValid,
}) => {
    const formatOptionLabel = (option: SelectOption<string>) => <Item option={option} />;

    const isValidNewOption = (newValue: string) =>
        isValid(newValue) && newValue?.length <= MAX_LENGTH;

    const onChange = (option: SelectOption<string>) => {
        if (option?.__isNew__) {
            const {value} = option;
            // @ts-ignore
            if (!isValid(value)) {
                return;
            }
        }
        onSelect(option);
    };

    // In all case, we return only related suggested options.
    const filterOption = (option: Option, rawInput: string) => {
        return option?.label?.toLocaleLowerCase().includes(rawInput?.toLocaleLowerCase());
    };

    return (
        <CreatableSelect
            defaultValue={defaultValue}
            styles={{
                valueContainer: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    height: label ? "5em" : "4em",
                }),
                singleValue: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    ...(label && {top: "30%"}),
                    color: theme.colors.grey.dark,
                }),
                menu: (provided) => ({
                    ...provided,
                    maxHeight: "400px",
                }),
            }}
            isClearable={true}
            options={options}
            getOptionValue={({value}) => value}
            getOptionLabel={({label}) => label}
            formatOptionLabel={formatOptionLabel}
            defaultMenuIsOpen={false}
            autoFocus={false}
            onChange={onChange}
            placeholder={placeholder}
            isValidNewOption={isValidNewOption}
            filterOption={filterOption}
        />
    );
};
