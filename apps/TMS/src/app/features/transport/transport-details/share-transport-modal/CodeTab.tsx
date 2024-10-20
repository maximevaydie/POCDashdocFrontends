import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
};

export function CodeTab({transport}: Props) {
    return (
        <Box>
            <Callout variant="informative" my={3}>
                <Text>
                    {t("transportDetails.shareTransportModal.transportCodeTabDescription")}
                </Text>
            </Callout>
            <Flex justifyContent="center" my={10}>
                {transport.invite_code ? (
                    <Text
                        backgroundColor="grey.ultralight"
                        color="grey.dark"
                        variant="title"
                        textAlign="center"
                        p={8}
                    >
                        {transport.invite_code}
                    </Text>
                ) : (
                    <Box>
                        <Text variant="title" color="grey.dark" textAlign="center">
                            {t("transportDetails.shareTransportModal.transportCodeTabNoCode")}
                        </Text>
                        <Text color="grey.dark" textAlign="center" fontWeight="bold">
                            {t(
                                "transportDetails.shareTransportModal.transportCodeTabNoCodeExplanation"
                            )}
                        </Text>
                    </Box>
                )}
            </Flex>
        </Box>
    );
}
