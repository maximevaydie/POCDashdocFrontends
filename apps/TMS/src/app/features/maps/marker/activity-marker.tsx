import {Flex, Icon, IconNames, Text, FlexProps, TextProps} from "@dashdoc/web-ui";
import {MapPosition} from "@dashdoc/web-ui";
import {Activity} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {TripActivityCategory} from "app/features/trip/trip.types";

export type ActivityMarkerProps = {
    activityStatus?:
        | Extract<Activity["status"], "not_started" | "on_site" | "done">
        | "cancelled"
        | "deleted";
    activityIndex?: number | "multiple" | "similar";
    category?: TripActivityCategory;
    showCategoryIcon?: boolean;
    hasBorder?: boolean;
    hasBackground?: boolean;
};

export type ActivityMapPosition = MapPosition & Partial<ActivityMarkerProps>;

const getCategoryIcon = (category?: TripActivityCategory): IconNames | null => {
    switch (category) {
        case "loading":
            return "upload";
        case "unloading":
            return "download";
        case "breaking":
        case "resuming":
            return "houseSimple";
        case "trip_start":
            return "arrowRightFull";
        case "trip_end":
            return "arrowLeftFull";
        default:
            return null;
    }
};

export const getActivityStatusColor = (activityStatus?: ActivityMarkerProps["activityStatus"]) => {
    switch (activityStatus) {
        case "done":
            return {
                color: "green.dark",
                backgroundColor: "green.ultralight",
                borderColor: "green.default",
            };
        case "on_site":
            return {
                color: "purple.dark",
                backgroundColor: "purple.ultralight",
                borderColor: "purple.default",
            };
        case "not_started":
            return {
                color: "blue.dark",
                backgroundColor: "blue.ultralight",
                borderColor: "blue.default",
            };
        case "cancelled":
        case "deleted":
            return {
                color: "red.dark",
                backgroundColor: "red.ultralight",
                borderColor: "red.default",
            };
        default:
            return {
                color: "grey.ultradark",
                backgroundColor: "grey.white",
                borderColor: "grey.light",
            };
    }
};

export const ActivityMarker: FunctionComponent<FlexProps & ActivityMarkerProps> = ({
    category,
    activityStatus,
    activityIndex,
    showCategoryIcon = false,
    hasBackground = true,
    ...props
}) => {
    let text = `${activityIndex ?? ""}`;
    let textStyle: TextProps & {color?: string} = {};
    let flexStyle: FlexProps = {};

    if (activityIndex === "multiple") {
        text = "+";
        textStyle.fontSize = 18;
    }

    const colors = getActivityStatusColor(hasBackground ? activityStatus : undefined);
    textStyle.color = colors.color;
    flexStyle.backgroundColor = colors.backgroundColor;
    flexStyle.borderColor = colors.borderColor;
    const iconName =
        activityIndex === "similar"
            ? "address"
            : showCategoryIcon
            ? getCategoryIcon(category)
            : null;

    const circleSize = activityStatus ? "2.4em" : "2.1em";
    const outlineStyle = !activityStatus
        ? {
              outlineStyle: "dashed",
              outlineWidth: "2px",
              outlineColor: flexStyle.borderColor || "grey.dark",
          }
        : {};

    return (
        <Flex
            width={circleSize}
            height={circleSize}
            borderRadius="100%"
            alignItems="center"
            justifyContent="center"
            border={activityStatus ? (hasBackground ? "2px solid" : "1px solid") : "none"}
            boxShadow={"small"}
            {...props}
            {...flexStyle}
            style={{
                position: "relative",
                ...outlineStyle,
            }}
        >
            {iconName ? (
                <Icon color={textStyle.color} name={iconName} />
            ) : (
                <Text fontFamily="monospace" {...textStyle}>
                    {text}
                </Text>
            )}
        </Flex>
    );
};
