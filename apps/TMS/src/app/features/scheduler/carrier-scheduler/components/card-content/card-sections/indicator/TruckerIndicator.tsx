import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export function TruckerIndicator({
    trucker,
    withWarning,
}: {
    trucker?: {pk: number; display_name?: string};
    withWarning?: boolean;
}) {
    return trucker?.pk ? (
        <Text
            color="grey.dark"
            variant="subcaption"
            lineHeight={0}
            display="inline-block"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
        >
            {trucker.display_name}
        </Text>
    ) : (
        <Flex alignItems="center">
            <Text color="red.dark" variant="subcaption" lineHeight={0}>
                {t("scheduler.segmentCardMissingTrucker")}
            </Text>
            {withWarning && <Icon name="alert" color="red.dark" ml={1} />}
        </Flex>
    );
}
