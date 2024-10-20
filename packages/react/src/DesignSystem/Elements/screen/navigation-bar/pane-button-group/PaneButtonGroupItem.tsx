import {Flex, Icon, IconProps, Text, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

const Item = styled(Flex)(() =>
    themeAwareCss({
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: "grey.light",
        borderStyle: "solid",
        paddingY: 3,
        paddingX: 4,
        cursor: "pointer",
        "&:hover": {bg: "grey.light"},
        "&:last-of-type": {borderBottomWidth: "1px"},
    })
);

export type PaneButtonGroupItemProps = {
    label: string;
    icon?: IconProps["name"];
    active?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    id?: string;
    "data-testid"?: string;
};

export function PaneButtonGroupItem({
    icon,
    label,
    onClick,
    id,
    ...props
}: PaneButtonGroupItemProps) {
    const textColor = props.active ? "blue.dark" : "grey.ultradark";
    return (
        <Item
            onClick={onClick}
            data-testid={props["data-testid"]}
            id={id}
            backgroundColor={props.active ? "blue.ultralight" : "transparent"}
        >
            {icon && <Icon name={icon} mr={2} color={textColor} />}
            <Text color={textColor} fontWeight={props.active ? "bold" : "regular"}>
                {label}
            </Text>
        </Item>
    );
}
