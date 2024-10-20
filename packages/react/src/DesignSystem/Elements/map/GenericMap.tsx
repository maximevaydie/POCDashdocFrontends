import {theme} from "@dashdoc/web-ui";
import Leaflet from "leaflet";
import React, {FunctionComponent} from "react";
import {MapContainer, TileLayer} from "react-leaflet";

interface GenericMapProps {
    positions: Array<{latlng: Leaflet.LatLngExpression}>;
    zoomControl: boolean;
    markers: React.ReactNode;
    scrollWheelZoom?: boolean;
}

export const GenericMap: FunctionComponent<GenericMapProps> = ({
    positions,
    zoomControl,
    markers,
    scrollWheelZoom,
}) => {
    const bounds = getBoundaries(positions);

    return (
        <MapContainer
            bounds={bounds}
            scrollWheelZoom={scrollWheelZoom ?? false}
            style={{
                height: "100%",
                width: "100%",
                fontSize: "14px",
                zIndex: theme.zIndices.level1,
            }}
            zoomControl={zoomControl}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers}
        </MapContainer>
    );
};

export const getBoundaries = (
    positions: Array<{latlng: Leaflet.LatLngExpression}>
): Leaflet.LatLngBounds => {
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
