import {t} from "@dashdoc/web-core";
import {Box, Select, TextInput, SelectOption} from "@dashdoc/web-ui";
import {SupportType} from "dashdoc-utils";
import {Field, Form, FormikProvider, useFormik} from "formik";
import React, {forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState} from "react";

import SupportTypeSelect from "app/features/transport/transport-form/support-exchanges/SupportTypeSelect";

import {getSupportExchangeInitialValues} from "../transport-form-initial-values";
import {TransportFormActivity, TransportFormSupportExchange} from "../transport-form.types";

type SupportExchangeFormFieldProps = {
    error?: string;
    label: string;
    fieldName: string;
    onChangeFunction: (field: string, value: any) => void;
    testid: string;
    value: number;
};

function SupportExchangeFormField({
    error,
    label,
    fieldName,
    onChangeFunction,
    testid,
    value,
}: SupportExchangeFormFieldProps) {
    return (
        <Box width="100%" mb={4}>
            <TextInput
                name={fieldName}
                label={label}
                error={error}
                value={value?.toString()}
                onChange={(value: string) => {
                    onChangeFunction(fieldName, parseInt(value) || 0);
                }}
                data-testid={testid}
            />
        </Box>
    );
}

type SupportExchangeFormProps = {
    supportExchangeToEdit: TransportFormSupportExchange | null;
    loadings: Partial<TransportFormActivity>[];
    unloadings: Partial<TransportFormActivity>[];
    onSubmit: (supportExchange: TransportFormSupportExchange) => void;
    onClose: () => void;
};

export const SupportExchangeForm = forwardRef(function (
    {supportExchangeToEdit, loadings, unloadings, onSubmit, onClose}: SupportExchangeFormProps,
    ref: Ref<any>
) {
    const [submitMode, setSubmitMode] = useState<"save" | "saveAndAdd">("save");

    const activities = [...loadings, ...unloadings];

    const validateValues = (values: TransportFormSupportExchange) => {
        const errors: Partial<{[key in keyof TransportFormSupportExchange]: string}> = {};
        if (!values.type) {
            errors.type = t("common.mandatoryField");
        }
        if (!values.activity) {
            errors.activity = t("common.mandatoryField");
        }
        return errors;
    };

    const formik = useFormik({
        validateOnChange: false,
        validateOnBlur: false,
        initialValues: supportExchangeToEdit ?? getSupportExchangeInitialValues(activities),
        validate: validateValues,
        onSubmit: (supportExchange) => {
            onSubmit(supportExchange);
            if (submitMode === "saveAndAdd") {
                formik.resetForm({
                    values: getSupportExchangeInitialValues(activities),
                });
            } else {
                onClose();
            }
        },
    });

    useImperativeHandle(
        ref,
        () => ({
            submitForm: (submitMode: "save" | "saveAndAdd") => {
                setSubmitMode(submitMode);
                formik.submitForm();
                if (submitMode === "saveAndAdd") {
                    // @ts-ignore
                    siteSelectRef.current.focus();
                }
            },
            isSubmitting: () => formik.isSubmitting,
        }),
        [formik]
    );

    const getActivityIndex = (activity: Partial<TransportFormActivity>) => {
        if (activity.type === "loading") {
            return loadings.indexOf(activity);
        }
        return unloadings.indexOf(activity);
    };

    const activityOptions = useMemo(() => {
        return activities.map((activity) => {
            const categoryLocalized =
                activity.type === "loading" ? t("common.pickup") : t("common.delivery");
            const label = `${categoryLocalized} #${getActivityIndex(activity) + 1} ${
                activity.address?.name ? `- ${activity.address?.name}` : ""
            }`;
            return {label: label, value: activity};
        });
    }, [activities]);

    const activityType = formik.values.activity?.type ?? "loading";

    const siteSelectRef = useRef(null);

    return (
        <FormikProvider value={formik}>
            <Form id="support-exchange-form">
                {activities.length > 1 && (
                    <Box width="100%" mb={4}>
                        <Select
                            label={t("common.site")}
                            options={activityOptions}
                            value={
                                activityOptions.find(
                                    (option) => option.value.uid === formik.values.activity?.uid
                                ) ?? null
                            }
                            onChange={(option: SelectOption) => {
                                formik.setFieldValue("activity", option.value);
                            }}
                            error={formik.errors.activity as string}
                            data-testid="support-exchange-activity-select"
                            required
                            autoFocus={!supportExchangeToEdit}
                            ref={siteSelectRef}
                        />
                    </Box>
                )}

                <Box width="100%" mb={4}>
                    <Field
                        {...formik.getFieldProps("type")}
                        component={SupportTypeSelect}
                        label={t("components.supportType")}
                        onChange={(supportType: SupportType) =>
                            formik.setFieldValue("type", supportType)
                        }
                        error={formik.errors.type}
                        required
                        data-testid="support-exchange-type-select"
                        clearable={true}
                    />
                </Box>

                {activityType === "loading" && (
                    <>
                        <SupportExchangeFormField
                            error={formik.errors.expectedRetrieved as string}
                            label={t("supportExchange.toTake", undefined, {
                                capitalize: true,
                            })}
                            fieldName={"expectedRetrieved"}
                            onChangeFunction={formik.setFieldValue}
                            testid="support-exchange-retrieve-field"
                            value={formik.values.expectedRetrieved}
                        />
                        <SupportExchangeFormField
                            error={formik.errors.expectedDelivered as string}
                            label={t("supportExchange.toGiveBack", undefined, {
                                capitalize: true,
                            })}
                            fieldName={"expectedDelivered"}
                            onChangeFunction={formik.setFieldValue}
                            testid="support-exchange-deliver-field"
                            value={formik.values.expectedDelivered}
                        />
                    </>
                )}
                {activityType === "unloading" && (
                    <>
                        <SupportExchangeFormField
                            error={formik.errors.expectedDelivered as string}
                            label={t("supportExchange.toDeliver", undefined, {
                                capitalize: true,
                            })}
                            fieldName={"expectedDelivered"}
                            onChangeFunction={formik.setFieldValue}
                            testid="support-exchange-deliver-field"
                            value={formik.values.expectedDelivered}
                        />
                        <SupportExchangeFormField
                            error={formik.errors.expectedRetrieved as string}
                            label={t("supportExchange.toRecover", undefined, {
                                capitalize: true,
                            })}
                            fieldName={"expectedRetrieved"}
                            onChangeFunction={formik.setFieldValue}
                            testid="support-exchange-retrieve-field"
                            value={formik.values.expectedRetrieved}
                        />
                    </>
                )}
            </Form>
        </FormikProvider>
    );
});

SupportExchangeForm.displayName = "SupportExchangeForm";
