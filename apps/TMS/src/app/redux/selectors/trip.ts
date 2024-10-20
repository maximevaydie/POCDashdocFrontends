import {createSelector} from "reselect";

import {
    getActivitiesWithFakeMergedActivitiesAdded,
    getCompactActivities,
} from "app/features/trip/trip.service";
import {Trip, CompactTrip} from "app/features/trip/trip.types";
import {getTripsList} from "app/redux/reducers/entities";
import {getEntities} from "app/redux/selectors/entities";

import {Entities, getFullTrip} from "../reducers";
import {RootState} from "../reducers/index";

function getTripFromEntities(tripUid: string | null | undefined, entities: Entities) {
    if (tripUid == null) {
        return null;
    }
    if (entities.schedulerTrips) {
        return getFullTrip({entities}, tripUid);
    }
    return null;
}

export const getTripByUid = createSelector(
    [(_: RootState, uid: string | null | undefined) => uid, getEntities],
    getTripFromEntities
);

export const getTripsByUids: (
    state: RootState,
    uids: Array<string> | null | undefined
) => Trip[] | null = (state, uids) => {
    if (uids == null || uids.length === 0) {
        return null;
    }
    if (state.entities.schedulerTrips) {
        return getTripsList(state.entities, uids);
    }
    return null;
};

export const getCompactTripByUid = createSelector(
    [(_: RootState, uid: string | null | undefined) => uid, getEntities],
    (tripUid, entities) => {
        const trip = getTripFromEntities(tripUid, entities);
        if (trip) {
            return {
                ...trip,
                activities: getCompactActivities(trip.activities),
            } as CompactTrip;
        }
        return null;
    }
);

export const getTripWithFakeMergedActivities = createSelector(
    [(_: RootState, uid: string | null | undefined) => uid, getEntities],
    (tripUid, entities) => {
        const trip = getTripFromEntities(tripUid, entities);
        if (trip) {
            return {
                ...trip,
                activities: getActivitiesWithFakeMergedActivitiesAdded(trip.activities),
            };
        }
        return null;
    }
);
