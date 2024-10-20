import {t} from "@dashdoc/web-core";
import {Box, Flex, BoxProps, Text, theme, useDevice} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";
import {useFormContext} from "react-hook-form";
import {Zone} from "types";

interface ZoneItemProps {
    zone: Zone;
    selectedZone: Zone | null;
    onSelectZone: (zone: Zone) => Promise<void>;
}

const HoverBox = styled(Box)<BoxProps>`
    cursor: "pointer";
    border-color: ${theme.colors.grey.light};
    &:hover {
        background-color: ${theme.colors.blue.ultralight};
        border-color: ${theme.colors.blue.light};
    }
`;

const SelectedBox = styled(Box)<BoxProps>`
    cursor: "pointer";
    border-color: ${theme.colors.blue.dark};
    background-color: ${theme.colors.blue.ultralight};
    color: ${theme.colors.blue.dark};
`;

export function ZoneItem({zone, selectedZone, onSelectZone}: ZoneItemProps) {
    const {setValue} = useFormContext();
    const isSelected = zone.id === selectedZone?.id;

    const BoxComponent = isSelected ? SelectedBox : HoverBox;
    // TODO: avoid using this hook here : only to fix the responsive issue quickly
    const device = useDevice();

    return (
        <BoxComponent
            data-testid="zone-item"
            border="1px solid"
            borderRadius={1}
            paddingX={5}
            paddingY={3}
            onClick={handleSelect}
            style={{cursor: "pointer"}}
            width={device === "desktop" ? "300px" : "auto"}
            height={device === "desktop" ? "170px" : "auto"}
            textAlign={device === "desktop" ? "center" : "initial"}
        >
            <Flex justifyContent="space-between" flexDirection="column" height="100%">
                <Text variant="h1" color={isSelected ? "blue.dark" : "grey.ultradark"}>
                    {zone.name}
                </Text>
                <Box margin={2} overflow="auto" maxHeight="150px">
                    <Text color={isSelected ? "blue.dark" : "grey.ultradark"}>
                        {zone.description}
                    </Text>
                </Box>
                <Box marginY={2}>
                    <Text
                        textAlign={device === "desktop" ? "center" : "initial"}
                        variant="caption"
                        color={isSelected ? "blue.dark" : "grey.ultradark"}
                    >
                        {t("flow.slotDuration", {smart_count: zone.slot_duration})}
                    </Text>
                </Box>
            </Flex>
        </BoxComponent>
    );

    // Handle slot selection
    async function handleSelect() {
        setValue("zone", zone.id.toString()); // Set the selected zone id value in the form
        await onSelectZone(zone); // Set the selected zone id in the parent component
    }
}
