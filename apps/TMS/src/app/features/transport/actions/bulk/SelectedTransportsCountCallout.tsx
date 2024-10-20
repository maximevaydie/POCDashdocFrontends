import {t} from "@dashdoc/web-core";
import {Callout, Text} from "@dashdoc/web-ui";
import React from "react";

type SelectedTransportsCountCalloutProps = {
    variant?: "warning" | "secondary" | "danger";
    selectedTransportsCount: number;
};
export const SelectedTransportsCountCallout = ({
    variant = "secondary",
    selectedTransportsCount,
}: SelectedTransportsCountCalloutProps) => {
    const getTextColor = () => {
        switch (variant) {
            case "warning":
                return "yellow.dark";
            case "secondary":
                return "blue.dark";
            case "danger":
                return "red.dark";
        }
    };

    return (
        <Callout variant={variant} iconDisabled>
            <Text variant="h2" color={getTextColor()}>
                {t("components.countSelectedTransports", {
                    smart_count: selectedTransportsCount,
                })}
            </Text>
        </Callout>
    );
};
