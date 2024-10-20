import {useBaseUrl, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {addHours, isAfter, isBefore, isEqual} from "date-fns";
import addDays from "date-fns/addDays";
import subDays from "date-fns/subDays";
import React, {useEffect, useMemo} from "react";
import {Link} from "react-router-dom";

import {LINK_PARTNERS} from "app/features/sidebar/constants";
import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

import SiteSchedulerHeader from "./site-scheduler-day-view/site-scheduler-header";
import SiteSchedulerRow from "./site-scheduler-day-view/site-scheduler-row";
import SiteSchedulerHourLabel from "./site-scheduler-day-view/site-scheduler-time-label";
import {SiteSchedulerSharedActivity} from "./types";

const DEFAULT_SLOTS_PER_ROW = 2;
const SITE_OPENING_HOUR = "5";
export const SITE_SCHEDULER_CONTENT_ID = "site-scheduler-content";

function getDayHours(currentDate: Date): Date[] {
    return [...Array(24)].map((_, hour: number) => {
        const date = new Date(currentDate);
        date.setHours(hour, 0, 0, 0);
        return date;
    });
}

const isAskedTimeUndefined = (sharedActivity: SiteSchedulerSharedActivity, timezone: string) => {
    const timeSlot = sharedActivity.activities?.[0].slots?.[0];

    let start = parseAndZoneDate(timeSlot.start, timezone);
    let end = parseAndZoneDate(timeSlot.end, timezone);

    start?.setSeconds(0);
    end?.setSeconds(0);
    const [startHour, startMinutes, endHour, endMinutes] = [
        start?.getHours(),
        start?.getMinutes(),
        end?.getHours(),
        end?.getMinutes(),
    ];

    if (startHour === 0 && startMinutes === 0 && endHour === 23 && endMinutes === 59) {
        return true;
    }
    return false;
};

export const getSiteActivityStartTime = (
    sharedActivity: SiteSchedulerSharedActivity,
    timezone: string
) => {
    const timeSlot = sharedActivity.activities?.[0].slots?.[0];
    return parseAndZoneDate(timeSlot?.start, timezone);
};

const getSiteActivitiesForRow = (
    siteActivities: SiteSchedulerSharedActivity[],
    timezone: string,
    currentDate: Date,
    rowHour?: Date
) => {
    // @ts-ignore
    const nextRowHour = addHours(rowHour, 1);
    return siteActivities.filter((siteActivity: SiteSchedulerSharedActivity) => {
        const start = getSiteActivityStartTime(siteActivity, timezone);
        // If there is no start time it means it is a transport created the selected day
        if (!start) {
            // We select it only if we're filtering for untimed scheduler row (no hour)
            if (!rowHour) {
                return true;
            } else {
                return false;
            }
        }

        // If the asked time is equal to {start: 00:00, end: 23:59} we consider it as untimed
        if (isAskedTimeUndefined(siteActivity, timezone)) {
            // So we select it only if we're filtering for untimed scheduler row (no hour)
            if (!rowHour) {
                /* Since we also retrieve transports by creation date, we can have activities
                 * with asked date that is not the selected day.
                 * So here we still have to check if it occurs on the selected day.*/
                const currentDateStart = new Date(currentDate);
                currentDateStart.setHours(0, 0, 0, 0);
                const currentDateEnd = new Date(currentDate);
                currentDateEnd.setHours(24, 0, 0, 0);
                return (
                    isEqual(start, currentDateStart) ||
                    (isAfter(start, currentDateStart) && isBefore(start, currentDateEnd))
                );
            } else {
                return false;
            }
        }

        return (
            // @ts-ignore
            isEqual(start, rowHour) || (isAfter(start, rowHour) && isBefore(start, nextRowHour))
        ); // Since start and rowHour are dates, this will also exclude activities that don't occur on the selected day.
    });
};

type SiteSchedulerProps = {
    onCardSelected: (siteActivity: SiteSchedulerSharedActivity) => void;
    currentDate: Date;
    slotsPerRow: number;
    siteActivities: SiteSchedulerSharedActivity[];
    currentSiteId: number;
    hasNoInvitedSites: boolean;
    updateQuery: (newQuery: Partial<SiteSchedulerQuery>) => void;
    filters: SiteSchedulerQuery;
};

export default function SiteScheduler({
    onCardSelected,
    currentDate,
    slotsPerRow,
    siteActivities,
    currentSiteId,
    hasNoInvitedSites,
    updateQuery,
    filters,
}: SiteSchedulerProps) {
    useEffect(() => {
        document.getElementById(`site-scheduler-time-row-${SITE_OPENING_HOUR}`)?.scrollIntoView();
    }, [currentSiteId]);

    const timezone = useTimezone();
    const baseUrl = useBaseUrl();

    const dayHours: Date[] = useMemo(() => getDayHours(currentDate), [currentDate]);
    const untimedSiteActivities = getSiteActivitiesForRow(siteActivities, timezone, currentDate);

    return (
        <SiteSchedulerContainer>
            <SiteSchedulerHeader
                onPreviousDayClicked={updateQuery.bind(undefined, {
                    date: formatDate(subDays(currentDate, 1), "yyyy-MM-dd"),
                })}
                onNextDayClicked={updateQuery.bind(undefined, {
                    date: formatDate(addDays(currentDate, 1), "yyyy-MM-dd"),
                })}
                untimedSiteActivities={untimedSiteActivities}
                onCardSelected={onCardSelected}
                currentDay={currentDate}
                hasNoInvitedSites={hasNoInvitedSites}
                filters={filters}
            />
            <SiteSchedulerBody>
                {hasNoInvitedSites ? (
                    <Flex flexDirection="column" maxWidth="50%" margin="auto" alignItems="center">
                        <Text variant="title" textAlign="center" mb={3}>
                            {t("siteScheduler.inviteSitesMessage")}
                        </Text>
                        <Text>
                            <Button variant="plain">
                                <Link to={`${baseUrl}${LINK_PARTNERS}`}>
                                    {t("sidebar.addressBook")}
                                </Link>
                            </Button>
                        </Text>
                    </Flex>
                ) : (
                    <>
                        <SiteSchedulerHoursContainer>
                            {dayHours.map((hour, index) => {
                                return (
                                    <Flex key={index} justifyContent={"end"}>
                                        <Box marginRight={"8px"}>
                                            <SiteSchedulerHourLabel
                                                hourLabel={formatDate(hour, "H:mm")}
                                                index={index}
                                            />
                                        </Box>
                                        <Box
                                            key={index}
                                            flex={"0 32px"}
                                            height={"72px"}
                                            borderTop={
                                                index === 0
                                                    ? ""
                                                    : `2px solid ${theme.colors.grey.light}`
                                            }
                                        />
                                    </Flex>
                                );
                            })}
                        </SiteSchedulerHoursContainer>
                        <SiteSchedulerContentContainer>
                            <Box width={"fit-content"} minWidth={"100%"}>
                                {dayHours.map((hour, index) => {
                                    return (
                                        <SiteSchedulerRow
                                            hour={hour}
                                            key={index}
                                            index={index}
                                            slotsPerRow={
                                                slotsPerRow ? slotsPerRow : DEFAULT_SLOTS_PER_ROW
                                            }
                                            siteActivities={getSiteActivitiesForRow(
                                                siteActivities,
                                                timezone,
                                                currentDate,
                                                hour
                                            )}
                                            filters={filters}
                                            onCardSelected={onCardSelected}
                                        />
                                    );
                                })}
                            </Box>
                        </SiteSchedulerContentContainer>
                    </>
                )}
            </SiteSchedulerBody>
        </SiteSchedulerContainer>
    );
}

const SiteSchedulerContentContainer = styled(Box)`
    flex: 1;
`;

const SiteSchedulerHoursContainer = styled(Box)`
    position: sticky;
    left: 0;
    flex: 0 72px;
    height: fit-content;
    background-color: ${theme.colors.grey.ultralight};
    border-right: 2px solid ${theme.colors.grey.light};
`;

const SiteSchedulerContainer = styled(Flex)`
    flex-direction: column;
    width: 100%;
    background-color: ${theme.colors.grey.ultralight};
    padding: 12px;
    border-radius: 10px;
    box-shadow: ${theme.shadows.medium};
`;

const SiteSchedulerBody = styled(Flex)`
    max-height: calc(100vh - 270px);
    overflow: auto;
`;
