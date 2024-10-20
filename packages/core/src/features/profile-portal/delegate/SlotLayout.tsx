import {Logger, t} from "@dashdoc/web-core";
import {Box, Flex, OnDesktop, OnMobile, Select, SelectOption} from "@dashdoc/web-ui";
import {SlotColumn} from "features/profile-portal/delegate/SlotColumn";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useState} from "react";
import {useDispatch, useSelector} from "redux/hooks";
import {selectSlot, selectSlots} from "redux/reducers/flow/slot.slice";
import {fetchSlotEvents} from "redux/reducers/flow/slotEvents.slice";
import {addDays, isBefore, isSameDay, startOfDay, tz} from "services/date";
import {slotServices} from "services/slot.service";
import {Slot, TzDate} from "types";

import {EmptyStateSVG} from "./EmptyStateSVG";

export function SlotLayout() {
    const dispatch = useDispatch();
    let slots = useSelector(selectSlots);
    const timezone = useSiteTimezone();

    // only for mobile
    const options = getOptions();
    // only for mobile
    const [timeWindow, setTimeWindow] = useState<SelectOption>(options[0]);

    slots = slotServices.sort(slots, timezone);
    if (slots.length <= 0) {
        return (
            <Box width="500px" ml={4} mt="73px">
                <EmptyStateSVG />
            </Box>
        );
    }
    const nowOnSite = tz.now(timezone);
    const startOfTodayOnSite = startOfDay(nowOnSite);
    const {todaySlots, tomorrowSlots, upcomingSlots} = getSampling(slots, startOfTodayOnSite);
    return (
        <>
            <OnDesktop>
                <Box
                    overflowX="auto"
                    p={4}
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(3, minmax(320px, 400px))`,
                        gap: "16px",
                    }}
                >
                    <SlotColumn
                        label={t("common.today")}
                        slots={todaySlots}
                        timezone={timezone}
                        onSlotClick={slotClick}
                    />
                    <SlotColumn
                        label={t("dateRangePicker.staticRanges.tomorrow")}
                        slots={tomorrowSlots}
                        timezone={timezone}
                        onSlotClick={slotClick}
                    />
                    <SlotColumn
                        label={t("flow.profilePortal.upcomingSlots")}
                        slots={upcomingSlots}
                        timezone={timezone}
                        onSlotClick={slotClick}
                    />
                </Box>
            </OnDesktop>
            <OnMobile>
                <Flex
                    px={4}
                    pb={2}
                    flexDirection="column"
                    flexGrow={1}
                    width="100vw"
                    height="100%"
                >
                    <Select
                        isSearchable={false}
                        isClearable={false}
                        options={options}
                        data-testid="select-time-window"
                        value={timeWindow}
                        styles={{
                            valueContainer: (provided) => ({
                                ...provided,
                                height: "40px",
                            }),
                        }}
                        onChange={setTimeWindow}
                    />

                    {timeWindow.value === "today" && (
                        <SlotColumn
                            label={t("common.today")}
                            slots={todaySlots}
                            timezone={timezone}
                            onSlotClick={slotClick}
                        />
                    )}

                    {timeWindow.value === "tomorrow" && (
                        <SlotColumn
                            label={t("dateRangePicker.staticRanges.tomorrow")}
                            slots={tomorrowSlots}
                            timezone={timezone}
                            onSlotClick={slotClick}
                        />
                    )}

                    {timeWindow.value === "upcoming" && (
                        <SlotColumn
                            label={t("flow.profilePortal.upcomingSlots")}
                            slots={upcomingSlots}
                            timezone={timezone}
                            onSlotClick={slotClick}
                        />
                    )}
                    {/* Free space for the search bar */}
                    <Box pt="70px" />
                </Flex>
            </OnMobile>
        </>
    );

    // only for mobile
    function getOptions(): SelectOption[] {
        return [
            {
                value: "today",
                label: t("common.today"),
            },
            {
                value: "tomorrow",
                label: t("dateRangePicker.staticRanges.tomorrow"),
            },
            {
                value: "upcoming",
                label: t("flow.profilePortal.upcomingSlots"),
            },
        ];
    }

    function slotClick(slot: Slot) {
        dispatch(selectSlot(slot.id));
        dispatch(fetchSlotEvents({slot: slot.id}));
    }

    function getSampling(allSlots: Slot[], today: TzDate) {
        const result: {todaySlots: Slot[]; tomorrowSlots: Slot[]; upcomingSlots: Slot[]} = {
            todaySlots: [],
            tomorrowSlots: [],
            upcomingSlots: [],
        };
        for (const slot of allSlots) {
            const slotDate = tz.convert(slot.start_time, today.timezone);
            if (isBefore(slotDate, today)) {
                Logger.error("Slot date is before today", slotDate, today);
            } else if (isSameDay(slotDate, today)) {
                result.todaySlots.push(slot);
            } else if (isSameDay(slotDate, addDays(today, 1))) {
                result.tomorrowSlots.push(slot);
            } else {
                result.upcomingSlots.push(slot);
            }
        }

        return result;
    }
}
