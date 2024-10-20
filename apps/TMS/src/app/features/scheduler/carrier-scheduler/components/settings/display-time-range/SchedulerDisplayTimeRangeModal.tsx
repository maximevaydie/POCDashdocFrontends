import {t} from "@dashdoc/web-core";
import {Box, ErrorMessage, Flex, Modal, Text, TimePicker} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {Controller, FormProvider, UseFormReturn, useForm} from "react-hook-form";
import {z} from "zod";

import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

type Props = {
    onClose: () => void;
};

export function SchedulerDisplayTimeRangeModal({onClose}: Props) {
    const {timeRange, setTimeRange} = useSchedulerTimeAndDays();
    const form = useForm<FormType>({
        defaultValues: getDefaultValues(timeRange),
        resolver: zodResolver(schema),
    });

    const loading = form.formState.isLoading || form.formState.isSubmitting;
    const disabled = loading;

    return (
        <Modal
            title={t("scheduler.displayTimeRange")}
            data-testid="scheduler-time-range-modal"
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
                "data-testid": "secondary-button",
            }}
            size="medium"
        >
            <Form form={form} />
        </Modal>
    );

    function handleSubmit(values: FormType) {
        if (values.start > values.end || values.start === values.end) {
            form.setError("root", {type: "onSubmit", message: t("displayTimeRange.invalid")});
            return;
        }
        const range = values.start == "00:00" && values.end == "23:59" ? null : values;
        setTimeRange(range);
        onClose();
    }

    function handleClose() {
        if (loading) {
            return;
        }
        onClose();
    }
}

const schema = z.object({
    start: z.string(),
    end: z.string(),
});
type FormType = z.infer<typeof schema>;
function getDefaultValues(defaultValue: FormType | null): FormType {
    return (
        defaultValue ?? {
            start: "00:00",
            end: "23:59",
        }
    );
}
function Form({form}: {form: UseFormReturn<FormType>}) {
    const {formState, setValue, watch} = form;
    const start = watch("start");
    const end = watch("end");
    return (
        <FormProvider {...form}>
            <Text>{t("scheduler.displayTimeRange")}</Text>
            <Flex mt={3} style={{gap: "8px"}} width="100%">
                <Box flex={1}>
                    <Controller
                        name="start"
                        render={({field}) => (
                            <Box>
                                <TimePicker
                                    onChange={(option: {label: string; value: string} | null) => {
                                        if (!option) {
                                            field.onChange("00:00");
                                            return;
                                        }
                                        field.onChange(option.value);
                                        if (end < option.value) {
                                            setValue("end", option.value);
                                        }
                                    }}
                                    value={
                                        field.value !== null
                                            ? {
                                                  value: field.value,
                                                  label: field.value,
                                              }
                                            : undefined
                                    }
                                />
                            </Box>
                        )}
                    />
                </Box>

                <Box flex={1}>
                    <Controller
                        name="end"
                        render={({field}) => (
                            <TimePicker
                                onChange={(option: {label: string; value: string} | null) => {
                                    if (!option) {
                                        field.onChange("23:59");
                                        return;
                                    }
                                    field.onChange(option.value);
                                    if (start > option.value) {
                                        setValue("start", option.value);
                                    }
                                }}
                                value={
                                    field.value !== null
                                        ? {
                                              value: field.value,
                                              label: field.value,
                                          }
                                        : undefined
                                }
                            />
                        )}
                    />
                </Box>
            </Flex>
            {formState.errors?.root?.message && (
                <ErrorMessage error={formState.errors.root.message} />
            )}
        </FormProvider>
    );
}
