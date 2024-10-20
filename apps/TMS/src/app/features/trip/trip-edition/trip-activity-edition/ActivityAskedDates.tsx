import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Flex, Text} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import {SiteSlot, parseAndZoneDate} from "dashdoc-utils";
import React from "react";

import {
    AdditionalTransportData,
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "app/features/trip/trip.types";

import {getActivityKeyLabel} from "../../trip.service";

type Props = {
    activity: SimilarActivityWithTransportData;
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
};

export function ActivityAskedDates({activity, getBadgeVariantByTransportUid}: Props) {
    const timezone = useTimezone();
    if (!activity.slots || activity.slots.length === 0) {
        return null;
    }

    const renderSingleSlot = (slot: SiteSlot) => (
        <Flex
            style={{gap: "4px"}}
            alignItems="center"
            mb={1}
            data-testid="trip-activity-asked-dates"
        >
            <DateAndTime
                zonedDateTimeMin={parseAndZoneDate(slot.start, timezone)}
                zonedDateTimeMax={parseAndZoneDate(slot.end, timezone)}
                wrap={false}
            />
        </Flex>
    );

    const renderMultipleSlots = (slot: SiteSlot & AdditionalTransportData) => {
        let shortTransportId = "";
        if (slot.transportId) {
            shortTransportId = `# ${slot.transportId.toString().slice(-3)}`;
        }

        return (
            <Flex style={{gap: "4px"}} alignItems="center" mb={1} key={slot.transportId}>
                <DateAndTime
                    zonedDateTimeMin={parseAndZoneDate(slot.start, timezone)}
                    zonedDateTimeMax={parseAndZoneDate(slot.end, timezone)}
                    wrap={false}
                />
                <Badge
                    shape="squared"
                    ml={4}
                    variant={
                        slot.transportUid
                            ? getBadgeVariantByTransportUid(slot.transportUid)
                            : "blue"
                    }
                >
                    {
                        // eslint-disable-next-line react/jsx-no-literals
                        `${getActivityKeyLabel(activity.category)}${shortTransportId}`
                    }
                </Badge>
            </Flex>
        );
    };

    return (
        <Flex flexDirection="column" bg="grey.ultralight" borderRadius={2} p={2}>
            <Text variant="h2" mb={1}>
                {t("common.askedDates")}
            </Text>
            {activity.fakeMerged
                ? activity.slots.map(renderMultipleSlots)
                : activity.slots?.length > 0
                ? renderSingleSlot(activity.slots[0])
                : null}
        </Flex>
    );
}
