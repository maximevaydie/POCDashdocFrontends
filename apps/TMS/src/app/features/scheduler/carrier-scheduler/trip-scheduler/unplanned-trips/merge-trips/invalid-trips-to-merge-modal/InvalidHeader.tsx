import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

type InvalidHeaderProps = {
    validCount: number;
    invalidCount: number;
};

export function InvalidHeader({validCount, invalidCount}: InvalidHeaderProps) {
    return (
        <>
            <Text variant="h1" mb={1}>
                {t("trip.invalidMerge.selectedTrips", {
                    smart_count: validCount + invalidCount,
                })}
            </Text>
            <Flex pb={3} borderBottom="1px solid" borderColor="grey.light">
                <Icon mr={2} name="checkCircle" color="green.default" alignSelf="center" />
                <Text variant="h2" mr={2}>
                    {validCount}
                </Text>
                <Icon mr={2} name="removeCircle" color="red.default" alignSelf="center" />
                <Text variant="h2">{invalidCount}</Text>
            </Flex>
        </>
    );
}
