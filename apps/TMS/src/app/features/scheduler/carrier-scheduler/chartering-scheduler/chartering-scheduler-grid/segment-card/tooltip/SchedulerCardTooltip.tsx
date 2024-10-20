import {getLoadText, t} from "@dashdoc/web-core";
import {Icon, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {RawCarrierCharteringSchedulerSegment} from "../../chartering-scheduler.types";

import type {Load} from "app/types/transport";

export const SchedulerCardTooltip: FunctionComponent<{
    loads: Load[];
    unloads: Load[];
    segment: RawCarrierCharteringSchedulerSegment;
}> = ({loads, unloads, segment}) => {
    const doneStatuses = ["unloading_complete", "done", "invoiced"];
    const originDone = [...doneStatuses, "loading_complete", "on_unloading_site"].includes(
        segment.status
    );
    const destinationDone = doneStatuses.includes(segment.status);
    return (
        <>
            <Text variant="h2">{t("common.loads")}</Text>
            {/* Loading */}
            {loads?.length === 0 && (!unloads || unloads?.length === 0) && (
                <Text variant="caption">{t("common.noLoads")}</Text>
            )}
            {loads?.length > 0 && (unloads || originDone) && (
                <Text variant="caption">
                    {t("common.transportLoading")}{" "}
                    {originDone && <Icon name="checkCircle" color="green.default" ml={1} />}
                </Text>
            )}
            {unloads && loads.length === 0 && segment.destination.category === "loading" && (
                <Text variant="caption">{t("common.noLoading")}</Text>
            )}
            {loads?.map((load, index) => (
                <Text key={index} as={"li"} variant="subcaption" lineHeight={0}>
                    {getLoadText(load)}{" "}
                </Text>
            ))}
            {/* Unloading */}
            {(unloads?.length > 0 || (loads.length > 0 && originDone)) && (
                <Text variant="caption">
                    {t("common.delivery")}
                    {destinationDone && <Icon name="checkCircle" color="green.default" ml={1} />}
                </Text>
            )}
            {(unloads ? unloads : originDone ? loads : [])?.map((load, index) => (
                <Text key={index} as={"li"} variant="subcaption" lineHeight={0}>
                    {getLoadText(load)}{" "}
                </Text>
            ))}
            {unloads && unloads.length === 0 && segment.destination.category === "unloading" && (
                <Text variant="caption">{t("common.noDelivery")}</Text>
            )}
        </>
    );
};
