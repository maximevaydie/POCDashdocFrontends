import {Box, Flex, IconButton, TextInput} from "@dashdoc/web-ui";
import React, {useState} from "react";

type Props = {
    initialValue?: string;
    onSearch: (value: string) => void;
    closeSearchBar: () => void;
    searchPlaceholder?: string;
};

export function SearchInputBar({
    initialValue = "",
    onSearch,
    closeSearchBar,
    searchPlaceholder,
}: Props) {
    const [searchBarValue, setSearchBarValue] = useState(initialValue);
    const handleChange = (value: string) => {
        setSearchBarValue(value);
    };

    return (
        <Flex
            position="relative"
            width="100%"
            data-testid="search-filtering-bar"
            alignItems="center"
        >
            <Box flex={1}>
                <TextInput
                    autoFocus
                    height="42px"
                    data-testid="search-input"
                    leftIcon="search"
                    leftIconColor="grey.dark"
                    value={searchBarValue}
                    onChange={handleChange}
                    placeholder={searchPlaceholder}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            onSearch(searchBarValue);
                        }
                        if (event.key === "Escape" || event.key === "Enter") {
                            closeSearchBar();
                        }
                    }}
                />
            </Box>
            <IconButton
                name="close"
                onClick={closeSearchBar}
                data-testid="close-search-button"
                ml={1}
                color="grey.dark"
                flexShrink={0}
            />
        </Flex>
    );
}
