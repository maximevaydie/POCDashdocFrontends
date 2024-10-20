import {Logger, t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    DateRangePicker,
    Modal,
    DateRangePickerRange,
    StaticRange,
    Text,
    dateRangePickerDefaultStaticRanges,
    toast,
} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "redux/hooks";
import {exportSlots} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {addMonths, endOfMonth, startOfMonth, tz} from "services/date";
import {Site, TzDate} from "types";
import {z} from "zod";

type Props = {
    site: Site;
    onClose: () => void;
};

export function ExportModal({site, onClose}: Props) {
    const dispatch = useDispatch();
    const timezone = useSiteTimezone();
    let validationSchema = z.object({
        period_start: z.string().nonempty(t("errors.field_cannot_be_empty")),
        period_end: z.string().nonempty(t("errors.field_cannot_be_empty")),
    });
    type FormType = z.infer<typeof validationSchema>;
    const methods = useForm<FormType>({
        resolver: zodResolver(validationSchema),
        mode: "onChange",
        defaultValues: {
            period_start: tz.dateToISO(
                startOfMonth(addMonths(tz.convert(new Date(), timezone), -1))
            ),
            period_end: tz.dateToISO(endOfMonth(addMonths(tz.convert(new Date(), timezone), -1))),
        },
    });
    const {
        handleSubmit,
        trigger,
        watch,
        setValue,
        reset,
        formState: {isValid, isSubmitting},
    } = methods;
    const canSubmit = isValid && !isSubmitting;

    const period_start = watch("period_start");
    const startDate = tz.convert(period_start, timezone);
    const period_end = watch("period_end");
    const endDate = tz.convert(period_end, timezone);
    let range: DateRangePickerRange = {
        startDate,
        endDate,
    };

    return (
        <Modal
            title={t("common.export")}
            id="export-modal"
            data-testid="export-modal"
            onClose={handleClose}
            mainButton={{
                children: t("common.export"),
                onClick: handleSubmit(submit),
                loading: isSubmitting,
                disabled: !canSubmit,
            }}
            secondaryButton={{
                children: isSubmitting ? t("common.close") : t("common.cancel"),
            }}
            preventClosingByMouseClick
        >
            <Box px={4}>
                <Text>{t("common.export.selectPeriod")}</Text>
                <Box mt={4}>
                    <DateRangePicker
                        data-testid={"filters-period"}
                        staticRanges={staticRanges}
                        range={range}
                        rootId="react-app-modal-root"
                        label={<DatePickerLabel startDate={startDate} endDate={endDate} />}
                        onChange={(range: DateRangePickerRange) => {
                            if (range.startDate && range.endDate) {
                                const startDate = tz.convert(range.startDate, timezone);
                                const period_start = tz.dateToISO(startDate);
                                const endDate = tz.convert(range.endDate, timezone);
                                const period_end = tz.dateToISO(endDate);
                                setValue("period_start", period_start);
                                setValue("period_end", period_end);
                            }
                        }}
                    />
                </Box>
            </Box>
        </Modal>
    );

    async function submit() {
        const isValidForm = await trigger();
        if (!isValidForm) {
            return;
        }
        try {
            const {period_start, period_end} = methods.getValues();
            const actionResult = await dispatch(
                exportSlots({
                    site_id: site.id,
                    export_type: "excel",
                    period_start,
                    period_end,
                })
            );
            if (actionService.containsError(actionResult)) {
                toast.error(actionService.getError(actionResult));
                return;
            }
            if (actionResult.payload.file_url) {
                toast.success(t("flow.export.success"));
                window.open(actionResult.payload.file_url, "_blank");
            } else {
                toast.error(t("flow.export.error"));
            }
        } catch (e) {
            Logger.error(e);
        }
    }

    function handleClose() {
        reset();
        onClose();
    }
}

export const staticRanges: Record<string, StaticRange> = {
    today: dateRangePickerDefaultStaticRanges["today"],
    last_week: dateRangePickerDefaultStaticRanges["last_week"],
    last_month: dateRangePickerDefaultStaticRanges["last_month"],
};

function DatePickerLabel({startDate, endDate}: {startDate: TzDate; endDate: TzDate}) {
    return (
        <>
            <Box flexGrow={1}>
                <Badge shape="squared">{`${tz.format(startDate, "P")} -  ${tz.format(
                    endDate,
                    "P"
                )}`}</Badge>
            </Box>
        </>
    );
}
