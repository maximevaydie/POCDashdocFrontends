import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";
import {tz} from "services/date";
import {CompletedSlotEvent} from "types";

type Props = {
    slotEvent: CompletedSlotEvent;
    timezone: string;
};

export function CompletedEvent({slotEvent, timezone}: Props) {
    const {
        data: {timestamp},
        author: {first_name, last_name},
    } = slotEvent;
    return (
        <Text>
            {t("flow.history.someoneCompleted", {name: `${first_name} ${last_name}`})}
            {timestamp && (
                <>
                    {t("common.colon")}
                    <Text as="span" fontWeight="600">
                        {tz.format({date: timestamp, timezone}, "PPPPp")}
                    </Text>
                </>
            )}
        </Text>
    );
}
