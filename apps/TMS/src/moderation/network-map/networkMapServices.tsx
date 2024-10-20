import Leaflet from "leaflet";

import {NetworkMapPosition} from "./types";

const getBoundaries = (positions: NetworkMapPosition[]): Leaflet.LatLngBounds => {
    if (positions.length > 0) {
        const bounds = Leaflet.latLngBounds(positions.map((p) => p.latlng));
        bounds.pad(0.1);
        return bounds;
    } else {
        // default boundaries, it shows Europe
        return Leaflet.latLngBounds([
            [56.056126939900096, -15.1269130882304],
            [36.13132217266353, 26.95213163313046],
        ]);
    }
};

export {getBoundaries};
