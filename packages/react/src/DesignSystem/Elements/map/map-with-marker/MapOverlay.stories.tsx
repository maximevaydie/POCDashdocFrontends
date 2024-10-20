import {Box, Icon, useHackForEmotionStyle} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import Leaflet from "leaflet";
import React, {useState} from "react";
import {Marker, Popup} from "react-leaflet";

import {GenericMap} from "../GenericMap";

import {MapOverlay as MapOverlayComponent} from "./MapOverlay";

export default {
    title: "Web UI/map/MapOverlay",
    component: MapOverlayComponent,
} as Meta;

type Position = {latlng: [number, number]} & {key: number; popupText?: string};

const positions: Array<Position> = [
    {
        key: 1,
        latlng: [48.856614, 2.3522219],
        popupText: "Paris",
    },
    {
        key: 2,
        latlng: [51.507351, -0.1277583],
    },
];

function CustomIcon() {
    return (
        <Box width="2.3em" height="2.3em" ml={"-1.15em"} mt={"-1.15em"}>
            <Icon
                name="truck"
                color="blue.default"
                backgroundColor="grey.white"
                border="1px solid"
                borderColor="grey.light"
                round
            />
        </Box>
    );
}

function CustomMarker({position}: {position: Position}) {
    const customIcon = <CustomIcon />;
    const {hiddenJsx, html} = useHackForEmotionStyle(customIcon);
    const divIcon = Leaflet.divIcon({
        html: html,
        popupAnchor: [-5, -20],
    });
    return (
        <>
            <Marker position={position.latlng} icon={divIcon} key={position.key}>
                {position.popupText && <Popup>{position.popupText}</Popup>}
            </Marker>
            {hiddenJsx}
        </>
    );
}

const Template: Story = () => {
    const [cursorOverMiniMap, setCursorOverMiniMap] = useState(false);

    const markers = positions.map((position) => (
        <CustomMarker key={position.key} position={position} />
    ));
    return (
        <Box>
            <GenericMap positions={positions} zoomControl={false} markers={markers} />
            <MapOverlayComponent
                cursorOverMiniMap={cursorOverMiniMap}
                onMouseOver={() => setCursorOverMiniMap(true)}
                onMouseOut={() => setCursorOverMiniMap(false)}
                onClick={() => alert("map clicked")}
            />
        </Box>
    );
};
export const MapOverlay = Template.bind({});
