import {LatLng, Marker as LeafletMarker} from "leaflet";
import React, {useRef} from "react";
import {Circle, CircleMarker, Marker} from "react-leaflet";

import {theme} from "../../../../theme";
import {Coordinates, LatLng as LatitudeLongitude} from "../map.types";
type Props = {
    latLng: LatitudeLongitude;
    disabled: boolean;
    areaRadius?: number;
    extraMarkers?: Coordinates[];
    onDragEnd?: (latLng: LatitudeLongitude) => void;
};
export function CustomMarker({latLng, disabled, areaRadius, extraMarkers = [], onDragEnd}: Props) {
    const markerRef = useRef<LeafletMarker | null>(null);
    const {latitude, longitude} = latLng;
    return (
        <Marker
            draggable={!disabled}
            eventHandlers={{dragend: handleDragEnd}}
            ref={markerRef}
            position={[latitude, longitude]}
        >
            {areaRadius && (
                <Circle
                    center={{
                        lat: latitude,
                        lng: longitude,
                    }}
                    fillColor="blue"
                    radius={areaRadius}
                />
            )}
            {extraMarkers.map(({latitude: lat, longitude: lng}, index) => (
                <CircleMarker
                    key={`extra-marker-${index}`}
                    center={{lat, lng} as LatLng}
                    radius={3}
                    color={theme.colors.red.default}
                />
            ))}
        </Marker>
    );

    function handleDragEnd() {
        const currentMarker = markerRef.current;
        if (currentMarker && onDragEnd) {
            const latlng = currentMarker.getLatLng();
            onDragEnd({latitude: latlng.lat, longitude: latlng.lng});
        }
    }
}
