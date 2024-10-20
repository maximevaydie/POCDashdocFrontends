import {Box, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
import {MapContainer} from "react-leaflet";

import {CustomMap} from "./components/CustomMap";
import {Coordinates, LatLng} from "./map.types";
import {MapCoordinates} from "./MapCoordinates";

const StyledMapContainer = styled("div")`
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid ${theme.colors.grey.light};
    border-bottom-width: 3px;
    margin-bottom: 18px;
`;

const defaultMapStyle = css`
    width: 100%;
    height: 400px;
    z-index: 1;
`;

export type MapWithMarkerProps = {
    latLng?: LatLng;
    areaRadius?: number;
    extraMarkers?: Coordinates[];
    disabled?: boolean;
    showCoordinates?: boolean;
    mapStyle?: any;
    onChange?: (latLng: LatLng) => void;
};

export function MapWithMarker({
    latLng,
    disabled = false,
    areaRadius,
    extraMarkers,
    showCoordinates = false,
    mapStyle = defaultMapStyle,
    onChange,
}: MapWithMarkerProps) {
    return (
        <Box id="company-map-id" height="100%">
            <StyledMapContainer>
                {showCoordinates && latLng && <MapCoordinates latLng={latLng} />}
                <MapContainer css={mapStyle}>
                    <CustomMap
                        latLng={latLng}
                        disabled={disabled}
                        areaRadius={areaRadius}
                        extraMarkers={extraMarkers}
                        onChange={onChange}
                    />
                </MapContainer>
            </StyledMapContainer>
        </Box>
    );
}
