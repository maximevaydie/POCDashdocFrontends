import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {BusinessPrivacyInformationIcon} from "./BusinessPrivacyInformationIcon";

export function BusinessPrivacyInformationLabel() {
    return (
        <Flex
            color="blue.dark"
            alignItems="baseline"
            data-testid="business-privacy-information-label"
        >
            <Text color="blue.dark" data-testid="transport-under-business-privacy">
                {t("transport.underBusinessPrivacy")}
            </Text>
            &nbsp;
            <BusinessPrivacyInformationIcon />
        </Flex>
    );
}
