import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React from "react";

export const DurationBlock = ({
    duration,
    variant = "neutral",
    small,
    ...props
}: {
    duration: number;
    variant?: "neutral" | "primary";
    small?: boolean;
    ["data-testid"]?: string;
}) => {
    let color = "grey.dark";
    let backgroundColor = "grey.light";
    if (variant === "primary") {
        color = "blue.dark";
        backgroundColor = "blue.light";
    }
    return (
        <Text
            variant={small ? "body" : "h1"}
            bg={backgroundColor}
            color={color}
            px={2}
            mx={2}
            py={small ? 1 : 2}
            borderRadius={1}
            minWidth="80px"
            textAlign={"end"}
            data-testid={props["data-testid"]}
        >
            {formatNumber(duration, {
                maximumFractionDigits: 2,
            })}{" "}
            {t("pricingMetrics.unit.hour.short")}
        </Text>
    );
};
