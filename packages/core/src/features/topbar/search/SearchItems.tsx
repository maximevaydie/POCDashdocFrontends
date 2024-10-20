import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React, {Fragment} from "react";
import {Slot} from "types";

import {useSiteTimezone} from "hooks/useSiteTimezone";
import {useSiteToday} from "hooks/useSiteToday";

import {SlotCardDetails} from "features/slot/slot-card-details/SlotCardDetails";

import {useDispatch} from "redux/hooks";
import {selectSlot} from "redux/reducers/flow/slot.slice";
import {fetchSlotEvents} from "redux/reducers/flow/slotEvents.slice";

import {useNavigation} from "./hooks/useNavigation";
import {flattenSlotGroups} from "./services/flattenSlotGroups.service";
import {groupSlotsByTimeRange} from "./services/groupSlotsByTimeRange.service";
type Props = {
    slots: Slot[];
    onClose: () => void;
};

type TimeRange = "today" | "tomorrow" | "thisWeek" | "later";

export function SearchItems({slots, onClose}: Props) {
    const timezone = useSiteTimezone();
    const siteDate = useSiteToday();
    const slotByTimeRange = groupSlotsByTimeRange({slots, siteDate});
    const flattenedSlots = flattenSlotGroups(slotByTimeRange);

    const initialState = {
        selectedIndex: 0,
        selectedSlotId: slots.length ? slots[0].id : null,
    };

    const navigationState = useNavigation(initialState, flattenedSlots, () => {
        // The action to execute when 'Enter' is pressed
        if (slots[navigationState.selectedIndex]) {
            slotClick(slots[navigationState.selectedIndex]);
        }
    });
    const dispatch = useDispatch();

    if (slots.length === 0) {
        return (
            <Text variant="caption" m={4}>
                {t("flow.searchBar.description")}
            </Text>
        );
    }

    return (
        <Flex flexDirection="column" overflowY="auto" p="0" maxHeight="700px">
            {Object.entries(slotByTimeRange).map(([timeRange, slots]) => (
                <Fragment key={timeRange}>
                    {slots.length > 0 && (
                        <Flex flexDirection="column" key={timeRange} mb={4}>
                            <Box backgroundColor="grey.light" mb="2">
                                <Text variant="h2" pl="4" paddingY="2">
                                    {displayTimeRange(timeRange as TimeRange)}
                                </Text>
                            </Box>
                            {slots.map((slot) => {
                                const currentSlotIndex = flattenedSlots.findIndex(
                                    (s) => s.id === slot.id
                                );
                                return (
                                    <Box
                                        data-testid="search-slot-card"
                                        key={slot.id}
                                        marginY="2"
                                        paddingX="4"
                                        onClick={() => slotClick(slot)}
                                    >
                                        <SlotCardDetails
                                            isSelected={
                                                currentSlotIndex === navigationState.selectedIndex
                                            }
                                            slot={slot}
                                            timezone={timezone}
                                        />
                                    </Box>
                                );
                            })}
                        </Flex>
                    )}
                </Fragment>
            ))}
        </Flex>
    );

    function slotClick(slot: Slot) {
        dispatch(selectSlot(slot.id));
        dispatch(fetchSlotEvents({slot: slot.id}));
        onClose();
    }

    function displayTimeRange(timeRange: TimeRange): string {
        switch (timeRange) {
            case "today":
                return t("common.today");
            case "tomorrow":
                return t("dateRangePicker.staticRanges.tomorrow");
            case "thisWeek":
                return t("dateRangePicker.staticRanges.thisWeek");
            case "later":
                return t("common.later");
            default:
                return "";
        }
    }
}
