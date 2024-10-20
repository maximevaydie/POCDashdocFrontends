import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text, TextInput, FlexProps, TextInputProps} from "@dashdoc/web-ui";
import React, {useState} from "react";

export type SearchInputProps = FlexProps & {
    placeholder: string;
    onSubmit: (value: string) => void;
    onChange?: (value: string) => void;
    hideSubmitButton?: boolean;
    textInputProps?: Partial<TextInputProps>;
    resetOnSubmit?: boolean;
    rightPlaceholder?: string;
};

export function SearchInput({
    placeholder,
    onSubmit,
    onChange,
    hideSubmitButton,
    textInputProps,
    resetOnSubmit = true,
    rightPlaceholder,
    ...containerProps
}: SearchInputProps) {
    const [searchBarValue, setSearchBarValue] = useState("");

    return (
        <Flex
            as="form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(searchBarValue);
                if (resetOnSubmit) {
                    setSearchBarValue("");
                }
            }}
            width={1 / 2}
            {...containerProps}
        >
            <Box position="relative" flex={1}>
                <TextInput
                    value={searchBarValue}
                    onChange={handleChange}
                    leftIcon="search"
                    placeholder={placeholder}
                    {...textInputProps}
                />
                {rightPlaceholder && (
                    <Flex position="absolute" right={3} top={0} bottom={0} alignItems="center">
                        <Text color="grey.default">{rightPlaceholder}</Text>
                    </Flex>
                )}
            </Box>
            {!hideSubmitButton && (
                <Button ml={3} data-testid="search-button">
                    {t("common.search")}
                </Button>
            )}
        </Flex>
    );

    function handleChange(value: string) {
        setSearchBarValue(value);
        if (onChange) {
            onChange(value);
        }
    }
}
