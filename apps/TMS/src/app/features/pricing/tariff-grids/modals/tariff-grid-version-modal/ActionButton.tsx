import {Button, Icon, IconNames, ButtonProps, Text} from "@dashdoc/web-ui";
import React from "react";

type ActionButtonProps = {
    iconName: IconNames;
    label: string;
    severity?: "danger";
    dataTestId?: string;
    onClick?: () => unknown;
} & ButtonProps;

export const ActionButton = ({
    iconName,
    label,
    dataTestId,
    severity,
    onClick,
    ...props
}: ActionButtonProps) => {
    const fontColor = severity === "danger" ? "red.default" : "blue.default";
    return (
        <Button
            variant={"secondary"}
            type="button"
            onClick={onClick}
            mt={3}
            justifyContent="start"
            width="100%"
            data-testid={dataTestId}
            {...props}
        >
            <Icon mr={2} name={iconName} color={fontColor} />
            <Text color={fontColor}>{label}</Text>
        </Button>
    );
};
