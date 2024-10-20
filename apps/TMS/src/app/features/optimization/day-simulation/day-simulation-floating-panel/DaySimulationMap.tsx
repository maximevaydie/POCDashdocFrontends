import {ErrorBoundary} from "@dashdoc/web-common";
import {Box, Flex, GenericMap, useHackForEmotionStyle} from "@dashdoc/web-ui";
import Leaflet from "leaflet";
import React, {FunctionComponent} from "react";
import {Marker, Tooltip} from "react-leaflet";

import {getEntityLatLng} from "app/features/maps/maps.service";

import {DaySimulationActivity} from "../day-simulation.types";

import {DaySimulationActivityMarker} from "./DaySimulationActivityMarker";

interface Props {
    activities: DaySimulationActivity[];
}

export const DaySimulationMap: FunctionComponent<Props> = ({activities}) => {
    const positions = getDaySimulationPositions(activities);

    const markers = positions.map((position) => (
        <DaySimulationMarker key={position.activityIndex} position={position} />
    ));
    return (
        <ErrorBoundary>
            <GenericMap
                positions={positions}
                zoomControl={true}
                markers={markers}
                scrollWheelZoom
            />
        </ErrorBoundary>
    );
};

interface DaySimulationPosition {
    latlng: Leaflet.LatLng;
    activityIndex: number;
    withRealDate: boolean;
    activitiesOnSameLocation: DaySimulationPosition[];
}

function getDaySimulationPositions(activities: DaySimulationActivity[]): DaySimulationPosition[] {
    const positions: DaySimulationPosition[] = [];

    activities.map(({address, real_datetime_range}, index) => {
        const latlng = getEntityLatLng(address);

        if (latlng !== null) {
            positions.push({
                latlng,
                activityIndex: index,
                withRealDate: real_datetime_range !== null,
                activitiesOnSameLocation: [],
            });
        }
    });

    const positionsMerged: DaySimulationPosition[] = [];
    for (const position of positions) {
        const positionAlreadyInMerged = positionsMerged.find((positionMerged) =>
            position.latlng.equals(positionMerged.latlng)
        );

        if (positionAlreadyInMerged) {
            positionAlreadyInMerged.activitiesOnSameLocation.push(position);
        } else {
            positionsMerged.push(position);
        }
    }

    return positionsMerged;
}

function DaySimulationMarker({position}: {position: DaySimulationPosition}) {
    const customIcon = <DaySimulationMarkerIcon position={position} />;
    const {hiddenJsx, html} = useHackForEmotionStyle(customIcon);
    const divIcon = Leaflet.divIcon({
        html: html,
        tooltipAnchor: [30, -5],
    });

    return (
        <>
            <Marker position={position.latlng} icon={divIcon} key={position.activityIndex}>
                {position.activitiesOnSameLocation.length > 0 &&
                    getDaySimulationTooltip([position, ...position.activitiesOnSameLocation])}
            </Marker>
            {hiddenJsx}
        </>
    );
}

function DaySimulationMarkerIcon({position}: {position: DaySimulationPosition}) {
    return (
        <Box ml={"-1.15em"} mt={"-1.15em"}>
            <DaySimulationActivityMarker
                color={position.withRealDate ? "green" : "blue"}
                diameter="2.3em"
                withBorder
                text={position.activityIndex + 1}
            />
        </Box>
    );
}

function getDaySimulationTooltip(positions: DaySimulationPosition[]) {
    return (
        <Tooltip>
            <Flex>
                {positions.map((position) => (
                    <Box mx={1} key={position.activityIndex}>
                        <DaySimulationActivityMarker
                            color={position.withRealDate ? "green" : "blue"}
                            diameter="2.3em"
                            withBorder
                            text={position.activityIndex + 1}
                        />
                    </Box>
                ))}
            </Flex>
        </Tooltip>
    );
}
