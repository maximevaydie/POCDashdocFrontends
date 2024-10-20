import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, themeAwareCss, useResourceOffset} from "@dashdoc/web-ui";
import {TooltipWrapper} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Unavailability, formatDate, parseAndZoneDate, useToggle} from "dashdoc-utils";
import React from "react";

import UnavailabilityModal from "app/features/fleet/unavailabilities/UnavailabilityModal";
import {SchedulerCardStyle} from "app/features/scheduler/carrier-scheduler/components/card-content/SchedulerCardContent";
import {
    TripResource,
    TripSchedulerView,
    TruckerForScheduler,
    VehicleOrTrailerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useDispatch, useSelector} from "app/redux/hooks";
import {loadRequestAbsenceManagerConnector} from "app/redux/reducers/connectors";
import {getAbsencePlannerConnector, getMiddayTimeFormatted} from "app/redux/selectors/connector";

type TripCardContentProps = {
    height: number;
    width?: number;
    view: TripSchedulerView;
    resource: TripResource | undefined;
    unavailabilityId: string;
    onUnavailabilityUpdated?: () => void;
    schedulerStartDate: Date;
    schedulerEndDate: Date;
    onRightClick?: (
        event: React.MouseEvent,
        data: {resource: TripResource; unavailability: Unavailability}
    ) => void;
};

export function UnavailabilityCardContent({
    unavailabilityId,
    height,
    width,
    resource,
    view,
    onUnavailabilityUpdated,
    schedulerStartDate,
    schedulerEndDate,
    onRightClick,
}: TripCardContentProps) {
    const unavailability = resource?.unavailability?.find(
        (u) => u.id?.toString() === unavailabilityId
    );
    const [isEditing, openEdition, closeEdition] = useToggle();
    const middayTime = useSelector(getMiddayTimeFormatted);
    const timezone = useTimezone();
    const dispatch = useDispatch();
    dispatch(loadRequestAbsenceManagerConnector());
    const hasAbsencePlannerConnector = useSelector(getAbsencePlannerConnector);
    const resourceOffset = useResourceOffset();

    if (!unavailability) {
        return null;
    }

    const updateUnavailability = (unavailability: Unavailability[]) => {
        if (resource) {
            resource.unavailability = unavailability;
            onUnavailabilityUpdated?.();
        }
    };
    const startDate = parseAndZoneDate(unavailability.start_date, timezone) as Date;
    const endDate = parseAndZoneDate(unavailability.end_date, timezone) as Date;
    const startBefore = startDate < schedulerStartDate;
    const endAfter = endDate > schedulerEndDate;
    const startAfternoon = formatDate(startDate, "HH:mm") === middayTime && !startBefore;
    const endMorning = formatDate(endDate, "HH:mm") === middayTime && !endAfter;
    const canEdit =
        !!onUnavailabilityUpdated && resource?.owned_by_company && !hasAbsencePlannerConnector;

    const tooltip = (
        <Box maxWidth={"350px"}>
            <Text variant="caption" color="red.default" fontWeight="600" mr={1}>
                {getTypeLabel(unavailability.unavailability_type)}
            </Text>
            <Text variant="caption" color="red.default">
                {formatDate(startDate, "P").substring(0, 5)}{" "}
                {startAfternoon && t("unavailability.afternoon")}
                {formatDate(startDate, "P") !== formatDate(endDate, "P") && (
                    <>
                        {" "}
                        - {formatDate(endDate, "P").substring(0, 5)}{" "}
                        {endMorning && t("unavailability.morning")}
                    </>
                )}
            </Text>

            {unavailability.unavailability_note && (
                <Text variant="caption" color="grey.dark" style={{overflowWrap: "break-word"}}>
                    {unavailability.unavailability_note}
                </Text>
            )}
        </Box>
    );

    return (
        <>
            <TooltipWrapper
                content={isEditing ? null : tooltip}
                delayShow={400}
                delayHide={100}
                hideOnPress
            >
                <SchedulerCardStyle
                    border={isEditing ? "2px solid" : "none"}
                    m="2px"
                    borderLeft={"3px solid"}
                    borderColor={"red.default"}
                    height={height}
                    minHeight="30px"
                    data-testid="unavailability-card"
                    backgroundColor={"red.ultralight"}
                    onClick={canEdit ? openEdition : undefined}
                    style={canEdit ? {cursor: "pointer"} : undefined}
                    zIndex="level2"
                    position={"relative"}
                    onContextMenu={(event) => {
                        if (resource && onRightClick) {
                            event.stopPropagation();
                            onRightClick(event, {resource, unavailability});
                        }
                    }}
                    padding="3px 6px"
                >
                    {startAfternoon && width && (
                        <Stripped left={0} width={`${50 / (width ?? 1)}%`} />
                    )}
                    {endMorning && width && <Stripped right={0} width={`${50 / (width ?? 1)}%`} />}

                    <Flex
                        height="100%"
                        alignItems="center"
                        zIndex="level1"
                        position="sticky"
                        width="fit-content"
                        left={resourceOffset}
                        maxWidth="100%"
                    >
                        <Text variant="caption" color="red.default" ellipsis>
                            <b>{getTypeLabel(unavailability.unavailability_type)}</b>
                            {unavailability.unavailability_note
                                ? " : " + unavailability.unavailability_note
                                : ""}
                        </Text>
                    </Flex>
                </SchedulerCardStyle>
            </TooltipWrapper>
            {isEditing && resource && (
                <UnavailabilityModal
                    unavailability={unavailability}
                    fleetItemPk={resource.pk}
                    fleetItemName={
                        view === "trucker"
                            ? (resource as TruckerForScheduler).user.last_name +
                              " " +
                              (resource as TruckerForScheduler).user.first_name
                            : (resource as VehicleOrTrailerForScheduler).license_plate
                    }
                    type={view}
                    onClose={closeEdition}
                    onSave={updateUnavailability}
                />
            )}
        </>
    );
}

function getTypeLabel(unavailability_type: Unavailability["unavailability_type"]) {
    switch (unavailability_type) {
        // UNAVAILABILITY_TRUCKER_TYPES
        case "paid_vacation":
            return t("unavailability.paid_vacation");
        case "day_off":
            return t("unavailability.day_off");
        case "sick_leave":
            return t("unavailability.sick_leave");
        case "training":
            return t("unavailability.training");
        case "vacation":
            return t("unavailability.vacation");
        // UNAVAILABILITY_VEHICLE_TYPES
        case "maintenance":
            return t("unavailability.maintenance");
        case "rental":
            return t("unavailability.rental");
    }
    return t("unavailability.other");
}

export const Stripped = styled(Box)(() =>
    themeAwareCss({
        top: 0,
        bottom: 0,
        position: "absolute",
        background: `linear-gradient(-45deg, transparent 12.5%, white 12.5%, white 37.5%, transparent 37.5%, transparent 62.5%, white 62.5%, white 87.5%, transparent 87.5%)`,
        backgroundSize: "50px 50px",
        backgroundColor: "red.ultralight",
    })
);
