import {css} from "@emotion/react";
import {Meta, Story} from "@storybook/react/types-6-0";
import {LatLng} from "map/map-with-marker/map.types";
import React from "react";

import {MapWithMarker as MapWithMarkerComponent, MapWithMarkerProps} from "./MapWithMarker";

const mapStyle = css`
    width: 100%;
    height: 100%;
    z-index: 1;
`;

export default {
    title: "Web UI/map/MapWithMarker",
    component: MapWithMarkerComponent,
    args: {
        coordinates: {latitude: 48.856614, longitude: 2.3522219},
        areaRadius: 500,
        extraMarkers: [],
        hideCoordinates: false,
        disabled: false,
        onChange: (latLng: LatLng) => alert(latLng),
        mapStyle: mapStyle,
    },
} as Meta;

const Template: Story<MapWithMarkerProps> = (args) => {
    return <MapWithMarkerComponent {...args} />;
};
export const MapWithMarker = Template.bind({});
