import {getErrorMessagesFromServerError, useDispatch, useTimezone} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Text, ErrorMessage, Modal, DateTimePickerFormInput, getISODates} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {SiteSlot} from "dashdoc-utils";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React from "react";
import {Controller, FormProvider, UseFormReturn, useForm} from "react-hook-form";
import {z} from "zod";

import {LockRequestedTimesSwitch} from "app/features/transport/transport-details/transport-details-activities/activity/LockRequestedTimesSwitch";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchBulkUpdateActivitites, fetchPartialTripUpdateAction} from "app/redux/actions/trips";

type Props = {
    tripUid: string;
    activityUids: string[];
    defaultRange?: SiteSlot | null;
    defaultLockedRequestedTimes?: boolean;
    askedDateRange: SiteSlot | null;
    onClose: () => void;
};

export function TripActivityScheduledDateEdition({
    tripUid,
    activityUids,
    defaultLockedRequestedTimes,
    defaultRange,
    askedDateRange,
    onClose,
}: Props) {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const form = useForm<FormType>({
        defaultValues: getDefaultValues(defaultRange, defaultLockedRequestedTimes),
        resolver: zodResolver(schema),
    });
    const loading = form.formState.isLoading || form.formState.isSubmitting;
    const disabled = loading;

    return (
        <Modal
            title={t("components.plannedHourModification")}
            data-testid="trip-activity-scheduled-date-edition"
            onClose={handleClose}
            mainButton={{
                children: t("common.save"),
                onClick: form.handleSubmit(handleSubmit),
                loading,
                disabled,
                "data-testid": "submit-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                disabled,
                "data-testid": "cancel-button",
            }}
            size="medium"
        >
            <Form form={form} askedDateRange={askedDateRange} />
        </Modal>
    );

    async function handleSubmit(values: FormType) {
        try {
            const {range, lockedRequestedTimes} = values;
            if (
                !range ||
                range.start === null ||
                range.end === null ||
                (range.start === defaultRange?.start &&
                    range.end === defaultRange?.end &&
                    lockedRequestedTimes === defaultLockedRequestedTimes)
            ) {
                return;
            }
            await dispatch(
                fetchPartialTripUpdateAction(activityUids, {
                    scheduled_range: range,
                    locked_requested_times: lockedRequestedTimes,
                })
            );
            await dispatch(
                fetchBulkUpdateActivitites(
                    tripUid,
                    activityUids,
                    {...range, locked_requested_times: lockedRequestedTimes},
                    extendedView
                )
            );
            onClose();
        } catch (error) {
            const errorMessage = await getErrorMessagesFromServerError(error);
            if (errorMessage && typeof errorMessage === "string") {
                form.setError("root", {type: "onSubmit", message: errorMessage});
            } else {
                Logger.error("Error during submit", error);
                form.setError("root", {type: "onSubmit", message: t("common.error")});
            }
        }
    }

    function handleClose() {
        if (loading) {
            return;
        }
        onClose();
    }
}

const schema = z.object({
    range: z
        .object({
            start: z.string(),
            end: z.string(),
        })
        .optional(),
    lockedRequestedTimes: z.boolean().optional(),
});
type FormType = z.infer<typeof schema>;
function getDefaultValues(range?: SiteSlot | null, lockedRequestedTimes?: boolean): FormType {
    return {
        range: range ?? undefined,
        lockedRequestedTimes: lockedRequestedTimes ?? undefined,
    };
}
function Form({
    form,
    askedDateRange,
}: {
    form: UseFormReturn<FormType>;
    askedDateRange: SiteSlot | null;
}) {
    const {formState, watch, setValue} = form;
    const range = watch("range");
    const timezone = useTimezone();
    return (
        <FormProvider {...form}>
            <Text color="grey.dark" variant="h1" mr={2} mb={4}>
                {t("common.plannedDate")}
            </Text>
            <Controller
                name="range"
                render={({field}) => (
                    <DateTimePickerFormInput
                        {...field}
                        autoFocus={true}
                        onChange={(value) => {
                            field.onChange(value);
                            setValue("lockedRequestedTimes", false);
                        }}
                    />
                )}
            />

            {!!askedDateRange && (
                <Controller
                    name="lockedRequestedTimes"
                    render={({field}) => (
                        <LockRequestedTimesSwitch
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                onChangeLockedRequestedTimes(value);
                            }}
                        />
                    )}
                />
            )}

            {formState.errors?.root?.message && (
                <ErrorMessage error={formState.errors.root.message} />
            )}
        </FormProvider>
    );

    function onChangeLockedRequestedTimes(value: boolean) {
        const date = range
            ? parseAndZoneDate(range.start, timezone)
            : askedDateRange
              ? parseAndZoneDate(askedDateRange.start, timezone)
              : null;
        if (value && askedDateRange && date) {
            const startTime = formatDate(
                parseAndZoneDate(askedDateRange.start, timezone),
                "HH:mm"
            );
            const endTime = formatDate(parseAndZoneDate(askedDateRange.end, timezone), "HH:mm");

            setValue("range", getISODates(date, startTime, endTime, timezone));
        }
    }
}
