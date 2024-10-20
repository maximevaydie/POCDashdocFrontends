import {Card} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {TripWithTransportData, TransportBadgeVariant} from "../trip.types";

import {TripActivityList} from "./trip-activity-list";
import {TripMeans} from "./trip-means/TripMeans";
import {TripName} from "./trip-name";

export const TripEditionMainSection: FunctionComponent<{
    trip: TripWithTransportData;
    readOnly: boolean;
    enableShortcut: () => void;
    disableShortcut: () => void;
    editingActivityIndex: number | null;
    setEditingActivityIndex: (index: number | null) => void;
    transportUids: string[];
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
    onSubcontract?: () => void;
}> = ({
    trip,
    readOnly,
    enableShortcut,
    disableShortcut,
    editingActivityIndex,
    setEditingActivityIndex,
    transportUids,
    getBadgeVariantByTransportUid,
    onSubcontract,
}) => {
    return (
        <Card p={5}>
            <TripName
                key={trip.name}
                tripUid={trip.uid}
                tripName={trip.name}
                disabled={readOnly}
            />
            <TripMeans
                trip={trip}
                readOnly={readOnly}
                openEditionPanel={disableShortcut}
                closeEditionPanel={enableShortcut}
                onSubcontract={onSubcontract}
            />
            <TripActivityList
                tripUid={trip.uid}
                activities={trip.activities}
                readOnly={readOnly}
                enableSubmitShortcut={enableShortcut}
                disableSubmitShortcut={disableShortcut}
                editingActivityIndex={editingActivityIndex}
                setEditingActivityIndex={setEditingActivityIndex}
                transportUids={transportUids}
                getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                isSubcontracted={trip.child_transport != null}
            />
        </Card>
    );
};
