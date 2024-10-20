import {Box, Icon, IconNames, Text, useHackForEmotionStyle} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import Leaflet from "leaflet";
import React, {Dispatch, SetStateAction} from "react";
import {Marker, Popup} from "react-leaflet";

import {DirectoryCompanySimple, NetworkMapPosition} from "moderation/network-map/types";

type Props = {
    position: NetworkMapPosition;
    updateCompany: Dispatch<SetStateAction<DirectoryCompanySimple | undefined>>;
};

export function CustomMarker({position, updateCompany}: Props) {
    const customIcon = <CustomIcon position={position} />;
    const {hiddenJsx, html} = useHackForEmotionStyle(customIcon);
    const divIcon = Leaflet.divIcon({
        html: html,
        popupAnchor: [2, -12],
    });
    return (
        <>
            <Marker
                position={position.latlng}
                icon={divIcon}
                key={position.key}
                eventHandlers={{
                    click: () => {
                        updateCompany(position.company);
                    },
                }}
            >
                <Popup className="leaflet-popup" maxWidth={500}>
                    <Box minWidth={"200px"} mb={1} textAlign="center">
                        <Text>{position.company.denomination}</Text>
                    </Box>
                </Popup>
            </Marker>
            {hiddenJsx}
        </>
    );
}

const MarkerBox = styled(Box)`
    .leaflet-map-pane svg {
        left: 50%;
        top: 50%;
    }
`;

function CustomIcon({position}: {position: NetworkMapPosition}) {
    const iconColor = getIconColor(position);

    const getPinColor = (company: DirectoryCompanySimple) => {
        if (company.dashdoc_account_type == "subscribed") {
            return "green.default";
        } else if (company.has_active_managers == true) {
            return "purple.dark";
        } else if (company.has_loggable_managers == true) {
            return "purple.light";
        } else {
            return "transparent";
        }
    };

    return (
        <MarkerBox width="2.5em" height="2.5em" ml={"-0.625em"} mt={"-0.625em"}>
            <Icon
                name={iconColor.icon}
                scale={1.2}
                color={iconColor.color}
                backgroundColor={iconColor.backgroundColor}
                borderRadius="50%"
                border="1px solid"
                borderColor={iconColor.color}
                round
            />
            <Box
                position={"absolute"}
                right={"-15px"}
                top={"-7px"}
                width={"10px"}
                height={"10px"}
                backgroundColor={getPinColor(position.company)}
                borderRadius={"50%"}
            />
        </MarkerBox>
    );
}

export type ColorIcon = {
    color: string;
    backgroundColor: string;
    icon: IconNames;
};

const getIconColor = (position: NetworkMapPosition): ColorIcon => {
    const vehicleCount =
        position.company.heavy_vehicle_count + position.company.light_vehicle_count;
    if (0 < vehicleCount && vehicleCount < 6) {
        return {
            color: "grey.ultradark",
            backgroundColor: "blue.ultralight",
            icon: "truck",
        };
    } else if (6 <= vehicleCount && vehicleCount < 20) {
        return {
            color: "grey.white",
            backgroundColor: "blue.light",
            icon: "truck",
        };
    } else if (20 <= vehicleCount && vehicleCount < 50) {
        return {
            color: "grey.ultralight",
            backgroundColor: "blue.default",
            icon: "truck",
        };
    } else if (50 <= vehicleCount && vehicleCount < 100) {
        return {
            color: "grey.ultralight",
            backgroundColor: "blue.dark",
            icon: "truck",
        };
    } else if (100 <= vehicleCount && vehicleCount < 200) {
        return {
            color: "grey.ultralight",
            backgroundColor: "blue.dark",
            icon: "truck",
        };
    } else if (200 <= vehicleCount) {
        return {
            color: "grey.ultralight",
            backgroundColor: "grey.ultradark",
            icon: "truck",
        };
    } else {
        return {
            color: "grey.dark",
            backgroundColor: "grey.white",
            icon: "truck",
        };
    }
};
