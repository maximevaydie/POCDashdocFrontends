import {useTimezone} from "@dashdoc/web-common";
import {ErrorBoundary} from "@dashdoc/web-common";
import {Box} from "@dashdoc/web-ui";
import {formatDate, Trace, parseAndZoneDate} from "dashdoc-utils";
import {default as L, default as Leaflet} from "leaflet";
import React from "react";
import {CircleMarker, MapContainer, TileLayer, Tooltip} from "react-leaflet";

type Props = {
    traces: Trace[];
};

export function TraceMap(mProps: Props) {
    let elements: any[] = [];
    let boundsPositions: Leaflet.LatLng[] = [];

    const timezone = useTimezone();

    for (let trace of mProps.traces) {
        if (trace.latitude && trace.longitude) {
            let pos = new Leaflet.LatLng(trace.latitude, trace.longitude);
            elements.push(
                <CircleMarker key={trace.id} center={pos} radius={3}>
                    <Tooltip>
                        {formatDate(parseAndZoneDate(trace.time, timezone), "dd/MM - HH:mm")}
                    </Tooltip>
                </CircleMarker>
            );
            boundsPositions.push(pos);
        }
    }

    const bounds: Leaflet.LatLngBounds = Leaflet.latLngBounds(boundsPositions);

    const props: {center: Leaflet.LatLng; zoom: number; bounds?: Leaflet.LatLngBounds} = {
        center: L.latLng(48.85, 2.35), // if no traces, the map is centered on the location of Paris, France
        zoom: 4,
    };

    if (bounds.isValid()) {
        props.bounds = bounds;
    }

    return (
        <div style={{zIndex: 1}}>
            <ErrorBoundary>
                <Box display="inline-block" position="relative" width={1} height="40vh" mb={2}>
                    <MapContainer style={{width: "100%", height: "100%", zIndex: 1}} {...props}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {elements}
                    </MapContainer>
                </Box>
            </ErrorBoundary>
        </div>
    );
}
