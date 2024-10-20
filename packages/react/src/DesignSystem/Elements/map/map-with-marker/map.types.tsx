import {TransportAddress} from "dashdoc-utils";
import Leaflet from "leaflet";

type MapPositionBase = {
    type: "activity" | "truck" | "trace" | "site";
    latlng: Leaflet.LatLng;
    address?: TransportAddress | null;
    popupText?: string;
    key: string;
};

export type MapPosition = MapPositionBase & {
    activitiesOnSameLocation?: MapPositionBase[];
};

export interface Coordinates {
    latitude: number | null;
    longitude: number | null;
}

export interface LatLng {
    latitude: number;
    longitude: number;
}
