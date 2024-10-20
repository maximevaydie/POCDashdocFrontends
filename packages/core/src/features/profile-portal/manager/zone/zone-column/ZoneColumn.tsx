import {t} from "@dashdoc/web-core";
import {Box, Flex, OnMobile, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {DayDensityContainer} from "features/day-density/DayDensityContainer";
import {HourSection} from "features/profile-portal/manager/zone/zone-column/HourSection";
import {GridSlotValue} from "features/profile-portal/manager/zone/zone-column/types";
import {zoneService} from "features/profile-portal/manager/zone/zone-column/zone.service";
import {ZoneMetrics} from "features/profile-portal/manager/zone/zone-column/ZoneMetrics";
import {EditUnavailabilitiesAction} from "features/unavailabilities/EditUnavailabilitiesAction";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import {useSiteWeekday} from "hooks/useSiteWeekday";
import React, {useMemo, useState} from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectBookingStatusByZoneId} from "redux/reducers/flow/bookingStatus.slice";
import {slotServices} from "services/slot.service";
import {TzDate, Zone} from "types";

type Props = {
    zone: Zone;
    startDate: TzDate | null;
    endDate: TzDate | null;
};

export function ZoneColumn({zone, startDate, endDate}: Props) {
    const timezone = useSiteTimezone();
    const weekday = useSiteWeekday();
    const status = useSelector((state: RootState) => selectBookingStatusByZoneId(state, zone.id));
    const [filterEnabled, setFilter] = useState<boolean>(true);
    const gridSlots = zoneService.getGridSlots(zone, status, weekday, timezone);
    const filteredGridSlots = filter(gridSlots);
    const gridSlotsToUse = filterEnabled ? filteredGridSlots : gridSlots;
    const filterableLength = slotLength(gridSlots) - slotLength(filteredGridSlots);
    return (
        <Box
            data-testid={`zone-${zone.id}-column`}
            style={{
                display: "grid",
                gridTemplateRows: `min-content min-content min-content min-content 1fr min-content`,
            }}
            minHeight={100}
            backgroundColor="grey.ultralight"
            borderRadius={2}
            flexGrow={1}
        >
            <Flex justifyContent="end" position="relative" left="0px">
                <EditUnavailabilitiesAction zone={zone} />
            </Flex>
            <Flex flexDirection="column" justifyContent="center">
                <TooltipWrapper content={zone.name}>
                    <Text
                        variant="h1"
                        textAlign="center"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        mx={3}
                        mr="60px"
                        mt={3}
                    >
                        {zone.name}
                    </Text>
                </TooltipWrapper>
                <Text
                    data-testid={`zone-metrics`}
                    variant="caption"
                    color="grey.dark"
                    textAlign="center"
                    mt={1}
                    mx={3}
                >
                    {useMemo(
                        () => (
                            <ZoneMetrics zone={zone} />
                        ),
                        [zone]
                    )}
                </Text>
            </Flex>
            <Box mt={3}>
                {useMemo(
                    () => (
                        <DayDensityContainer
                            zone={zone}
                            startRange={startDate}
                            endRange={endDate}
                        />
                    ),
                    [zone, startDate, endDate]
                )}
            </Box>

            <Text
                onClick={() => filterableLength > 0 && setFilter((prev) => !prev)}
                color="blue.default"
                variant="caption"
                mx={5}
                mt={3}
                style={{
                    cursor: filterableLength > 0 ? "pointer" : "default",
                    visibility: filterableLength > 0 ? "visible" : "hidden",
                }}
                data-testid={`zone-${zone.id}-filter-slots-button`}
            >
                {filterEnabled
                    ? t("flow.slots.completedOrCanceled", {
                          smart_count: filterableLength,
                      })
                    : t("flow.slots.hideCompletedOrCanceled", {number: filterableLength})}
            </Text>

            <Flex
                flexDirection="column"
                overflowY="auto"
                mx={[0, 0, 3]}
                my={3}
                flexGrow={1}
                style={{gap: "10px"}}
                data-testid={`zone-${zone.id}-column-content`}
            >
                {Object.entries(gridSlotsToUse).map(([hour, gridSlotValue]) => {
                    return (
                        <HourSection
                            key={`zone-${zone}-hour-${hour}`}
                            hour={parseInt(hour)}
                            zone={zone}
                            gridSlotValue={gridSlotValue}
                        />
                    );
                })}
                <OnMobile>
                    {/* Free space for the search bar */}
                    <Box pt="70px" />
                </OnMobile>
            </Flex>
        </Box>
    );

    function filter(gridSlots: {[hour: number]: GridSlotValue}): {[hour: number]: GridSlotValue} {
        const result: {[hour: number]: GridSlotValue} = {};
        Object.entries(gridSlots).forEach(([hour, {slots, ...props}]) => {
            const filteredSlots = slots.filter(
                (slot) => !slotServices.isCompletedOrCancelled(slot)
            );
            result[parseInt(hour)] = {slots: filteredSlots, ...props};
        });
        return result;
    }

    function slotLength(gridSlots: {[hour: number]: GridSlotValue}): number {
        return Object.values(gridSlots).reduce((acc: number, {slots}) => {
            acc += slots.length;
            return acc;
        }, 0);
    }
}
