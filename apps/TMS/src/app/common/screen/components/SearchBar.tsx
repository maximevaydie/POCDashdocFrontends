import {SearchInput} from "@dashdoc/web-common/src/features/search/SearchInput";
import {t} from "@dashdoc/web-core";
import {Box, Modal, ShortcutWrapper, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

type SearchModalProps = {
    onSearch: (value: string) => void;
};

export function SearchBar({onSearch}: SearchModalProps) {
    const [active, setActive, setInactive] = useToggle(false);

    return (
        <>
            <Box onClick={setActive}>
                <ShortcutWrapper
                    shortcutKeyCodes={["Control", "KeyK"]}
                    onShortcutPressed={active ? setInactive : setActive}
                >
                    {!active && (
                        <SearchInput
                            hideSubmitButton
                            width={["initial", 280, 470]}
                            placeholder={t("topbar.searchAnOrderOrTransport")}
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
                    title={null}
                    onClose={setInactive}
                    mainButton={null}
                    secondaryButton={{
                        variant: "plain",
                        onClick: () => handleSubmit(""),
                        children: t("searchBar.showAll"),
                        ["data-testid"]: "show-all-transports",
                    }}
                    p={0}
                    boxShadow="medium"
                    marginTop={1}
                    animation={false}
                    overlayColor="transparent"
                >
                    <Box mt={-4} mx={-5} px={2}>
                        <SearchInput
                            position="relative"
                            hideSubmitButton
                            width="100%"
                            placeholder={t("topbar.searchAnOrderOrTransport")}
                            onSubmit={handleSubmit}
                            resetOnSubmit={false}
                            textInputProps={{
                                fontSize: 1,
                                containerProps: {height: 50},
                                autoFocus: true,
                            }}
                            data-testid="topbar-search"
                        />
                        <Text m={4}>{t("searchBar.description")}</Text>
                    </Box>
                </Modal>
            )}
        </>
    );

    function handleSubmit(value: string) {
        onSearch(value);
        setInactive();
    }
}
