import {Box, Button, Icon, Text, theme, themeAwareCss} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {MapContainer, TileLayer, useMap} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {CustomMarker} from "moderation/components/network/NetworkMapMarker";
import {getBoundaries} from "moderation/network-map/networkMapServices";
import {NetworkMapPosition} from "moderation/network-map/types";

import {MarkerClusterGroup} from "./MarkerClusterGroup";
import {createClusterCustomIcon} from "./MarkerClusterGroup";

export interface NetworkMapProps {
    positions: NetworkMapPosition[];
    zoomControl: boolean;
    setActualCompany: (company: any) => void;
    scrollWheelZoom?: boolean;
    updateCompanies: (bounds: any) => void;
}

export const NetworkMap: FunctionComponent<NetworkMapProps> = ({
    zoomControl,
    positions,
    setActualCompany,
    scrollWheelZoom,
    updateCompanies,
}) => {
    return (
        <MapContainer
            bounds={getBoundaries(positions)}
            scrollWheelZoom={scrollWheelZoom ?? false}
            style={themeAwareCss({
                height: "100%",
                width: "100%",
                fontSize: "14px",
                zIndex: "level1",
            })(theme)}
            zoomControl={zoomControl}
        >
            <DirectoryCompanyMapServices updateCompanies={updateCompanies} />
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClusterClickHandler updateCompanies={updateCompanies}>
                {positions.map((position) => (
                    <CustomMarker
                        key={position.key}
                        position={position}
                        updateCompany={setActualCompany}
                    />
                ))}
            </ClusterClickHandler>
        </MapContainer>
    );
};

export interface MarkerCluster {
    getChildCount: () => number;
}

type ClusterClickHandlerProps = {
    updateCompanies: (bounds: any) => void;
    children: React.ReactNode;
};

const ClusterClickHandler = ({updateCompanies, children}: ClusterClickHandlerProps) => {
    const map = useMap();

    const handleClusterZoomEnd = () => {
        // We need to wait for the map to update the bounds
        setTimeout(() => {
            updateCompanies(map.getBounds());
        }, 10);
    };

    return (
        <MarkerClusterGroup
            chunkedLoading={true}
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover
            animate={true}
            disableClusteringAtZoom={12}
            onMouseUp={handleClusterZoomEnd}
        >
            {children}
        </MarkerClusterGroup>
    );
};

interface DirectoryCompanyMapServicesProps {
    updateCompanies: (bounds: any) => void;
}

const DirectoryCompanyMapServices: FunctionComponent<DirectoryCompanyMapServicesProps> = ({
    updateCompanies,
}) => {
    const map = useMap();

    return (
        <Box
            position={"absolute"}
            top={2}
            marginLeft={"auto"}
            marginRight={"auto"}
            width={"auto"}
            zIndex={"insideModal"}
            style={{left: "50%", transform: "translateX(-50%)"}}
        >
            <Button
                variant={"primary"}
                onClick={() => {
                    updateCompanies(map.getBounds());
                }}
            >
                <Icon name={"refresh"} size={16} color="grey.light" />
                <Text color="grey.light" marginLeft={2}>
                    {"Search in this area"}
                </Text>
            </Button>
        </Box>
    );
};
