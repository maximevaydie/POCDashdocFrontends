import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import {SupportExchange} from "dashdoc-utils";
import React, {useMemo} from "react";

import {AmendEditSupportExchangeButton} from "app/features/transport/support-exchanges/AmendEditSupportExchangeButton";
import {EditSupportExchangeButton} from "app/features/transport/support-exchanges/EditSupportExchangeButton";
import {TransportFormActivity} from "app/features/transport/transport-form/transport-form.types";

import type {Transport} from "app/types/transport";

export function SupportExchangeInfo({
    transport,
    activity,
    supportExchange,
    index,
    canEdit,
    canAmend,
}: {
    transport: Transport;
    activity: Pick<TransportFormActivity, "uid" | "type">;
    supportExchange: SupportExchange;
    index: number;
    canEdit: boolean;
    canAmend: boolean;
}) {
    const [takenText, givenText] = useMemo(() => {
        if (activity.type === "loading") {
            return [t("supportExchange.supportTaken"), t("supportExchange.supportGivenBack")];
        }
        return [t("supportExchange.supportRecovered"), t("supportExchange.supportDelivered")];
    }, [activity]);

    return (
        <Box mt={index > 0 ? 8 : 0}>
            <Flex justifyContent="space-between">
                <Text fontSize={16}>{supportExchange.support_type.name}</Text>
                {canEdit && (
                    <Box justifyContent="flex-end">
                        <EditSupportExchangeButton
                            activity={activity}
                            supportExchange={supportExchange}
                            transport={transport}
                        />
                    </Box>
                )}
                {canAmend && (
                    <Box justifyContent="flex-end">
                        <AmendEditSupportExchangeButton
                            activity={activity}
                            supportExchange={supportExchange}
                            transport={transport}
                        />
                    </Box>
                )}
            </Flex>
            <Flex>
                <Box flex={1}>
                    <Text variant="h2">{t("supportsExchange.expected")}</Text>
                    <Box>
                        {takenText} : {supportExchange.expected_retrieved}
                    </Box>
                    <Box>
                        {givenText} : {supportExchange.expected_delivered}
                    </Box>
                </Box>
                <Box flex={1}>
                    <Text variant="h2">{t("supportsExchange.actual")}</Text>
                    <Box>
                        {takenText} : {supportExchange.actual_retrieved}
                    </Box>
                    <Box>
                        {givenText} : {supportExchange.actual_delivered}
                    </Box>
                </Box>
            </Flex>
            {supportExchange.observations && (
                <Flex width="50%" color="red.dark" flexDirection="column">
                    <Text variant="h2" color="inherit">
                        <Icon name="warning" mr={2} />
                        {t("signature.observations")}
                    </Text>
                    <Box py={1}>{supportExchange.observations}</Box>
                </Flex>
            )}
        </Box>
    );
}
