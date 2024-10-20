import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";
import {CancelledSlotEvent} from "types";

type Props = {
    slotEvent: CancelledSlotEvent;
};

export function CancelledEvent({slotEvent}: Props) {
    const {
        data: {reason},
        author: {first_name, last_name},
    } = slotEvent;
    return (
        <>
            <Text>
                {t("flow.history.someoneCancelledASlot", {name: `${first_name} ${last_name}`})}
                {t("common.colon")}
                <Text as="span" fontWeight="600">
                    {reason}
                </Text>
            </Text>
        </>
    );
}
