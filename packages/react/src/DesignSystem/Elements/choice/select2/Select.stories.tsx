import {Box, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {
    AsyncPaginatedSelect as AsyncPaginatedSelectComponent,
    CreatableSelect as CreatableSelectComponent,
    Select as SelectComponent,
    AsyncPaginatedSelectProps,
    CreatableSelectProps,
    SelectOptions,
    SelectProps,
} from "./Select";

export default {
    title: "Web UI/choice/Select",
    component: SelectComponent,
    args: {
        options: [
            {label: "Option 1", value: 1},
            {label: "Option 2", value: 2},
            {label: "Option 3", value: 3},
        ],
    },
    argTypes: {
        onChange: {action: "change"},
        isClearable: {control: "boolean", defaultValue: true},
        isSearchable: {control: "boolean", defaultValue: true},
        isDisabled: {control: "boolean"},
        isLoading: {control: "boolean"},
        isMulti: {control: "boolean"},
        openMenuOnFocus: {control: "boolean", defaultValue: true},
        loadingMessage: {control: "text"},
        noOptionsMessage: {control: "text"},
        placeholder: {control: "text"},
    },
    decorators: [
        (Story) => (
            <>
                <Box width={320}>
                    <Story />
                </Box>
                <Text mt={4}>
                    <i>
                        See all available props on{" "}
                        <a href="https://react-select.com/props" target="_blank" rel="noreferrer">
                            https://react-select.com/props
                        </a>
                    </i>
                </Text>
            </>
        ),
    ],
} as Meta;

export const DefaultSelect: Story<SelectProps> = (args) => <SelectComponent {...args} />;
DefaultSelect.storyName = "Default Select";

export const CreatableSelect: Story<CreatableSelectProps> = (args) => (
    <CreatableSelectComponent {...args} />
);
CreatableSelect.storyName = "Creatable Select";

export const SelectWithLabel: Story<SelectProps> = (args) => <SelectComponent {...args} />;
SelectWithLabel.storyName = "Select with label";
SelectWithLabel.args = {label: "Select label"};

export const AsyncPaginatedSelect: Story<AsyncPaginatedSelectProps> = (args) => {
    const options: SelectOptions = [];
    for (let i = 0; i < 50; ++i) {
        options.push({
            value: i + 1,
            label: `Option ${i + 1}`,
        });
    }

    const sleep = (ms: number) =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(ms);
            }, ms);
        });

    const loadOptions = async (search: string, prevOptions: SelectOptions) => {
        await sleep(1000);

        let filteredOptions;
        if (!search) {
            filteredOptions = options;
        } else {
            const searchLower = search.toLowerCase();

            filteredOptions = options.filter(({label}) =>
                // @ts-ignore
                label.toLowerCase().includes(searchLower)
            );
        }

        const hasMore = filteredOptions.length > prevOptions.length + 10;
        const slicedOptions = filteredOptions.slice(prevOptions.length, prevOptions.length + 10);

        return {
            options: slicedOptions,
            hasMore,
        };
    };

    // @ts-ignore
    return <AsyncPaginatedSelectComponent loadOptions={loadOptions} {...args} />;
};
AsyncPaginatedSelect.args = {defaultOptions: true, options: undefined};
AsyncPaginatedSelect.storyName = "Async paginated Select";
