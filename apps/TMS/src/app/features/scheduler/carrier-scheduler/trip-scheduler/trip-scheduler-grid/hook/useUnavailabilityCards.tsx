import {guid} from "@dashdoc/core";
import {useTimezone} from "@dashdoc/web-common";
import {SchedulerCard} from "@dashdoc/web-ui";
import {Unavailability, parseAndZoneDate} from "dashdoc-utils";
import {useCallback, useMemo, useState} from "react";

import {getResourceUid} from "../../services/tripScheduler.service";
import {TripResource, TripSchedulerView} from "../../services/tripScheduler.types";

export function useUnavailabilityCards(
    resources: TripResource[],
    view: TripSchedulerView
): {cards: SchedulerCard[]; regenerate: () => void} {
    const timezone = useTimezone();
    const [generateKey, setGenerateKey] = useState("");
    const cards: SchedulerCard[] = useMemo(
        () =>
            resources.flatMap((resource) =>
                formatUnavailabilitiesAsCards(
                    resource.unavailability ?? [],
                    getResourceUid(resource, view) as string,
                    timezone
                )
            ),
        // need to add generateKey to force recompute
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [resources, timezone, view, generateKey]
    );
    const regenerate = useCallback(() => setGenerateKey(guid()), []);
    return {cards, regenerate};
}

export function formatUnavailabilitiesAsCards(
    unavailabilities: Unavailability[],
    resourceUid: string,
    timezone: string
) {
    return unavailabilities.map((unavailability) => {
        return {
            type: "unavailability",
            itemUid: unavailability.id?.toString() ?? "",
            startDate: parseAndZoneDate(unavailability.start_date, timezone) as Date,
            endDate: parseAndZoneDate(unavailability.end_date, timezone) as Date,
            resourceUid,
            sortOrder: -1,
            height: 30,
            draggable: false,
            ignoreForOrdering: true,
            defaultSort: `0_${unavailability.id}`,
        };
    });
}
