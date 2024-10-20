import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

export type StatisticsProps = {
    onsite: number;
    to_come: number;
    completed: number;
    cancelled: number;
    total: number;
    reloading: boolean;
};

export function Statistics({onsite, to_come, completed, total, reloading}: StatisticsProps) {
    return (
        <Box
            style={{
                display: "grid",
                gridColumnGap: "10px",
                gridRowGap: "16px",
                gridTemplateColumns: "1fr 1fr",
            }}
        >
            <AStatistic
                label={t("common.onsite")}
                value={onsite}
                textColor="purple.dark"
                backgroundColor="purple.ultralight"
                reloading={reloading}
            />
            <AStatistic
                label={t("common.coming")}
                value={to_come}
                textColor="blue.dark"
                backgroundColor="blue.ultralight"
                reloading={reloading}
            />
            <AStatistic
                label={t("sidebar.done")}
                value={completed}
                textColor="green.dark"
                backgroundColor="green.ultralight"
                reloading={reloading}
            />
            <AStatistic
                label={t("common.total")}
                value={total}
                textColor="grey.ultradark"
                backgroundColor="grey.light"
                reloading={reloading}
            />
        </Box>
    );
}

export type AStatisticProps = {
    label: string;
    value: number;
    textColor: string;
    backgroundColor: string;
    reloading: boolean;
};
function AStatistic({label, value, textColor, backgroundColor, reloading}: AStatisticProps) {
    return (
        <Box p={4} flexGrow={1} backgroundColor={backgroundColor} borderRadius={1}>
            <Text color={textColor} variant="h2">
                {label}
            </Text>
            <Text color={textColor} variant="title" fontWeight={600}>
                {reloading ? "..." : value}
            </Text>
        </Box>
    );
}
