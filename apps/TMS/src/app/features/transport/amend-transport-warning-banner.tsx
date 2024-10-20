import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    isRental: Boolean;
};

export function AmendTransportWarningBanner({isRental}: Props) {
    return (
        <Flex
            backgroundColor="yellow.ultralight"
            borderRadius={1}
            mb={2}
            p={2}
            data-testid="amend-transport-warning-banner"
        >
            <Text color="yellow.dark">
                {isRental
                    ? t("rental.warningChangesOnSigned")
                    : t("components.warningChangesOnSigned")}
            </Text>
        </Flex>
    );
}
