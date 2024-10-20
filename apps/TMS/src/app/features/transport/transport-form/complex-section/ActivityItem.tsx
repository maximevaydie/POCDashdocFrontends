import {NamedAddressLabel, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, ClickableFlex, DateAndTime, Flex, Icon, Text} from "@dashdoc/web-ui";
import {getSiteZonedAskedDateTimes} from "dashdoc-utils";
import React from "react";

import {InconsistentDatesIcon} from "app/features/transport/dates/InconsistentDatesIcon";

import {TransportFormActivity} from "../transport-form.types";

interface ActivityItemProps {
    activity: TransportFormActivity;
    isInconsistentDate: boolean;
    onEdit: () => void;
    testId?: string;
}

export function ActivityItem({activity, isInconsistentDate, onEdit, testId}: ActivityItemProps) {
    const timezone = useTimezone();
    const {zonedStart, zonedEnd} = getSiteZonedAskedDateTimes(activity, timezone);
    const [editButtonVisible, setEditButtonVisible] = React.useState(false);

    return (
        <ClickableFlex
            flex={1}
            onClick={onEdit}
            flexDirection="column"
            padding={1}
            style={{gap: "8px"}}
            position="relative"
            onMouseEnter={() => setEditButtonVisible(activity.address != null)}
            onMouseLeave={() => setEditButtonVisible(false)}
            data-testid={testId}
        >
            <Button
                position="absolute"
                top={1}
                right={1}
                style={{visibility: editButtonVisible ? "visible" : "hidden"}}
                variant="secondary"
            >
                {t("common.edit")}
            </Button>
            <Text variant="captionBold">
                {activity.type === "loading" ? t("common.pickup") : t("common.delivery")}
            </Text>
            {activity.address ? (
                <>
                    <NamedAddressLabel address={activity.address} />
                    {zonedStart && (
                        <Flex alignItems="center" style={{gap: 4}}>
                            <Text variant="captionBold">
                                <DateAndTime
                                    zonedDateTimeMin={zonedStart}
                                    zonedDateTimeMax={zonedEnd}
                                    wrap={false}
                                />
                            </Text>
                            {isInconsistentDate && <InconsistentDatesIcon />}
                        </Flex>
                    )}
                </>
            ) : (
                <Flex alignSelf="flex-start">
                    <Icon name="add" marginRight={1} fontSize={1} />
                    <Text variant="body">
                        {activity.type === "loading"
                            ? t("transportsForm.newLoading")
                            : t("transportsForm.newUnloading")}
                    </Text>
                </Flex>
            )}
        </ClickableFlex>
    );
}
