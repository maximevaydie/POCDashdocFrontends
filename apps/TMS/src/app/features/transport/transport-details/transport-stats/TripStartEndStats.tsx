import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React, {useEffect} from "react";

import {InformationBlockTitle} from "app/features/transport/transport-information/information-block-title";

import {NumberStat} from "./NumberStat";

import type {Transport} from "app/types/transport";

export function TripStartEndStats({transport}: {transport: Transport}) {
    const transportUid = transport.uid;

    const [tripDistance, setTripDistance] = React.useState<number | null>(null);
    const [tripDurationInSeconds, setTripDurationInSeconds] = React.useState<number | null>(null);
    const [pauseDurationInSeconds, setPauseDurationInSeconds] = React.useState<number | null>(
        null
    );

    useEffect(() => {
        async function fetchData() {
            const response = await apiService.get(`/transports/${transportUid}/trip-stats/`, {
                apiVersion: "web",
            });
            setTripDistance(response.distance);
            setTripDurationInSeconds(response.duration);
            setPauseDurationInSeconds(response.pause);
        }
        fetchData();
    }, [transportUid]);

    const tripHours = tripDurationInSeconds ? Math.floor(tripDurationInSeconds / 3600) : null;
    const tripMinutes = tripDurationInSeconds
        ? Math.floor((tripDurationInSeconds % 3600) / 60)
        : null;

    const pauseHours = pauseDurationInSeconds ? Math.floor(pauseDurationInSeconds / 3600) : null;
    const pauseMinutes = pauseDurationInSeconds
        ? Math.floor((pauseDurationInSeconds % 3600) / 60)
        : null;

    return (
        <>
            <InformationBlockTitle
                iconName="roadStraight"
                label={t("activity.distanceSubtitle")}
                minWidth="140px"
                p={3}
            >
                <NumberStat value={tripDistance} unit={t("common.units.km")} />
            </InformationBlockTitle>
            <InformationBlockTitle
                iconName="hourglass"
                label={t("transportDetails.transportStats.duration")}
                minWidth="140px"
                p={3}
            >
                {tripHours !== 0 && (
                    <NumberStat value={tripHours} unit={t("common.units.hours.short")} />
                )}{" "}
                <NumberStat value={tripMinutes} unit={t("common.units.minutes.short")} />
            </InformationBlockTitle>
            {pauseDurationInSeconds && (
                <InformationBlockTitle
                    iconName="hourglass"
                    label={t("transportDetails.transportStats.pause")}
                    minWidth="140px"
                    p={3}
                >
                    {pauseHours !== 0 && (
                        <NumberStat value={pauseHours} unit={t("common.units.hours.short")} />
                    )}{" "}
                    <NumberStat value={pauseMinutes} unit={t("common.units.minutes.short")} />
                </InformationBlockTitle>
            )}
        </>
    );
}
