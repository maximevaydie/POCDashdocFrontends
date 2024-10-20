import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {
    deadlineBackgroundColors,
    deadlineColors,
    getDeadlineValueAndStatus,
} from "../getDeadlineValueAndIcon";

export function TimeSensitiveCard({
    title,
    expiryDate,
    children,
}: {
    title: string;
    expiryDate?: string;
    children?: ReactNode;
}) {
    const {formattedDate, deadlineStatus} = getDeadlineValueAndStatus(expiryDate);

    return (
        <Box
            mt={4}
            p={4}
            backgroundColor={deadlineBackgroundColors[deadlineStatus]}
            borderRadius={2}
        >
            <Flex justifyContent="space-between">
                <Text
                    color="grey.dark"
                    fontWeight="bold"
                    data-testid="trucker-details-cards-title"
                >
                    {title}
                </Text>
                {!!formattedDate && (
                    <Flex
                        alignItems="center"
                        style={{gap: "8px"}}
                        data-testid="trucker-details-cards-expiryDate"
                    >
                        {deadlineStatus !== "Ok" && (
                            <TooltipWrapper
                                // nosemgrep
                                content={t(`fleet.common.deadline${deadlineStatus}`)}
                                boxProps={{display: "inline-flex"}}
                            >
                                <Icon name="alert" color={deadlineColors[deadlineStatus]} />
                            </TooltipWrapper>
                        )}
                        {t("fleet.common.expiryDate")}
                        {t("common.colon")} {formattedDate}
                    </Flex>
                )}
            </Flex>
            {children}
        </Box>
    );
}

export function TimeSensitiveCardWithNumber({
    title,
    expiryDate,
    number,
}: {
    title: string;
    expiryDate?: string;
    number: string | null;
}) {
    return (
        <TimeSensitiveCard title={title} expiryDate={expiryDate}>
            <CardNumberField number={number} />
        </TimeSensitiveCard>
    );
}

export function CardGenericField({label, value}: {label: string; value: string | number | null}) {
    if (value) {
        return (
            <Flex>
                <Text mr={1}>
                    {label}
                    {t("common.colon")}
                </Text>
                <Text data-testid="trucker-details-cards-value">{value}</Text>
            </Flex>
        );
    } else {
        return null;
    }
}

export function CardNumberField({number}: {number: string | null}) {
    return (
        <Box fontStyle="italic">
            <CardGenericField label={t("fleet.common.cardNumber")} value={number} />
        </Box>
    );
}
