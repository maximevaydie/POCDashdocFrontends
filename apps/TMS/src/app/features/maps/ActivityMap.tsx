import {ErrorBoundary} from "@dashdoc/web-common";
import {GenericMap} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {ActivityMapPosition} from "app/features/maps/marker/activity-marker";
import {CustomMarker} from "app/features/maps/marker/CustomMarker";

interface ActivityMapProps {
    positions: ActivityMapPosition[];
}

export const ActivityMap: FunctionComponent<ActivityMapProps> = ({positions}) => {
    const markers = positions.map((position) => CustomMarker({position}));

    return (
        <ErrorBoundary>
            <GenericMap
                positions={positions}
                zoomControl={false}
                markers={markers}
                scrollWheelZoom
            />
        </ErrorBoundary>
    );
};
