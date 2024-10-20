import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";
import {tz} from "services/date";
import {RescheduledSlotEvent} from "types";

type Props = {
    slotEvent: RescheduledSlotEvent;
    timezone: string;
};

export function RescheduledEvent({slotEvent, timezone}: Props) {
    const {
        data,
        author: {first_name, last_name},
    } = slotEvent;
    return (
        <>
            <Text>
                {t("flow.history.someoneRescheduledASlot", {name: `${first_name} ${last_name}`})}
                {t("common.colon")}
            </Text>
            <Text>
                <Text as="span" textDecoration="line-through">
                    {tz.format({date: data.previous, timezone}, "PPPPp")}
                </Text>
                {` → `}
                <Text as="span" fontWeight="600">
                    {tz.format({date: data.new, timezone}, "PPPPp")}
                </Text>
            </Text>
        </>
    );
}
