import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";
import {tz} from "services/date";
import {ArrivedSlotEvent} from "types";

type Props = {
    slotEvent: ArrivedSlotEvent;
    timezone: string;
};

export function ArrivedEvent({slotEvent, timezone}: Props) {
    const {
        data: {timestamp},
        author: {first_name, last_name},
    } = slotEvent;
    return (
        <Text>
            {t("flow.history.someoneArrived", {name: `${first_name} ${last_name}`})}
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
