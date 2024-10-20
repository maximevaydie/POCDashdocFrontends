import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";
import {DefaultSlotEvent} from "types";

type Props = {
    slotEvent: DefaultSlotEvent;
};

export function DefaultEvent({slotEvent}: Props) {
    const {
        category,
        author: {first_name, last_name},
    } = slotEvent;
    let label: string;
    const name = `${first_name} ${last_name}`;
    switch (category) {
        case "arrival_cancelled":
            label = t("flow.history.someoneCancelledArrival", {name});
            break;
        case "handling_cancelled":
            label = t("flow.history.someoneCancelledHandling", {name});
            break;
        case "completion_cancelled":
            label = t("flow.history.someoneCancelledCompletion", {name});
            break;
        default:
            label = t("common.notDefined");
    }
    return <Text>{label}</Text>;
}
