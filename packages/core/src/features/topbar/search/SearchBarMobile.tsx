import {SearchInput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    IconButton,
    LoadingWheel,
    Modal,
    ShortcutWrapper,
    Text,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {SlotBookingAction} from "features/slot/actions/SlotBookingAction";
import debounce from "lodash.debounce";
import React, {useMemo} from "react";
import {Slot} from "types";

import {SearchSVG} from "./icons/SearchSVG";
import {SearchItems} from "./SearchItems";

type SearchModalProps = {
    search: (value: string) => void;
    clear: () => void;
    slots: Slot[];
    count: number;
    searching: boolean;
};

export function SearchBarMobile({search, clear, slots, count, searching}: SearchModalProps) {
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
            <ShortcutWrapper
                shortcutKeyCodes={["Control", "KeyK"]}
                onShortcutPressed={active ? handleClose : setActive}
            >
                {!active && (
                    <Flex
                        backgroundColor="white"
                        boxShadow="large"
                        py={3}
                        px={5}
                        width="100%"
                        style={{gap: "18px"}}
                    >
                        <Button
                            variant="secondary"
                            onClick={setActive}
                            data-testid="generic-search-bar"
                        >
                            <SearchSVG />
                        </Button>
                        <SlotBookingAction />
                    </Flex>
                )}
            </ShortcutWrapper>

            {active && (
                <Modal
                    minHeight="100%"
                    width="100%"
                    title={null}
                    onClose={handleClose}
                    mainButton={null}
                    boxShadow="medium"
                    marginTop="0px"
                    marginBottom="0px"
                    animation={false}
                    overlayColor="transparent"
                    position="relative"
                    px={0}
                    pt={0}
                    pb={0}
                >
                    <Box>
                        <Flex alignItems="center" padding={3}>
                            <IconButton
                                color="blue.default"
                                name="arrowLeft"
                                onClick={() => setInactive()}
                                fontSize="1em"
                                label={t("common.back")}
                                data-testid="search-back-button"
                            ></IconButton>

                            <Text color="#212B36" variant="h1" ml={8}>
                                {t("common.search")}
                            </Text>
                        </Flex>
                        <Box
                            backgroundColor="grey.light"
                            borderY="1px solid"
                            borderColor="grey.light"
                            width="100%"
                        >
                            <SearchInput
                                paddingX={6}
                                paddingY={2}
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
                        </Box>

                        {!searching && (
                            <Flex>
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
