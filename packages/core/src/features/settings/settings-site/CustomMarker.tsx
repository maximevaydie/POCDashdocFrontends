import {Box, Icon, useHackForEmotionStyle, type LatLng} from "@dashdoc/web-ui";
import Leaflet from "leaflet";
import React from "react";
import {Marker} from "react-leaflet";

type Props = {
    latlng: LatLng;
};

export function CustomMarker({latlng}: Props) {
    const customIcon = <CustomIcon />;
    const {hiddenJsx, html} = useHackForEmotionStyle(customIcon);
    const divIcon = Leaflet.divIcon({
        html: html,
        popupAnchor: [-5, -20],
    });
    return (
        <>
            <Marker position={[latlng.latitude, latlng.longitude]} icon={divIcon}></Marker>
            {hiddenJsx}
        </>
    );
}

function CustomIcon() {
    return (
        <Box width="2.3em" height="2.3em" ml={"-1.15em"} mt={"-1.15em"}>
            <Icon
                name="address"
                color="blue.default"
                backgroundColor="grey.white"
                border="1px solid"
                borderColor="blue.400"
                scale={1.5}
                round
            />
        </Box>
    );
}
