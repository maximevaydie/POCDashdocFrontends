import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text, useDevice} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {DailyAvailability} from "features/daily-availability/DailyAvailability";
import {IrregularBooking} from "features/irregular-booking/IrregularBooking";
import {Cart} from "features/slot/actions/slot-booking/step/content/components/Cart";
import {RegularSlotTime, SlotTime} from "features/slot/actions/slot-booking/step/types";
import {RegularToIrregular} from "features/slot/RegularToIrregular";
import {WeekNavigator} from "features/week-navigator/WeekNavigator";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useEffect, useState} from "react";
import {Control, Controller, useFormContext} from "react-hook-form";
import {useDispatch, useSelector} from "redux/hooks";
import {selectProfile} from "redux/reducers/flow";
import {
    fetchVirtualAvailabilities,
    selectAvailabilities,
    selectAvailabilitiesLoading,
} from "redux/reducers/flow/availability.slice";
import {addMinutes, tz} from "services/date";
import {filtersService} from "services/filters.service";
import {Zone} from "types";

interface AddSlotStepTwoProps {
    selectedZone: Zone | null;
    selectedSlotTime: SlotTime | null;
    isMulti: boolean;
    onSelectSlotTime: (slotTime: SlotTime) => Promise<void>;
    control: Control<any, object>;
}

export function AddSlotStepTwo({
    selectedZone,
    selectedSlotTime,
    isMulti,
    onSelectSlotTime,
    control,
}: AddSlotStepTwoProps) {
    const {setValue, getValues, watch} = useFormContext(); // Access form context from parent form
    const availabilities = useSelector(selectAvailabilities);
    const loading = useSelector(selectAvailabilitiesLoading);
    const timezone = useSiteTimezone();
    const [currentDate, setCurrentDate] = useState(tz.now(timezone));
    const slotsInCartStartTime: string[] = watch("slots_in_cart_start_time");
    const slotsInCart: RegularSlotTime[] = slotsInCartStartTime.map((startTime) => ({startTime}));

    const {startDate, endDate} = filtersService.getStartAndEnd(currentDate, 5);
    // TODO: avoid using this hook here : only to fix the responsive issue quickly
    const device = useDevice();
    const dispatch = useDispatch();

    const profile = useSelector(selectProfile);
    const defaultIsIrregular = selectedSlotTime !== null && "endTime" in selectedSlotTime;
    const [isIrregular, setIrregular, setRegular] = useToggle(defaultIsIrregular);

    const allowPast = profile === "siteManager";

    useEffect(() => {
        if (selectedZone) {
            handleFetch(selectedZone, slotsInCartStartTime);
        }
        // this is the initial fetch, we don't want to re-fetch when the slotsInCartStartTime (or other deps) changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedZone, currentDate]);

    return (
        <Box
            height="100%"
            style={{
                display: "grid",
                gridTemplateColumns: `1fr min-content`,
            }}
        >
            <Box
                height="100%"
                style={{
                    display: "grid",
                    gridTemplateRows: `min-content min-content 1fr`,
                }}
                pt={3}
            >
                {isMulti ? (
                    <>
                        <Text data-testid="step-two-title" px={5}>
                            {t("flow.addSlots.asYouWish")}
                        </Text>
                        <Flex px={5} mt={2}>
                            <Icon name="calendarCheck" color="grey.dark" />
                            <Text ml={1} mr={2} variant="captionBold" color="grey.dark">
                                {t("flow.addSlots.thenMoveToTheNext")}
                            </Text>
                        </Flex>
                    </>
                ) : (
                    <>
                        <Text data-testid="step-two-title" px={[0, 5, 5]}>
                            {isIrregular
                                ? t("flow.addSlot.setACustomSlot")
                                : t("flow.addSlot.selectASlot")}
                        </Text>
                        {profile === "siteManager" && (
                            <RegularToIrregular
                                isIrregular={isIrregular}
                                onIrregular={setIrregular}
                                onRegular={setRegular}
                            />
                        )}
                    </>
                )}
                {isIrregular ? (
                    <Box marginX="auto" pt={4} width={device === "desktop" ? "400px" : "auto"}>
                        <IrregularBooking
                            selectedTime={selectedSlotTime}
                            currentDate={currentDate}
                            dateRange={
                                selectedZone?.slot_duration ??
                                30 /* Default date range to secure this params */
                            }
                            onSubmit={handleSelectSlotTime}
                            rootId="react-app-modal-root"
                        />
                    </Box>
                ) : (
                    <>
                        <Box
                            marginX="auto"
                            pt={4}
                            pb={6}
                            width={device === "desktop" ? "500px" : "auto"}
                        >
                            <WeekNavigator
                                startWeek={startDate}
                                endWeek={endDate}
                                allowPast={allowPast}
                                onChange={setCurrentDate}
                            />
                        </Box>
                        <Box
                            p={1}
                            margin={device === "desktop" ? "auto" : "initial"}
                            overflow={device === "desktop" ? "initial" : "scroll"}
                            height={device === "desktop" ? "60vh" : "50vh"}
                        >
                            <Controller
                                name="start_time"
                                control={control}
                                render={({field}) => (
                                    <DailyAvailability
                                        {...field}
                                        availabilities={availabilities}
                                        loading={loading}
                                        selectedSlotTime={selectedSlotTime}
                                        onSelectSlotTime={handleSelectSlotTime}
                                        isMulti={isMulti}
                                        currentDate={currentDate}
                                        dateRange={5}
                                    />
                                )}
                            />
                        </Box>
                    </>
                )}
            </Box>
            {isMulti && (
                <Box
                    minWidth="200px"
                    borderLeft="1px solid"
                    borderLeftColor="grey.light"
                    pt={3}
                    pl={4}
                    overflowY="auto"
                    height="80vh"
                >
                    <Cart slots={slotsInCart} readonly={false} onChange={handleCartChange} />
                </Box>
            )}
        </Box>
    );

    async function handleCartChange(newSlots: RegularSlotTime[]) {
        const slotsInCartStartTime: string[] = newSlots.map((slot) => slot.startTime);
        setValue("slots_in_cart_start_time", slotsInCartStartTime);
        handleFetch(selectedZone as Zone, slotsInCartStartTime);
    }

    async function handleSelectSlotTime(payload: SlotTime) {
        if (isMulti) {
            const slotsInCartStartTime: string[] = [...getValues("slots_in_cart_start_time")];
            slotsInCartStartTime.push(payload.startTime);
            setValue("slots_in_cart_start_time", slotsInCartStartTime);
            handleFetch(selectedZone as Zone, slotsInCartStartTime);
        } else {
            setValue("start_time", payload.startTime, {shouldValidate: true});
            if ("endTime" in payload) {
                setValue("end_time", payload.endTime, {shouldValidate: true});
            } else {
                setValue("end_time", undefined, {shouldValidate: true});
            }
            onSelectSlotTime(payload);
        }
    }

    function handleFetch(zone: Zone, slotsInCartStartTime: string[]) {
        const {start, end} = filtersService.getStartAndEnd(currentDate, 5);

        const slots_in_cart = slotsInCartStartTime.map((startTime) => {
            const date = tz.convert(startTime, timezone);
            const endTime = addMinutes(date, zone.slot_duration);
            return {start_time: startTime, end_time: tz.dateToISO(endTime)};
        });
        dispatch(
            fetchVirtualAvailabilities({
                zone: zone.id,
                start,
                end,
                slots_in_cart,
            })
        );
    }
}
