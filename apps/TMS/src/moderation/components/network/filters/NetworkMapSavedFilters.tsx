import {Box, Button, Flex, IconButton, Text, TextInput, TooltipWrapper} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {FiltersState, FilterState} from "moderation/network-map/types";

export type NetworkMapSavedFiltersProps = {
    filters: FiltersState;
    actualFilters: FilterState[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    updateFilter: (name: string, newFilter: FilterState[]) => void;
    removeFilter: (name: string) => void;
    applySavedFilters: (filters: FilterState[]) => void;
};

export const NetworkMapSavedFilters: React.FC<NetworkMapSavedFiltersProps> = ({
    filters,
    actualFilters,
    isOpen,
    setIsOpen,
    updateFilter,
    removeFilter,
    applySavedFilters,
}) => {
    const [filterName, setFilterName] = useState<string>("");

    const saveActualFilter = (name: string) => {
        updateFilter(name, actualFilters);
    };

    return (
        <Box
            position={"relative"}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <IconButton
                name={"magicWand"}
                label={window.screen.width < 768 ? "" : "Saved"}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            />
            <Flex
                flexDirection={"column"}
                style={{
                    position: "absolute",
                    top: 50,
                    right: "0",
                    minWidth: "250px",
                    padding: "10px 0",
                    gap: "10px",
                    display: isOpen ? "flex" : "none",
                }}
                zIndex="modal"
                backgroundColor={"white"}
                borderRadius={"5px"}
                border={"1px solid #e5e5e5"}
            >
                {Object.entries(filters).map(([key, value]) => (
                    <Flex
                        flexDirection={"row"}
                        justifyContent={"flex-end"}
                        alignItems={"center"}
                        key={key}
                    >
                        <Button
                            onClick={() => {
                                applySavedFilters(value);
                            }}
                            variant={"plain"}
                            style={{
                                border: "none",
                                width: "100%",
                            }}
                            mx={2}
                            flex={4}
                        >
                            <Text width={"100%"} textAlign={"left"}>
                                <TooltipWrapper
                                    content={renderTooltipContent(value)}
                                    placement="left"
                                >
                                    {key}
                                </TooltipWrapper>
                            </Text>
                        </Button>
                        <TooltipWrapper content={"Delete filter"}>
                            <IconButton
                                name={"delete"}
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this filter?")) {
                                        removeFilter(key);
                                    }
                                }}
                            />
                        </TooltipWrapper>
                    </Flex>
                ))}

                <Flex flexDirection={"row"} justifyContent={"center"} alignItems={"center"}>
                    <Box flex={3}>
                        <TextInput
                            placeholder={"New filter name"}
                            value={filterName}
                            onChange={(value) => setFilterName(value)}
                            mx={2}
                            flex={3}
                        />
                    </Box>

                    <Box mr={1}>
                        <IconButton
                            name={"add"}
                            onClick={() => {
                                if (filterName) {
                                    saveActualFilter(filterName);
                                    setFilterName("");
                                }
                            }}
                        />
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
};

export const renderTooltipContent = (items: FilterState[]) => {
    items = items.filter((item) => item.value);

    if (items.length === 0) {
        return "No filters applied";
    } else {
        return (
            <Box>
                {items.map((item) => {
                    if (typeof item.value === "object") {
                        return (
                            <div key={item.name}>
                                <strong>{item.name}</strong>:{" "}
                                {Object.values(item.value).map((value) => value.label)}
                            </div>
                        );
                    } else {
                        return (
                            <div key={item.name}>
                                <strong>{item.name}</strong>: {item.value}
                            </div>
                        );
                    }
                })}
            </Box>
        );
    }
};
