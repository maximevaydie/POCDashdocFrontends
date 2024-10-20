import {t} from "@dashdoc/web-core";
import {Callout, Flex, TooltipWrapper, Text} from "@dashdoc/web-ui";
import React from "react";

export const InconsistentDatesCallout = () => {
    return (
        <Callout mt={2} variant="warning" data-testid="inconsistent-date-warning">
            <Flex justifyContent="space-between">
                {t("activity.inconsistentDates")}
                <TooltipWrapper content={t("activity.inconsistentDatesExplanation")}>
                    <Text color="blue.default">{t("common.learnMore")}</Text>
                </TooltipWrapper>
            </Flex>
        </Callout>
    );
};
