import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Text, theme} from "@dashdoc/web-ui";
import React from "react";

import {DelegationZoneSVG} from "./svg/DelegationZoneSVG";
import {NoDelegationZoneSVG} from "./svg/NoDelegationZoneSVG";

interface Props {
    leftLabel: string;
    rightLabel: string;
    value: boolean; // true means left is selected, false means right is selected
    onChange: (newValue: boolean) => void;
}

interface SVGProps {
    color: string;
}

export function DelegateToggle({leftLabel, rightLabel, value, onChange}: Props) {
    const selected = value ? "left" : "right";

    const handleClick = (position: "left" | "right") => {
        onChange(position === "left");
    };

    const renderDelegateToggle = (
        position: "left" | "right",
        label: string,
        SVGComponent: React.FC<SVGProps>,
        marginRight?: string | number
    ) => (
        <Flex
            {...getToggleStyles(position)}
            borderRadius={2}
            alignItems="center"
            flexDirection="column"
            onClick={() => handleClick(position)}
            width="150px"
            p={4}
            marginRight={marginRight}
            style={{cursor: "pointer"}}
        >
            <Box>
                <SVGComponent color={getColor(position)} />
            </Box>
            <Text variant="caption" color={getColor(position)}>
                {label}
            </Text>
        </Flex>
    );

    return (
        <>
            <Flex>
                {renderDelegateToggle("left", leftLabel, DelegationZoneSVG, 3)}
                {renderDelegateToggle("right", rightLabel, NoDelegationZoneSVG)}
            </Flex>
            <Callout marginTop={3}>
                <Text marginLeft={3} color="grey.dark">
                    {t("flow.settings.zoneSetupTab.delegationWillBeActive")}
                </Text>
            </Callout>
        </>
    );

    function getColor(position: "left" | "right") {
        return selected === position ? theme.colors.blue.default : theme.colors.grey.dark;
    }

    function getToggleStyles(position: "left" | "right") {
        const isSelected = selected === position;
        return {
            border: "1px solid",
            borderColor: isSelected ? theme.colors.blue.default : theme.colors.grey.light,
            backgroundColor: isSelected ? theme.colors.blue.ultralight : theme.colors.grey.white,
            color: isSelected ? theme.colors.blue.default : theme.colors.grey.dark,
        };
    }
}
