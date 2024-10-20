import {HasFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, SwitchInput, TooltipWrapper, Text} from "@dashdoc/web-ui";
import React from "react";

import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

type Props = {
    value: boolean;
    onChange: (value: boolean) => void;
};
export function LockRequestedTimesSwitch({value, onChange}: Props) {
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    if (!hasSchedulerByTimeEnabled) {
        return null;
    }
    return (
        <HasFeatureFlag flagName="schedulerByTimeUseAskedDates">
            <Box mt={2}>
                <SwitchInput
                    value={value}
                    onChange={onChange}
                    labelRight={
                        <Flex alignItems="center">
                            <Text>{t("activity.lockRequestedTimes")}</Text>
                            <TooltipWrapper content={t("activity.lockRequestedTimes.tooltip")}>
                                <Icon name="info" ml={2} />
                            </TooltipWrapper>
                        </Flex>
                    }
                />
            </Box>
        </HasFeatureFlag>
    );
}
