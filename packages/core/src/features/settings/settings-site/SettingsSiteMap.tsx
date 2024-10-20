import {Box, BoxProps, GenericMap, LatLng} from "@dashdoc/web-ui";
import Leaflet from "leaflet";
import React from "react";

import {CustomMarker} from "./CustomMarker";

type Props = {
    latLng: LatLng;
};

export function SettingsSiteTabMap({latLng, ...props}: Props & BoxProps) {
    const {latitude, longitude} = latLng;
    const markers = (
        <>
            <CustomMarker latlng={latLng} />
        </>
    );
    const positions = [{latlng: new Leaflet.LatLng(latitude, longitude)}];
    return (
        <Box height={"400px"} width={"100%"} overflow="hidden" {...props}>
            <GenericMap
                key={`${latitude}-${longitude}`}
                positions={positions}
                markers={markers}
                zoomControl={true}
                scrollWheelZoom={true}
            />
        </Box>
    );
}
