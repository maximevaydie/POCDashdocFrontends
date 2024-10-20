import {useTimezone} from "@dashdoc/web-common";
import {Flex, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React from "react";

export const DateBlock = ({
    date,
    label,
    notDoneLabel,
    isActivityDone,
}: {
    date: Date | null;
    label: string;
    notDoneLabel: string;
    isActivityDone: boolean;
}) => {
    const timezone = useTimezone();
    return (
        <Flex flexDirection="column">
            <Text variant="h2" mb={1} ellipsis>
                {label}
            </Text>
            <Flex
                alignItems="center"
                justifyContent="center"
                flexDirection={"column"}
                bg="grey.ultralight"
                p={3}
                borderRadius={1}
                flex={1}
            >
                {date && (
                    <>
                        <Text>{formatDate(parseAndZoneDate(date, timezone), "PPPP")}</Text>
                        <Text fontWeight="600">
                            {formatDate(parseAndZoneDate(date, timezone), "p")}
                        </Text>
                    </>
                )}
                {!isActivityDone && <Text>{notDoneLabel}</Text>}
                {isActivityDone && !date && <Text>--</Text>}
            </Flex>
        </Flex>
    );
};
