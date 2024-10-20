import {
    fetchAddTrailerUnavailability,
    fetchAddTruckerUnavailability,
    fetchAddVehicleUnavailability,
    fetchUpdateTrailerUnavailability,
    fetchUpdateTruckerUnavailability,
    fetchUpdateVehicleUnavailability,
    fetchDeleteTrailerUnavailability,
    fetchDeleteTruckerUnavailability,
    fetchDeleteVehicleUnavailability,
    fetchRetrieveTrailer,
    fetchRetrieveTrucker,
    fetchRetrieveVehicle,
} from "app/redux/actions";

export function getFleetUnavailabilityFunctionsByType(
    fleetType: "trucker" | "trailer" | "vehicle"
) {
    let addUnavailability;
    let editUnavailability;
    let deleteUnavailability;
    let retrieveFleetItem;
    switch (fleetType) {
        case "trucker":
            addUnavailability = fetchAddTruckerUnavailability;
            editUnavailability = fetchUpdateTruckerUnavailability;
            deleteUnavailability = fetchDeleteTruckerUnavailability;
            retrieveFleetItem = fetchRetrieveTrucker;
            break;
        case "vehicle":
            addUnavailability = fetchAddVehicleUnavailability;
            editUnavailability = fetchUpdateVehicleUnavailability;
            deleteUnavailability = fetchDeleteVehicleUnavailability;
            retrieveFleetItem = fetchRetrieveVehicle;
            break;
        case "trailer":
            addUnavailability = fetchAddTrailerUnavailability;
            editUnavailability = fetchUpdateTrailerUnavailability;
            deleteUnavailability = fetchDeleteTrailerUnavailability;
            retrieveFleetItem = fetchRetrieveTrailer;
            break;
    }
    return {addUnavailability, editUnavailability, deleteUnavailability, retrieveFleetItem};
}
