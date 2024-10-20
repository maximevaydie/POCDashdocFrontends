import {Flex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import React from "react";

type ButtonCard = {
    label: string;
    icon: IconNames;
    selected: boolean;
    onClick: () => void;
    ["data-testid"]?: string;
};

export function ButtonCard({label, icon, selected, onClick, ...props}: ButtonCard) {
    const color = selected ? "blue.default" : "grey.dark";
    const backgroundColor = selected ? "blue.ultralight" : "transparent";
    const borderColor = selected ? "blue.default" : "grey.light";

    return (
        <Flex
            flexDirection="column"
            alignItems="center"
            minWidth="128px"
            pt={5}
            pb={4}
            px={5}
            color={color}
            backgroundColor={backgroundColor}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={1}
            style={{gap: "12px"}}
            onClick={onClick}
            data-testid={props["data-testid"]}
        >
            <Icon name={icon} color={color} scale={1.5} />
            <Text color={color}>{label}</Text>
        </Flex>
    );
}
