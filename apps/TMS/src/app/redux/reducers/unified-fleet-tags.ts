import {FleetTag} from "dashdoc-utils";
import cloneDeep from "rfdc/default";

export default function unifiedFleetTags(state: FleetTag[] = [], action: any) {
    let newState;
    switch (action.type) {
        case "ADD_UNIFIED-FLEET_TAGS_SUCCESS":
        case "UPDATE_UNIFIED-FLEET_TAGS_SUCCESS":
            return action["unified-fleet_tags"];
        case "DELETE_UNIFIED-FLEET_TAGS_SUCCESS":
            newState = cloneDeep(state);
            const deletedItemIndex = state.findIndex((item) => item.name === action.pk);
            newState.splice(deletedItemIndex, 1);
            return newState;
        case "REQUEST_UNIFIED-FLEET_TAGS_SUCCESS":
            return action.response;
        default:
            return state;
    }
}
