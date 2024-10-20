import {useFeatureFlag} from "@dashdoc/web-common";
import {
    ReportCategory,
    ReportCreationFormValues,
    ReportEntity,
    ReportMetric,
} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, Text, TextInput} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {Form, Formik, FormikProps} from "formik";
import React from "react";

import ReportCategorySelect from "./ReportCategorySelect";
import ReportEntitySelect from "./ReportEntitySelect";
import ReportMetricSelect from "./ReportMetricSelect";

export type ReportCreationModalProps = {
    onCreate: (report: ReportCreationFormValues) => void;
    isLoading: boolean;
    onClose: () => void;
};

export const ReportCreationModal = ({onCreate, isLoading, onClose}: ReportCreationModalProps) => {
    const profitabilityKPIsEnabled = useFeatureFlag("profitabilityKpi");

    const getDefaultCategory = (): ReportCategory => {
        if (!profitabilityKPIsEnabled) {
            return "orders";
        }
        // @ts-ignore
        return null;
    };

    const initialValues: ReportCreationFormValues = {
        name: "",
        category: getDefaultCategory(),
        // @ts-ignore
        entity: null,
        // @ts-ignore
        metric: null,
    };

    const validationSchema = yup.object().shape({
        name: yup.string().required(t("common.mandatoryField")),
        category: yup.string().nullable().required(t("common.mandatoryField")),
        entity: yup.string().nullable().required(t("common.mandatoryField")),
        metric: yup.string().nullable().required(t("common.mandatoryField")),
    });

    return (
        <Modal
            title={t("reports.creationModal.title")}
            onClose={onClose}
            mainButton={{
                children: t("reports.creationModal.buttonText"),
                type: "submit",
                "data-testid": "submit-report-button",
                form: "create-report-modal",
                loading: isLoading,
            }}
            data-testid="create-line-modal"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={onCreate}
            >
                {({values, errors, setFieldValue}: FormikProps<ReportCreationFormValues>) => (
                    <Form id="create-report-modal">
                        <FormGroup>
                            <TextInput
                                data-testid="report-name-input"
                                label={t("reports.creationModal.nameField.placeholder")}
                                placeholder={t("reports.creationModal.nameField.placeholder")}
                                value={values.name}
                                error={errors.name}
                                onChange={(value) => {
                                    setFieldValue("name", value);
                                }}
                                required
                            />
                        </FormGroup>
                        {profitabilityKPIsEnabled && (
                            <FormGroup>
                                <Text variant="h1" my={4}>
                                    {t("reports.creationModal.elementToAnalyze")}
                                </Text>
                                <ReportCategorySelect
                                    onChange={(category: ReportCategory) => {
                                        setFieldValue("category", category);
                                        setFieldValue("entity", null);
                                        setFieldValue("metric", null);
                                    }}
                                    initialValue={values.category}
                                    error={errors.category}
                                />
                            </FormGroup>
                        )}
                        <FormGroup>
                            <Text variant="h1" my={4}>
                                {t("reports.creationModal.dataToAnalyze")}
                            </Text>
                            <ReportMetricSelect
                                selectedMetric={values.metric}
                                reportCategory={values.category}
                                onChange={(metric: ReportMetric) => {
                                    setFieldValue("metric", metric);
                                }}
                                error={errors.metric}
                                disabled={!values.category}
                            />
                            <Flex marginTop={3}>
                                <Box
                                    width="2px"
                                    height="54px"
                                    marginRight={3}
                                    backgroundColor="grey.light"
                                />
                                <Box flex={1}>
                                    <ReportEntitySelect
                                        reportCategory={values.category}
                                        onChange={(entity: ReportEntity) => {
                                            setFieldValue("entity", entity);
                                        }}
                                        selectedEntity={values.entity}
                                        error={errors.entity}
                                        disabled={!values.category || !values.metric}
                                    />
                                </Box>
                            </Flex>
                        </FormGroup>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};
