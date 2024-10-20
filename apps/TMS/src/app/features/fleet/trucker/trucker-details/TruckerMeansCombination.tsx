import {Trucker} from "dashdoc-utils";
import React, {useContext} from "react";

import {TruckersScreenContext} from "app/screens/fleet/truckers/TruckersScreenContext";

import {MeansCombinationSection} from "../../means-combination/MeansCombinationSection";

import {TruckerDetailsPanel} from "./TruckerDetails";

interface TruckerMeansCombinationProps {
    trucker: Trucker;
}

export default function TruckerMeansCombination({trucker}: TruckerMeansCombinationProps) {
    const {currentQuery, currentPage, fetchTruckers} = useContext(TruckersScreenContext);

    return (
        <TruckerDetailsPanel>
            <MeansCombinationSection
                initialMeans={{means: trucker, type: "trucker"}}
                onUpdate={() => {
                    // Refresh truckers list after updating means combination (update may affect more than the current trucker)
                    fetchTruckers(currentQuery, {
                        fromPage: 1,
                        toPage: currentPage,
                    });
                }}
            />
        </TruckerDetailsPanel>
    );
}
