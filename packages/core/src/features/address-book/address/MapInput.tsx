import {LatLng, MapWithMarker} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Address} from "dashdoc-utils";
import React from "react";

type Props = {
    address?: Address;
    onChange: (latLng: LatLng) => void;
    disabled?: boolean;
};

const mapStyle = css`
    width: 100%;
    height: 100%;
    z-index: 1;
`;

export function MapInput({address, onChange, disabled}: Props) {
    let latLng: LatLng | undefined;
    if (address?.latitude && address?.longitude) {
        latLng = {latitude: address.latitude, longitude: address.longitude};
    }
    return (
        <MapWithMarker
            latLng={latLng}
            disabled={disabled}
            onChange={onChange}
            mapStyle={mapStyle}
        />
    );
}
