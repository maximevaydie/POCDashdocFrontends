import {t} from "@dashdoc/web-core";
import {Box, Button, Flex} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    transportIndex: number;
    transportCount: number;
    onPreviousTransportClick: () => void;
    onNextTransportClick: () => void;
};

export function UpdateLateTransportSelector({
    transportIndex,
    transportCount,
    onPreviousTransportClick,
    onNextTransportClick,
}: Props) {
    return (
        <Flex
            justifyContent="space-between"
            p="10px"
            id="transport-switch"
            backgroundColor="grey.light"
        >
            <Box flexBasis="30%">
                {transportIndex > 0 && (
                    <Button variant="plain" onClick={onPreviousTransportClick}>
                        {t("common.previous")}
                    </Button>
                )}
            </Box>
            <Box>
                {transportIndex + 1}/{transportCount}
            </Box>
            <Flex flexBasis="30%" justifyContent="flex-end">
                {transportIndex < transportCount - 1 && (
                    <Button variant="plain" onClick={onNextTransportClick}>
                        {t("common.next")}
                    </Button>
                )}
            </Flex>
        </Flex>
    );
}
