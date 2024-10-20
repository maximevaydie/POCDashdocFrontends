import {t} from "@dashdoc/web-core";
import {Box, Button, Callout, DatePicker, Flex, Text, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {IrregularSlotTime, SlotTime} from "features/slot/actions/slot-booking/step/types";
import React, {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {
    addHours,
    addMinutes,
    intervalString,
    isBefore,
    isSameMinute,
    startOfHour,
    tz,
} from "services/date";
import {TzDate} from "types";
import {z} from "zod";

export type IrregularBookingProps = {
    onSubmit: (payload: IrregularSlotTime) => Promise<void>;
    selectedTime: SlotTime | null;
    currentDate: TzDate;
    dateRange: number;
    rootId?: string;
};

/**
 * This is an irregular slot booking form that allows the user to select a custom time range.
 * It could be used to create long or short bookings.
 */
export function IrregularBooking({
    onSubmit,
    selectedTime,
    dateRange,
    currentDate,
    rootId,
}: IrregularBookingProps) {
    const validationSchema = z
        .object({
            startTime: z.date(),
            endTime: z.date(),
        })
        .superRefine((values, ctx) => {
            const startTime = tz.convert(values.startTime, currentDate.timezone);
            const endTime = tz.convert(values.endTime, currentDate.timezone);
            if (isBefore(endTime, startTime) || isSameMinute(endTime, startTime)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.invalid_date,
                    message: t("common.error.dateEndBeforeDateStart"),
                    path: ["endTime"],
                });
            }
        });

    let defaultStartTime: TzDate;
    let defaultEndTime: TzDate;
    if (selectedTime) {
        if ("endTime" in selectedTime) {
            // set the previous custom time range
            defaultStartTime = tz.convert(selectedTime.startTime, currentDate.timezone);
            defaultEndTime = tz.convert(selectedTime.endTime, currentDate.timezone);
        } else {
            // set the previous predefined time range
            defaultStartTime = tz.convert(selectedTime.startTime, currentDate.timezone);
            defaultEndTime = addMinutes(defaultStartTime, dateRange);
        }
    } else {
        // Set a default date based on the current time (next hour)
        defaultStartTime = addHours(startOfHour(currentDate), 1);
        defaultEndTime = addMinutes(defaultStartTime, dateRange);
    }

    useEffect(() => {
        trigger(); // Validate on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    type InputFormType = z.infer<typeof validationSchema>;
    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
        mode: "onSubmit",
        defaultValues: {
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
    });

    const {
        control,
        trigger,
        formState: {isValid, isSubmitting, errors},
    } = methods;

    const values = methods.getValues();
    const leftInterval = tz.convert(values.startTime, currentDate.timezone);
    const rightInterval = tz.convert(values.endTime, currentDate.timezone);
    const intervalLabel = intervalString(leftInterval, rightInterval);

    return (
        <Box>
            <Flex flexDirection="column">
                <Controller
                    name="startTime"
                    control={control}
                    render={({field}) => {
                        const {value, onChange, ...otherField} = field;
                        return (
                            <Flex
                                flexDirection={"row"}
                                alignItems={"center"}
                                justifyContent={"space-between"}
                                mb={3}
                                pb={2}
                            >
                                <Text whiteSpace="nowrap" mr={2} minWidth="100px" textAlign="end">
                                    {t("common.from")}
                                </Text>
                                <DatePicker
                                    {...otherField}
                                    date={value}
                                    onChange={(date) => {
                                        onChange(date);
                                        trigger(); // Validate on change
                                    }}
                                    clearable={false}
                                    required={true}
                                    showTime
                                    rootId={rootId}
                                    inputProps={{textAlign: "center"}}
                                    data-testid="start-time-date"
                                />
                            </Flex>
                        );
                    }}
                />
                <Box>
                    <Controller
                        name="endTime"
                        control={control}
                        render={({field}) => {
                            const {value, onChange, ...otherField} = field;
                            return (
                                <Flex
                                    flexDirection={"row"}
                                    alignItems={"center"}
                                    justifyContent={"space-between"}
                                    mb={3}
                                    pb={2}
                                >
                                    <Text
                                        whiteSpace="nowrap"
                                        mr={2}
                                        minWidth="100px"
                                        textAlign="end"
                                    >
                                        {t("common.until")}
                                    </Text>

                                    <DatePicker
                                        {...otherField}
                                        date={value}
                                        onChange={(date) => {
                                            onChange(date);
                                            trigger(); // Validate on change
                                        }}
                                        error={!!errors.endTime}
                                        clearable={false}
                                        required={true}
                                        showTime
                                        rootId={rootId}
                                        inputProps={{textAlign: "center"}}
                                        data-testid="start-time-date"
                                    />
                                </Flex>
                            );
                        }}
                    />
                </Box>
            </Flex>
            {errors.endTime ? (
                <Callout mt={1} variant="danger">
                    {errors.endTime.message}
                </Callout>
            ) : (
                <Callout mt={1} data-testid="flow-irregular-slot-booking-duration">
                    {t("common.durationOf")} {intervalLabel}
                </Callout>
            )}
            <Button
                mt={4}
                type="button"
                data-testid="flow-submit-irregular-slot-booking"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                width="100%"
            >
                {t("common.select")}
            </Button>
        </Box>
    );

    async function handleSubmit() {
        try {
            // Validate on submit
            const isValidForm = await trigger();
            if (!isValidForm) {
                return; // if the form is not valid, don't submit the form
            }
            let payload = methods.getValues();
            const submitPayload = {
                startTime: tz.dateToISO(tz.convert(payload.startTime, currentDate.timezone)),
                endTime: tz.dateToISO(tz.convert(payload.endTime, currentDate.timezone)),
            };
            await onSubmit(submitPayload);
        } catch (e) {
            toast.error(t("common.error"));
        }
    }
}
