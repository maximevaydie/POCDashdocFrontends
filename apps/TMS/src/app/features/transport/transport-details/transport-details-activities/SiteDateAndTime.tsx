import {HasFeatureFlag, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickableUpdateRegion,
    DateAndTime,
    Flex,
    Icon,
    Text,
    TooltipWrapper,
    themeAwareCss,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatDate, useToggle} from "dashdoc-utils";
import React from "react";

import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

import {InconsistentDatesIcon} from "../../dates/InconsistentDatesIcon";

import {DateLimits, getSiteDatesAndTimes} from "./SiteDateAndTime.service";

import type {Site, TransportStatus} from "app/types/transport";

const ExpandIcon = styled(Icon)(
    themeAwareCss({
        cursor: "pointer",
        "&:hover": {
            background: "grey.light",
            color: "blue.default",
        },
    })
);

type HoursProps = {
    label: string;
    zonedTime: Date | null;
    zonedTelematicTime?: Date | null;
};

function Hours({zonedTime, label, zonedTelematicTime}: HoursProps) {
    if (zonedTelematicTime) {
        const tooltip = `${t("telematic.telematicHour")} ${formatDate(zonedTelematicTime, "Pp")}`;
        return (
            <TooltipWrapper content={tooltip}>
                {label} : {formatDate(zonedTime, "Pp")} <Icon name="info" />
                <br />
            </TooltipWrapper>
        );
    } else {
        return (
            <React.Fragment>
                {label} : {formatDate(zonedTime, "Pp")}
                <br />
            </React.Fragment>
        );
    }
}

type SiteDateAndTimeProps = {
    site: Site;
    updatesAskedAllowed?: boolean;
    updatesScheduledAllowed?: boolean;
    updatesRealAllowed?: boolean;
    onAskedHoursClick?: () => void;
    onSchedulerHoursClick?: () => void;
    onRealHoursClick?: () => void;
    scheduledStartRange?: {start: string; end: string};
    scheduledEndRange?: {start: string; end: string};
    statuses?: Array<TransportStatus>;
    dateLimits: DateLimits;
};

export default function SiteDateAndTime({
    site,
    updatesAskedAllowed,
    updatesScheduledAllowed,
    updatesRealAllowed,
    onAskedHoursClick,
    onSchedulerHoursClick,
    onRealHoursClick,
    scheduledStartRange,
    scheduledEndRange,
    statuses,
    dateLimits,
}: SiteDateAndTimeProps) {
    const timezone = useTimezone();
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const {hourSectionsToDisplay} = getSiteDatesAndTimes(
        timezone,
        site,
        !!updatesAskedAllowed,
        !!updatesScheduledAllowed,
        !!updatesRealAllowed,
        onAskedHoursClick,
        onSchedulerHoursClick,
        onRealHoursClick,
        scheduledStartRange,
        scheduledEndRange,
        statuses,
        dateLimits
    );

    const initialIsCollapsed =
        hourSectionsToDisplay.filter((desc) => desc.collapsable).length > 0 &&
        // and do not collapse if there are less than two hours to show (to show and set scheduled hours):
        hourSectionsToDisplay.length > 1;
    const [isCollapsed, collapse, expand] = useToggle(initialIsCollapsed);

    return (
        <React.Fragment>
            {/* Render the header of the component */}
            <Flex mb={1}>
                <Text variant="captionBold">{t("components.hours")}</Text>
                {initialIsCollapsed && (
                    <ExpandIcon
                        name={isCollapsed ? "expandVertical" : "shrinkVertical"}
                        onClick={isCollapsed ? expand : collapse}
                        fontSize={0}
                        marginLeft={1}
                        borderRadius={"50%"}
                        paddingX={1}
                        data-testid="expand-hours"
                    />
                )}
            </Flex>

            {/* Render the different sections (asked, scheduled, actual)
            that should be present according to  getSiteDatesAndTimes */}
            {hourSectionsToDisplay.map((desc) => {
                const Container = desc.clickable ? ClickableUpdateRegion : Box;
                return (
                    (!desc.collapsable || !isCollapsed) && (
                        <Container
                            key={desc.type}
                            clickable={desc.clickable}
                            onClick={desc.clickable ? desc.onClick : undefined}
                            data-testid={desc["data-testid"]}
                        >
                            <Text variant="h2" pt={1}>
                                {desc.headerText}
                            </Text>

                            {!site.address?.flow_site?.slug && desc.bookingNeeded && (
                                <Flex alignItems="center">
                                    <Icon
                                        name="calendar"
                                        color="red.default"
                                        scale={[0.6, 0.6]}
                                        flexShrink={0}
                                    ></Icon>
                                    <Text
                                        color="red.default"
                                        variant="subcaption"
                                        lineHeight={"12px"}
                                    >
                                        {t("transportForm.bookingNeeded")}
                                    </Text>
                                </Flex>
                            )}

                            {desc.slots.map((slotDesc, index) => {
                                if (slotDesc.type == "actual") {
                                    return (
                                        <Flex key={index} data-testid={`actual-hour-${index}`}>
                                            <Hours
                                                label={slotDesc.name}
                                                zonedTime={slotDesc.zonedTime}
                                                zonedTelematicTime={slotDesc.zonedTelematicTime}
                                            />
                                            <Icon
                                                name={slotDesc.icon.name}
                                                color="green.default"
                                                ml={1}
                                            />
                                        </Flex>
                                    );
                                } else {
                                    return (
                                        <React.Fragment key={index}>
                                            <Text>{slotDesc.name} </Text>
                                            <Flex>
                                                <Box>
                                                    <DateAndTime
                                                        zonedDateTimeMin={
                                                            slotDesc.zonedDateTimeMin
                                                        }
                                                        zonedDateTimeMax={
                                                            slotDesc.zonedDateTimeMax
                                                        }
                                                    />
                                                </Box>
                                                {slotDesc.isDatesInconsistent && (
                                                    <InconsistentDatesIcon />
                                                )}
                                                {desc.lockedRequestedTimes &&
                                                    hasSchedulerByTimeEnabled && (
                                                        <HasFeatureFlag flagName="schedulerByTimeUseAskedDates">
                                                            <Icon
                                                                name="lock"
                                                                color="grey.default"
                                                                flexShrink={0}
                                                                ml={2}
                                                            />
                                                        </HasFeatureFlag>
                                                    )}
                                            </Flex>
                                        </React.Fragment>
                                    );
                                }
                            })}

                            {!desc.slots.length && (
                                <Text color="grey.dark" lineHeight="unset">
                                    {t("components.addHours")}
                                </Text>
                            )}
                        </Container>
                    )
                );
            })}
        </React.Fragment>
    );
}
