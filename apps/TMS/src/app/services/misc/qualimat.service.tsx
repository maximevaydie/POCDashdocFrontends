import {getLoadText} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {formatDate, QualimatEvent, parseAndZoneDate, translate as t} from "dashdoc-utils";
import React from "react";

import {QualimatCleaningDetails} from "app/features/transport/qualimat/QualimatCleaningDetails";

export function getEventDetails(event: QualimatEvent, inlineDetails = false) {
    switch (event.category) {
        case "cleaning":
            return (
                <QualimatCleaningDetails
                    cleaning={event.details.cleaning}
                    inlineDetails={inlineDetails}
                />
            );
        case "purge":
        case "loading": {
            const load =
                event.category === "purge" ? event.details.purge.load : event.details.loading;
            const compartmentNumbers =
                event.category === "purge"
                    ? event.details.purge.compartment_numbers
                    : event.details.loading.compartment_numbers;
            return <Text>{getLoadText(load, {forceShowIDTF: true, compartmentNumbers})}</Text>;
        }
        default:
            return null;
    }
}

export function getEventType(event: QualimatEvent) {
    switch (event.category) {
        case "cleaning":
            return t("common.cleaning");
        case "purge":
            return t("qualimat.history.purge");
        case "loading":
            return t("common.transportLoading");
        default:
            return null;
    }
}

export function getEventTime(event: QualimatEvent, timezone: string) {
    let timestamp = event.created_device || event.created;
    if (event.category === "purge") {
        timestamp = event.details.purge.purge_time;
    }
    return formatDate(parseAndZoneDate(timestamp, timezone), "PPPp");
}

export function getEventIconName(event: QualimatEvent) {
    switch (event.category) {
        case "cleaning":
            return "bathroomShower";
        case "purge":
            return "synchronizeArrowsThree";
        case "loading":
            return "loading";
        default:
            return "loading";
    }
}
