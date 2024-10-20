import {t} from "@dashdoc/web-core";
import {Text, Icon, Flex} from "@dashdoc/web-ui";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React from "react";

type CompleteComputationDetailsProps = {
    computation: TransportCarbonFootprintResponse["estimated_method"];
    addSuccessMention?: boolean;
    addExpiredEmissionRateMention?: boolean;
};

export function CompleteComputationDetails({
    computation,
    addSuccessMention,
    addExpiredEmissionRateMention,
}: CompleteComputationDetailsProps) {
    return (
        <>
            {addSuccessMention && (
                <Flex>
                    <Icon mr={2} name="checkCircle" color="green.default" alignSelf="center" />
                    <Text>{t("carbonFootprint.successfull")}</Text>
                </Flex>
            )}
            {addExpiredEmissionRateMention && computation.is_using_expired_emission_rate && (
                <Flex>
                    <Icon mr={2} name="alert" color="yellow.default" alignSelf="center" />
                    <Text>{t("carbonFootprint.expiredEmissionRate")}</Text>
                </Flex>
            )}
        </>
    );
}
