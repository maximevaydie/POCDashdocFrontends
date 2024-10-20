import {combineReducers} from "redux";

import {
    wasteShipmentsDetailReducer,
    WasteShipmentsDetailState,
} from "./wasteShipmentsDetail.slice";
import {wasteShipmentsListReducer, WasteShipmentsListState} from "./wasteShipmentsList.slice";

export const wasteReducer = combineReducers({
    wasteShipmentsList: wasteShipmentsListReducer,
    wasteShipmentsDetail: wasteShipmentsDetailReducer,
});

export type WasteState = {
    wasteShipmentsList: WasteShipmentsListState;
    wasteShipmentsDetail: WasteShipmentsDetailState;
};
