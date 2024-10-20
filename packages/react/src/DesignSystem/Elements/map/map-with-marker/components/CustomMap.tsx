import {useToggle} from "dashdoc-utils";
import {LeafletMouseEvent} from "leaflet";
import React, {useState} from "react";
import {TileLayer, useMap, useMapEvent} from "react-leaflet";

import {Coordinates, LatLng} from "../map.types";

import {CustomMarker} from "./CustomMarker";
const DEFAULT_ZOOM_ON_CHANGE = 14;

type Props = {
    latLng?: LatLng;
    disabled: boolean;
    areaRadius?: number;
    extraMarkers?: Coordinates[];
    onChange?: (latLng: LatLng) => void;
};

export function CustomMap({latLng, disabled, areaRadius, extraMarkers, onChange}: Props) {
    const map = useMap();
    const [isReady, setIsReady] = useToggle();
    const [latestLatLng, setLatestLatLng] = useState(latLng);
    useMapEvent("click", handleClickEvent);
    if (!isReady) {
        setIsReady();
        map.invalidateSize();
        const zoom = getZoomFromRadius(5);
        const latitude = latLng?.latitude ?? 46.774798;
        const longitude = latLng?.longitude ?? 2.465668;
        map.setView([latitude, longitude], zoom);
    } else if (
        latLng &&
        (latestLatLng?.latitude !== latLng?.latitude ||
            latestLatLng?.longitude !== latLng?.longitude)
    ) {
        setLatestLatLng(latLng);
        const currentZoom = map.getZoom();
        const zoom = getZoomFromRadius(Math.max(currentZoom, DEFAULT_ZOOM_ON_CHANGE));
        map.setView([latLng.latitude, latLng.longitude], zoom);
    }
    return (
        <>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {latestLatLng && (
                <CustomMarker
                    latLng={latestLatLng}
                    disabled={disabled || !onChange}
                    areaRadius={areaRadius}
                    extraMarkers={extraMarkers}
                    onDragEnd={onChange}
                />
            )}
        </>
    );

    function handleClickEvent(event: LeafletMouseEvent) {
        const newLongitude = event.latlng.lng;
        const newLatitude = event.latlng.lat;
        // click should set marker if there is nothing, otherwise the user should drag
        if (!newLatitude || (isNaN(newLatitude) && newLongitude) || isNaN(newLongitude)) {
            return;
        }
        map.panTo([newLatitude, newLongitude]);
        onChange?.({latitude: newLatitude, longitude: newLongitude});
    }

    function getZoomFromRadius(defaultZoom = 5) {
        const radius = areaRadius;
        if (!radius) {
            return defaultZoom;
        } else if (areaRadius !== undefined) {
            if (areaRadius < 50) {
                return 18;
            } else if (areaRadius < 100) {
                return 17;
            } else if (areaRadius < 200) {
                return 16;
            } else if (areaRadius < 400) {
                return 15;
            } else if (areaRadius < 800) {
                return 14;
            }
        }
        return 13;
    }
}
