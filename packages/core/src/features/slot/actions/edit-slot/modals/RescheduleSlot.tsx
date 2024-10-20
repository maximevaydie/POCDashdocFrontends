import {t} from "@dashdoc/web-core";
import {Box, Text, useDevice} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {DailyAvailability} from "features/daily-availability/DailyAvailability";
import {IrregularBooking} from "features/irregular-booking/IrregularBooking";
import {SlotTime} from "features/slot/actions/slot-booking/step/types";
import {RegularToIrregular} from "features/slot/RegularToIrregular";
import {WeekNavigator} from "features/week-navigator/WeekNavigator";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useEffect, useState} from "react";
import {Control, Controller, useFormContext} from "react-hook-form";
import {useDispatch, useSelector} from "redux/hooks";
import {selectProfile} from "redux/reducers/flow";
import {
    fetchAvailabilities,
    selectAvailabilities,
    selectAvailabilitiesLoading,
} from "redux/reducers/flow/availability.slice";
import {addMinutes, tz} from "services/date";
import {filtersService} from "services/filters.service";
import {slotServices} from "services/slot.service";
import {Slot, TzDate, Zone} from "types";

type InputFormType = {
    start_time: string;
    end_time: string;
};

interface RescheduleSlotProps {
    slot: Slot;
    zone: Zone;
    control: Control<InputFormType>;
    onSelectSlotTime: (slotTime: SlotTime) => Promise<void>;
}

export function RescheduleSlot({slot, zone, control, onSelectSlotTime}: RescheduleSlotProps) {
    const availabilities = useSelector(selectAvailabilities);
    const loading = useSelector(selectAvailabilitiesLoading);
    const timezone = useSiteTimezone();
    const dispatch = useDispatch();

    const {setValue} = useFormContext(); // Access form context from parent form

    const profile = useSelector(selectProfile);

    const defaultIsIrregular = slotServices.isIrregular(slot, zone, timezone);
    const [isIrregular, setIrregular, setRegular] = useToggle(defaultIsIrregular);

    const slotStartTime = tz.convert(slot.start_time, timezone);
    const [currentDate, setCurrentDate] = useState<TzDate>(slotStartTime);
    const {startDate, endDate} = filtersService.getStartAndEnd(currentDate, 5);
    const allowPast = profile === "siteManager";
    // TODO: avoid using this hook here : only to fix the responsive issue quickly
    const device = useDevice();
    useEffect(() => {
        fetch(startDate);
    }, []);

    const selectedSlotTime = slotServices.getSlotTime(slot, zone, timezone);

    return (
        <Box
            height="100%"
            style={{
                display: "grid",
                gridTemplateRows: `min-content min-content 1fr`,
            }}
        >
            <Text data-testid="step-two-title" px={[0, 5, 5]}>
                {isIrregular ? t("flow.addSlot.setACustomSlot") : t("flow.addSlot.selectASlot")}
            </Text>
            {profile === "siteManager" && (
                <RegularToIrregular
                    isIrregular={isIrregular}
                    onIrregular={setIrregular}
                    onRegular={setRegular}
                />
            )}
            {isIrregular ? (
                <Box marginX="auto" width={device === "desktop" ? "400px" : "auto"}>
                    <IrregularBooking
                        selectedTime={selectedSlotTime}
                        currentDate={currentDate}
                        dateRange={zone.slot_duration}
                        onSubmit={handleSubmit}
                        rootId="react-app-modal-root"
                    />
                </Box>
            ) : (
                <>
                    <Box
                        marginX="auto"
                        paddingBottom={6}
                        width={device === "desktop" ? "500px" : "auto"}
                    >
                        <WeekNavigator
                            startWeek={startDate}
                            endWeek={endDate}
                            allowPast={allowPast}
                            onChange={handleDateChange}
                        />
                    </Box>
                    <Box
                        p={1}
                        margin={device === "desktop" ? "auto" : "initial"}
                        overflow={device === "desktop" ? "initial" : "scroll"}
                        height="60vh"
                    >
                        <Controller
                            name="start_time"
                            control={control}
                            render={({field}) => (
                                <DailyAvailability
                                    {...field}
                                    availabilities={availabilities}
                                    loading={loading}
                                    isMulti={false}
                                    selectedSlotTime={selectedSlotTime}
                                    onSelectSlotTime={handleSubmit}
                                    currentDate={currentDate}
                                    dateRange={5}
                                />
                            )}
                        />
                    </Box>
                </>
            )}
        </Box>
    );

    function handleDateChange(date: TzDate) {
        setCurrentDate(date);
        fetch(date);
    }

    function fetch(date: TzDate) {
        const {start, end} = filtersService.getStartAndEnd(date, 5);
        dispatch(
            fetchAvailabilities({
                zone: slot.zone,
                start,
                end,
            })
        );
    }

    async function handleSubmit(payload: SlotTime) {
        setValue("start_time", payload.startTime, {shouldValidate: true});
        if ("endTime" in payload) {
            setValue("end_time", payload.endTime, {shouldValidate: true});
        } else {
            // override end_time with slot_duration
            // (otherwise the endpoint will not turn the slot in regular time window)
            const startTime = tz.convert(payload.startTime, timezone);
            const endTime = addMinutes(startTime, zone.slot_duration);
            setValue("end_time", tz.dateToISO(endTime), {shouldValidate: true});
        }
        onSelectSlotTime(payload);
    }
}
