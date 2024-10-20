import {t} from "@dashdoc/web-core";
import {Zone} from "types";
import {z} from "zod";

import {ZoneRawData} from "./types";

function getSchema() {
    const schema = z
        .object({
            name: z.string().min(1),
            description: z.string(),
            delegable: z.boolean(),
            booking_in_turns: z.boolean(),
            concurrent_slots: z.number(),
            max_visibility: z.number().nullable(),
            notice_period: z.number().nullable(), // Relative hours
            notice_period_mode: z
                .union([z.literal("rolling_hours_window"), z.literal("relative_datetime")])
                .nullable(),
            notice_period_days_before_booking: z.number().nullable(),
            notice_period_time_of_day: z.string().nullable(),
            slot_duration: z.number(),
            opening_hours: z.record(
                z.array(
                    z.array(
                        z
                            .string()
                            .min(2)
                            .max(5)
                            .refine(isValidTime, {
                                message: t("error.invalidTime"),
                            })
                    )
                )
            ),
            custom_fields: z.array(
                z.object({
                    id: z.number().optional(),
                    label: z.string().refine((value) => value.length > 0, {
                        message: t("common.mandatoryField"),
                    }),
                    required: z.boolean(),
                    visible_on_card: z.boolean().optional(),
                })
            ),
        })
        .superRefine((values, ctx) => {
            if (values.notice_period_mode === "relative_datetime") {
                if (values.notice_period_days_before_booking === null) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t("common.mandatoryField"),
                        path: ["notice_period_days_before_booking"],
                    });
                }
                if (values.notice_period_time_of_day === null) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t("common.mandatoryField"),
                        path: ["notice_period_time_of_day"],
                    });
                } else {
                    const [hours, minutes] = values.notice_period_time_of_day.split(":");
                    if (
                        hours === undefined &&
                        hours === null &&
                        minutes === undefined &&
                        minutes === null
                    ) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t("error.invalidTime"),
                            path: ["notice_period_time_of_day"],
                        });
                    }
                }
            } else if (values.notice_period_mode === "rolling_hours_window") {
                if (values.notice_period === null) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t("common.mandatoryField"),
                        path: ["notice_period"],
                    });
                }
            }
        });
    return schema;
}

function isValidTime(value: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
}

const defaultOpeningHours = {
    monday: [["08:00", "18:00"]],
    tuesday: [["08:00", "18:00"]],
    wednesday: [["08:00", "18:00"]],
    thursday: [["08:00", "18:00"]],
    friday: [["08:00", "18:00"]],
    saturday: [],
    sunday: [],
};

function getDefaultValues(zone?: Zone) {
    const result: ZoneRawData = {
        name: zone?.name || "",
        description: zone?.description || "",
        delegable: zone?.delegable || false,
        booking_in_turns: zone?.booking_in_turns || false,
        max_visibility: zone?.max_visibility || null,
        notice_period_mode: zone?.notice_period_mode ?? null,
        notice_period: zone?.notice_period || null, // Relative hours
        notice_period_days_before_booking: zone?.notice_period_days_before_booking || 0,
        notice_period_time_of_day: zone?.notice_period_time_of_day || null,
        concurrent_slots: zone?.concurrent_slots || 1,
        slot_duration: zone?.slot_duration || 30,
        opening_hours: {...(zone?.opening_hours ?? defaultOpeningHours)},
        custom_fields: zone?.custom_fields || [],
    };
    return result;
}

export const zoneFormService = {
    getSchema,
    getDefaultValues,
};
