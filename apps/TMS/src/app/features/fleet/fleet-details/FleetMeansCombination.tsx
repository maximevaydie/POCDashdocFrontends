import {Trailer, Vehicle} from "dashdoc-utils";
import React, {useContext} from "react";

import {fetchRetrieveTrailer, fetchRetrieveVehicle} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {FleetScreenContext} from "app/screens/fleet/FleetScreenContext";

import {MeansCombinationSection} from "../means-combination/MeansCombinationSection";

import {FleetDetailsPanel} from "./FleetDetails";

interface FleetMeansCombinationProps {
    fleetItem: Vehicle | Trailer;
    fleetItemType: "vehicle" | "trailer";
}

export default function FleetMeansCombination({
    fleetItemType,
    fleetItem,
}: FleetMeansCombinationProps) {
    const {currentQuery, currentPage, searchFleetItems} = useContext(FleetScreenContext);
    const dispatch = useDispatch();

    const refreshFleetItems = () => {
        searchFleetItems(currentQuery, {
            fromPage: 1,
            toPage: currentPage,
        });
        // TODO: check why the line before is not triggering a refresh for fleet details page
        dispatch(
            fleetItemType === "vehicle"
                ? fetchRetrieveVehicle(fleetItem.pk)
                : fetchRetrieveTrailer(fleetItem.pk)
        );
    };

    return (
        <FleetDetailsPanel>
            <MeansCombinationSection
                initialMeans={
                    fleetItemType === "vehicle"
                        ? {means: fleetItem as Vehicle, type: "vehicle"}
                        : {means: fleetItem as Trailer, type: "trailer"}
                }
                onUpdate={refreshFleetItems}
            />
        </FleetDetailsPanel>
    );
}
