import {DistanceData} from "dashdoc-utils/dist/api/scopes/transports";
import isNil from "lodash.isnil";

export type DistanceBySegment = Record<
    string,
    Omit<DistanceData, "origin_mileage" | "destination_mileage">
>;

/**
 * Sum the distances of segments by taking into account first the user-defined distance, then telematic distance, then estimated distance
 * If one of the segments has none of these distances, the total estimated distance will be set to null.
 * @param data
 * @returns the total estimated distance
 */
export const getTotalDistanceBySegmentUid = (data: DistanceBySegment) => {
    let distance = 0;
    for (const segmentData of Object.values(data)) {
        if (!isNil(segmentData.user_distance)) {
            distance += segmentData.user_distance;
        } else if (!isNil(segmentData.telematic_distance)) {
            distance += segmentData.telematic_distance;
        } else if (!isNil(segmentData.estimated_distance)) {
            distance += segmentData.estimated_distance;
        } else {
            return null;
        }
    }
    return distance;
};
