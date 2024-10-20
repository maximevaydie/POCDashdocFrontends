import {Box, Flex, Icon, Text, theme, useHackForEmotionStyle} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import Leaflet from "leaflet";
import React from "react";
import {CircleMarker, Marker, Tooltip} from "react-leaflet";

import {
    ActivityMapPosition,
    ActivityMarker,
    ActivityMarkerProps,
} from "app/features/maps/marker/activity-marker";

type CustomMarkerProps = {position: ActivityMapPosition};

export function CustomMarker({position}: CustomMarkerProps) {
    const customIcon = <CustomMarkerIcon position={position} />;
    const {hiddenJsx, html} = useHackForEmotionStyle(customIcon);
    if (position.type === "trace") {
        return (
            <CircleMarker key={position.key} center={position.latlng} radius={3}>
                {position.popupText && <Tooltip>{position.popupText}</Tooltip>}
            </CircleMarker>
        );
    } else {
        const icon = Leaflet.divIcon({
            html: html,
            popupAnchor: [-5, -20],
        });
        return (
            <>
                <Marker position={position.latlng} icon={icon} key={position.key}>
                    <MultiActivitiesTooltip
                        positions={[position, ...(position.activitiesOnSameLocation || [])]}
                        popupText={position.popupText}
                    />
                </Marker>
                {hiddenJsx}
            </>
        );
    }
}

type MultiActivitiesTooltipProps = {
    positions: ActivityMapPosition[];
    popupText?: string;
};

function MultiActivitiesTooltip({positions, popupText}: MultiActivitiesTooltipProps) {
    return (
        <StyledTooltip>
            <Flex flexDirection="column" p={3} width={220}>
                <Flex flexDirection="row">
                    {positions.map((position) =>
                        position.type === "truck" ? (
                            <Icon
                                name="truck"
                                color="blue.default"
                                backgroundColor="grey.white"
                                border="1px solid"
                                borderColor="grey.light"
                                round
                                key={position.activityIndex}
                            />
                        ) : (
                            positions.map((pos) => (
                                <ActivityMarker
                                    mr={3}
                                    mb={3}
                                    key={pos.activityIndex}
                                    activityIndex={pos.activityIndex}
                                    activityStatus={pos.activityStatus}
                                    category={pos.category}
                                />
                            ))
                        )
                    )}
                </Flex>
                {popupText ? (
                    <Text>{popupText}</Text>
                ) : (
                    <>
                        <Text style={{fontSize: 14}}>{positions[0].address?.name}</Text>
                        <Text width="100%" color="grey.dark" variant="caption">
                            {`${positions[0].address?.address}, ${positions[0].address?.postcode} ${positions[0].address?.city}, ${positions[0].address?.country}`}
                        </Text>
                    </>
                )}
            </Flex>
        </StyledTooltip>
    );
}

type CustomMarkerIconProps = {
    position: ActivityMapPosition & Pick<ActivityMarkerProps, "activityIndex" | "activityStatus">;
};

const CustomMarkerIcon: React.FC<CustomMarkerIconProps> = ({position}) => {
    return (
        <Box width="2.3em" height="2.3em" ml={"-1.15em"} mt={"-1.15em"}>
            {position.type === "truck" ? (
                <Icon
                    name="truck"
                    color="blue.default"
                    backgroundColor="grey.white"
                    border="1px solid"
                    borderColor="grey.light"
                    round
                />
            ) : (
                <ActivityMarker
                    activityStatus={position.activityStatus}
                    activityIndex={
                        (position.activitiesOnSameLocation || []).length > 0
                            ? "multiple"
                            : position.activityIndex
                    }
                    category={position.category}
                />
            )}
        </Box>
    );
};

const StyledTooltip = styled(Tooltip)`
    background: ${theme.colors.grey.white};
    box-shadow: ${theme.shadows.large};
    border-radius: 4px;
`;
