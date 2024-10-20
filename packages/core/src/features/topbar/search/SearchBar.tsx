import {SearchInput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text, Modal, Box, Flex} from "@dashdoc/web-ui";
import {ShortcutWrapper} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import debounce from "lodash.debounce";
import React, {useMemo} from "react";
import {Slot} from "types";

import {SearchItems} from "./SearchItems";

type SearchModalProps = {
    search: (value: string) => void;
    clear: () => void;
    slots: Slot[];
    count: number;
    searching: boolean;
};

export function SearchBar({search, clear, slots, count, searching}: SearchModalProps) {
    const [active, setActive, setInactive] = useToggle(false);

    const debouncedSearch = useMemo(() => debounce(search, 400), [search]);
    const handleTextChange = (value: string) => {
        if (value.length >= 2) {
            debouncedSearch(value);
        } else {
            clear();
        }
    };

    return (
        <>
            <Box onClick={setActive}>
                <ShortcutWrapper
                    shortcutKeyCodes={["Control", "KeyK"]}
                    onShortcutPressed={active ? handleClose : setActive}
                >
                    {!active && (
                        <SearchInput
                            hideSubmitButton
                            width={["initial", 280, 470]}
                            placeholder={t("flow.topbar.searchASlot")}
                            onSubmit={() => null}
                            rightPlaceholder={navigator.platform.includes("Mac") ? "⌘K" : "Ctrl+K"}
                            textInputProps={{fontSize: 1, containerProps: {height: 30}}}
                            data-testid="generic-search-bar"
                        />
                    )}
                </ShortcutWrapper>
            </Box>

            {active && (
                <Modal
                    width="380px"
                    title={null}
                    onClose={handleClose}
                    mainButton={null}
                    p={0}
                    boxShadow="medium"
                    marginTop="41px"
                    animation={false}
                    overlayColor="transparent"
                    position="relative"
                >
                    <Box mt={-4} mx={-5}>
                        <SearchInput
                            position="absolute"
                            top="0"
                            hideSubmitButton
                            width="100%"
                            placeholder={t("flow.topbar.searchASlot")}
                            onSubmit={search}
                            onChange={handleTextChange}
                            resetOnSubmit={false}
                            textInputProps={{
                                fontSize: 1,
                                containerProps: {height: 50},
                                autoFocus: true,
                            }}
                            data-testid="topbar-search"
                        />
                        {!searching && (
                            <Flex marginTop="40px">
                                <Text
                                    padding="4"
                                    color="grey.dark"
                                    variant="caption"
                                    fontSize={2}
                                    data-testid="search-result-count"
                                >
                                    {t("common.resultCount", {
                                        smart_count: count,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {!searching && <SearchItems slots={slots} onClose={handleClose} />}
                    </Box>
                    {searching && (
                        <Box marginTop="40px" padding="5">
                            <LoadingWheel noMargin />
                        </Box>
                    )}
                </Modal>
            )}
        </>
    );

    function handleClose() {
        setInactive();
        clear();
    }
}
