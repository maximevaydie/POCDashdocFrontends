import {Logger, t} from "@dashdoc/web-core";
import {
    ABrick,
    Box,
    BrickLine,
    BrickPicker,
    Button,
    Callout,
    defaultBrickStyles,
    Flex,
    FloatingPanel,
    FloatingPanelHeader,
    Icon,
    renderInModalPortal,
    SwitchInput,
    Text,
    toast,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToggle} from "dashdoc-utils";
import {TodayDecorator} from "features/today-decorator/TodayDecorator";
import {useSiteDate} from "hooks/useSiteDate";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "redux/hooks";
import {
    updateUnavailabilities,
    UpdateUnavailabilitiesPayload,
} from "redux/reducers/flow/bookingStatus.slice";
import {actionService} from "redux/services/action.service";
import {endOfDay, startOfDay, tz} from "services/date";
import {metricsService} from "services/metrics.service";
import {BookingStatus, PartialUnavailability, partialUnavailabilitySchema, Zone} from "types";
import {z} from "zod";

import {brickService} from "./brick.service";
import {UnavailabilitiesTooltip} from "./UnavailabilitiesTooltip";

const validationSchema = z.object({
    unavailabilities: z.array(partialUnavailabilitySchema),
    allDay: z.boolean(),
});

type InputFormType = z.infer<typeof validationSchema>;

export type UnavailabilitiesFloatingPanelProps = {
    zone: Zone;
    title: string;
    status: BookingStatus;
    onClose: () => void;
};
const PANEL_ID = "unavailabilities-floating-panel";

/**
 * A modal containing a form for editing Unavailabilities.
 */
