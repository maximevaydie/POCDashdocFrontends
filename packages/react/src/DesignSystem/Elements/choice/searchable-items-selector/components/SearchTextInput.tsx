import {t} from "@dashdoc/web-core";
import {TextInput} from "@dashdoc/web-ui";
import debounce from "lodash.debounce";
import React, {useCallback, useState} from "react";

export function SearchTextInput({
    onChange,
    initialValue = "",
}: {
    onChange: (value: string) => void;
    initialValue?: string;
}) {
    const [searchText, setSearchText] = useState(initialValue);

    const debouncedOnChange = useCallback(
        debounce((value: string) => {
            onChange(value);
        }, 300),
        [onChange]
    );

    return (
        <TextInput
            leftIcon="search"
            leftIconColor="grey.dark"
            value={searchText}
            onChange={handleSearchTextChange}
            lineHeight={2}
            placeholder={t("common.search")}
            backgroundColor="grey.ultralight"
            autoFocus
            mt={1}
        />
    );

    function handleSearchTextChange(value: string) {
        setSearchText(value);
        debouncedOnChange(value);
    }
}
