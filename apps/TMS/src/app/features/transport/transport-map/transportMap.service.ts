import {LastTruckPositionTrace, Trace, formatDate, parseAndZoneDate} from "dashdoc-utils";
import Leaflet from "leaflet";
import isNil from "lodash.isnil";

import {getEntityLatLng} from "app/features/maps/maps.service";
import {ActivityMapPosition} from "app/features/maps/marker/activity-marker";
import {activityService} from "app/services/transport/activity.service";
import {
    getLastTruckPositionText,
    getStatusUpdateText,
} from "app/services/transport/transportStatus.service";

import type {Activity, Transport} from "app/types/transport";

function getPositions(
    activities: Activity[],
    timezone: string,
    lastTruckPosition: LastTruckPositionTrace | null,
    traces: Trace[] = [],
    transport?: Transport
): ActivityMapPosition[] {
    const positions: ActivityMapPosition[] = [];

    let popupText = "";

    for (const [index, activity] of activities.entries()) {
        const activityComplete =
            (transport && transport.status === "done") ||
            activityService.isActivityComplete(activity);
        const activityOnSite = activityService.isActivityOnSite(activity);
        const activityIndex = index + 1;
        const activityStatus = activityComplete
            ? "done"
            : activityOnSite
              ? "on_site"
              : "not_started";

        // Position of the activity site
        const sitePosition = getEntityLatLng(activity.site.address);
        // Replace position of the activity with its last status position
        const lastStatus = [...activity.statusUpdates]
            .reverse()
            .find(
                (statusUpdate) => !isNil(statusUpdate.latitude) && !isNil(statusUpdate.longitude)
            );
        const statusPosition = getEntityLatLng(lastStatus);

        if (lastStatus) {
            popupText = getStatusUpdateText(lastStatus, true, {
                transport: transport,
                companyName: activity.site.address?.company?.name || "",
                postCode: activity.site.address?.postcode,
                timezone,
                siteIndex: activityIndex,
            });
        }

        if (statusPosition) {
            // we push the sitePosition first because we want the activity marker to be on top of the site marker if they are both in the map
            if (sitePosition) {
                positions.push({
                    type: "site",
                    key: activity.site.uid,
                    latlng: sitePosition,
                    activityIndex,
                    // we remove activiyStatus because it will make the marker use default case which is grey
                    address: activity.site.address,
                    category: activity.site.category,
                });
            }
            positions.push({
                type: "activity",
                key: activity.site.uid,
                latlng: statusPosition,
                activityIndex,
                activityStatus,
                category: activity.site.category,
                popupText,
            });
        } else if (sitePosition) {
            positions.push({
                type: "site",
                key: activity.site.uid,
                latlng: sitePosition,
                activityIndex,
                activityStatus,
                address: activity.site.address,
                category: activity.site.category,
            });
        }
    }

    if (lastTruckPosition?.latitude && lastTruckPosition?.longitude) {
        popupText = getLastTruckPositionText(lastTruckPosition);
        const truckPosition = new Leaflet.LatLng(
            parseFloat(lastTruckPosition.latitude),
            parseFloat(lastTruckPosition.longitude)
        );
        positions.push({
            type: "truck",
            key: lastTruckPosition.pk.toString(),
            latlng: truckPosition,
            popupText,
        });
    }

    for (const trace of traces) {
        positions.push({
            type: "trace",
            key: trace.id.toString(),
            latlng: getEntityLatLng(trace),
            popupText: formatDate(parseAndZoneDate(trace.time, timezone), "dd/MM - HH:mm"),
        });
    }

    return positions;
}

/**
 * Filters positions to exclude those of type "site" for the small map.
 * When not in full-screen mode, site locations are excluded if there are
 * already detailed markers present to avoid cluttering the screen.
 */
function filterPositions(positions: ActivityMapPosition[]): ActivityMapPosition[] {
    let filteredPositions = positions.filter((position) => position.type !== "site");

    filteredPositions = filteredPositions.length === 0 ? positions : filteredPositions;

    return filteredPositions;
}

export const transportMapService = {
    getPositions,
    filterPositions,
};