export function UnavailabilitiesPanel({
    zone,
    title,
    status,
    onClose,
}: UnavailabilitiesFloatingPanelProps) {
    const timezone = useSiteTimezone();
    const siteDate = useSiteDate();
    const {availability_status} = status;
    const {name} = zone;
    const [isDeleting, setIsDeleting, setIsDeleted] = useToggle(false);
    const dispatch = useDispatch();
    const {unavailableSlots: defaultUnavailableSlots, maxSlots: defaultMaxSlots} =
        metricsService.getMetrics(zone, status, timezone);
    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            unavailabilities: status.unavailabilities.map(
                ({end_time, start_time, slot_count}) => ({end_time, start_time, slot_count})
            ),
            allDay: defaultUnavailableSlots >= defaultMaxSlots,
        },
    });
    if (siteDate === null) {
        return null;
    }

    const {
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: {isValid, isSubmitting},
    } = methods;

    const unavailabilities: PartialUnavailability[] = watch("unavailabilities");
    const allDay: boolean = watch("allDay");

    const lines = brickService.toBrickLines(
        {availability_status, unavailabilities},
        zone,
        siteDate.timezone
    );
    const {availableSlots, unavailableSlots, overloadedSlots} = metricsService.getMetrics(
        zone,
        {availability_status, unavailabilities},
        timezone
    );
    const overload = overloadedSlots > 0;
    const canDelete = status.unavailabilities.length > 0;
    return renderInModalPortal(
        <FloatingPanel
            width="400px"
            onClose={onClose}
            backgroundColor="grey.white"
            data-testid="slot-side-panel"
        >
            <Box
                id={PANEL_ID}
                style={{display: "grid", gridTemplateRows: "1fr min-content min-content"}}
                height="100%"
            >
                <Box
                    style={{display: "grid", gridTemplateRows: "min-content min-content 1fr"}}
                    height="100%"
                    overflowY="hidden"
                >
                    <Box px={3} pt={4}>
                        <FloatingPanelHeader
                            title={
                                <Flex alignItems="center">
                                    <Text variant="title" color="grey.dark">
                                        {title}
                                    </Text>
                                    <TooltipWrapper
                                        placement="bottom"
                                        content={<UnavailabilitiesTooltip />}
                                    >
                                        <Flex ml={1}>
                                            <Icon name={"info"} />
                                        </Flex>
                                    </TooltipWrapper>
                                </Flex>
                            }
                            onClose={onClose}
                        />
                    </Box>
                    <HorizontalLine px={3} />
                    <Flex
                        overflowY="hidden"
                        flexDirection="column"
                        mx={3}
                        flexGrow={1}
                        bg="grey.ultralight"
                        py={2}
                        px={4}
                    >
                        <Flex data-testid="slot-panel-unavailabilities" pt={4}>
                            <Text variant="h1" mr={2}>
                                {tz.format(siteDate, "EEEE dd MMMM")}
                            </Text>
                            <TodayDecorator startTime={siteDate} />
                        </Flex>
                        <Text>{name}</Text>
                        <Box mt={3}>
                            <SwitchInput
                                labelRight={t("unavailability.all_day")}
                                value={allDay}
                                disabled={isSubmitting || isDeleting}
                                onChange={handleToggleAllDay}
                                data-testid="all-day-switch"
                            />
                        </Box>
                        <Flex
                            flexDirection="column"
                            overflowY={allDay ? undefined : "hidden"}
                            position="relative"
                        >
                            <BrickPicker
                                lines={lines}
                                onChange={handleUpdateUnavailabilities}
                                rootId={PANEL_ID}
                            />
                            {(allDay || isSubmitting || isDeleting) && (
                                <Box
                                    position="absolute"
                                    bg="grey.light"
                                    opacity={0.5}
                                    width="100%"
                                    height="100%"
                                />
                            )}
                        </Flex>
                    </Flex>
                </Box>
                <Box px={3}>
                    <Callout iconDisabled mt={4}>
                        <Flex justifyContent="space-between">
                            <Text>{`${unavailableSlots} ${t("flow.unavailableSlots", {
                                smart_count: unavailableSlots,
                            })} (${availableSlots} ${t("common.remaining", {
                                smart_count: availableSlots,
                            })})`}</Text>
                            <Box width="24px">
                                <ABrick {...defaultBrickStyles.emptySelected} />
                            </Box>
                        </Flex>
                    </Callout>
                    {overload && (
                        <Callout variant="danger" mt={2}>
                            <Flex justifyContent="space-between">
                                <Text>{` ${t("flow.overloadDetected")}`}</Text>
                                <Box width="24px">
                                    <ABrick {...defaultBrickStyles.fullSelected} />
                                </Box>
                            </Flex>
                        </Callout>
                    )}
                </Box>
                <Flex justifyContent="space-between" px={5} mt={4} mb={5}>
                    <Box>
                        {canDelete && (
                            <Button
                                type="button"
                                variant="plain"
                                severity="danger"
                                data-testid="flow-delete-unavailabilities"
                                confirmationMessage={t("flow.confirmDeleteUnavailability")}
                                withConfirmation
                                onClick={handleDelete}
                                disabled={!isValid || isSubmitting || isDeleting}
                                width="100%"
                            >
                                {t("common.delete")}
                            </Button>
                        )}
                    </Box>

                    <Flex>
                        <Button
                            mr={2}
                            type="button"
                            variant="secondary"
                            data-testid="flow-cancel-unavailabilities"
                            onClick={onClose}
                            disabled={!isValid || isSubmitting || isDeleting}
                            width="100%"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="button"
                            data-testid="flow-submit-unavailabilities"
                            onClick={handleSubmit(submit)}
                            disabled={!isValid || isSubmitting || isDeleting}
                            width="100%"
                        >
                            {t("common.save")}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </FloatingPanel>,
        "react-app-modal-root"
    );

    async function submit() {
        const isValidForm = await trigger(); // manually trigger validation
        if (!isValidForm) {
            return; // if the form is not valid, don't submit the form
        }
        if (siteDate === null) {
            Logger.error("siteDate is null");
            return;
        }

        let {unavailabilities} = methods.getValues();
        const payload: UpdateUnavailabilitiesPayload = {
            zone: zone.id,
            start: tz.dateToISO(startOfDay(siteDate)),
            end: tz.dateToISO(endOfDay(siteDate)),
            unavailabilities,
        };

        const {maxSlots, unavailableSlots} = metricsService.getMetrics(
            zone,
            {availability_status, unavailabilities},
            timezone
        );

        // All day detection - if all available slots are taken, we consider the day as unavailable
        const newAllDay = unavailableSlots >= maxSlots;
        if (newAllDay) {
            // then we create a single unavailability for the whole day
            payload.unavailabilities = [
                {
                    start_time: tz.dateToISO(startOfDay(siteDate)),
                    end_time: tz.dateToISO(endOfDay(siteDate)),
                    slot_count: null,
                },
            ];
        }
        const actionResult = await dispatch(updateUnavailabilities(payload));
        if (actionService.containsError(actionResult)) {
            toast.error(actionService.getError(actionResult));
        } else {
            // Update the switch state
            setValue("allDay", newAllDay);
            toast.success(t("common.unavailability.saved"));
            onClose(); // Now
        }
    }

    function handleToggleAllDay(selected: boolean) {
        setValue("allDay", selected);
        if (selected) {
            setValue(
                "unavailabilities",
                availability_status.map(({start_time, end_time}) => ({
                    start_time,
                    end_time,
                    slot_count: null,
                }))
            );
        }
    }

    async function handleDelete() {
        if (siteDate === null) {
            Logger.error("siteDate is null");
            return;
        }
        setIsDeleting();
        try {
            const payload: UpdateUnavailabilitiesPayload = {
                zone: zone.id,
                start: tz.dateToISO(startOfDay(siteDate)),
                end: tz.dateToISO(endOfDay(siteDate)),
                unavailabilities: [],
            };
            const actionResult = await dispatch(updateUnavailabilities(payload));
            if (actionService.containsError(actionResult)) {
                toast.error(actionService.getError(actionResult));
            } else {
                setValue("allDay", false);
                setValue("unavailabilities", []);
                toast.success(t("common.unavailability.deleted"));
                onClose();
            }
        } finally {
            setIsDeleted();
        }
    }

    function handleUpdateUnavailabilities(newLines: BrickLine[]) {
        const newUnavailabilities: PartialUnavailability[] = [];
        availability_status.forEach(({start_time, end_time}, index) => {
            const line = newLines[index];
            const slot_count = line.bricks.filter((brick) => brick.selected).length;
            if (slot_count > 0) {
                newUnavailabilities.push({
                    start_time,
                    end_time,
                    slot_count,
                });
            }
        });
        setValue("unavailabilities", newUnavailabilities);
    }
}
