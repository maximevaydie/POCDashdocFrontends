import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";
import {tz} from "services/date";
import {CreatedSlotEvent} from "types";

type Props = {
    slotEvent: CreatedSlotEvent;
    timezone: string;
};

export function CreatedEvent({slotEvent, timezone}: Props) {
    const {
        data: {start_time},
        author: {first_name, last_name},
    } = slotEvent;
    return (
        <Text>
            {t("flow.history.someoneBookedASlot", {name: `${first_name} ${last_name}`})}
            {t("common.colon")}
            <Text as="span" fontWeight="600">
                {tz.format({date: start_time, timezone}, "PPPPp")}
            </Text>
        </Text>
    );
}
