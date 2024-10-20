import {t} from "@dashdoc/web-core";
import {Box, Select, SelectOption, Text, TextInput} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {DocumentDropzone} from "@dashdoc/web-ui/src/misc/DocumentDropzone";
import {CleaningRegime} from "dashdoc-utils";
import {FormikErrors, FormikTouched} from "formik";
import React from "react";

import {CleaningQualimatEventPost} from "app/features/settings/qualimat/qualimat-events.types";

type QualimatCleaningFormProps = {
    values: CleaningQualimatEventPost;
    setFieldValue: (field: string, value: any) => void;
    errors?: FormikErrors<{
        method?: string;
        detergent?: string;
        disinfectant?: string;
        washingNote?: string;
    }>;
    touched?: FormikTouched<{
        method?: boolean;
        detergent?: boolean;
        disinfectant?: boolean;
        washingNote?: boolean;
    }>;
};

export default function QualimatCleaningForm({
    values,
    setFieldValue,
    errors,
    touched,
}: QualimatCleaningFormProps) {
    const cleaningMethodOptions: {[key in CleaningRegime]?: SelectOption<CleaningRegime>} = {
        A: {value: CleaningRegime.A, label: t("qualimat.regimeA")},
        B: {value: CleaningRegime.B, label: t("qualimat.regimeB")},
        C: {value: CleaningRegime.C, label: t("qualimat.regimeC")},
        D: {value: CleaningRegime.D, label: t("qualimat.regimeD")},
    };
    const {method, detergent = "", disinfectant = ""} = values;

    const {detergentField, disinfectantField, washingNoteField} = getCleaningField(method);

    return (
        <>
            <FormGroup>
                <Select
                    label={t("common.cleaningMethod")}
                    // @ts-ignore
                    value={cleaningMethodOptions[method]}
                    options={Object.values(cleaningMethodOptions)}
                    onChange={(option: SelectOption<CleaningRegime>) =>
                        setFieldValue("method", option.value)
                    }
                    data-testid="select-cleaning-method"
                    required
                    error={touched?.method && errors?.method}
                />
            </FormGroup>
            <Box borderLeft={"2px solid"} borderColor="grey.light" pl={3}>
                {detergentField.show && (
                    <Box mb={2}>
                        <TextInput
                            label={t("common.detergent")}
                            value={detergent}
                            onChange={(value) => setFieldValue("detergent", value)}
                            required={detergentField.required}
                            error={touched?.detergent && errors?.detergent}
                            data-testid="detergent-input"
                        />
                    </Box>
                )}
                {disinfectantField.show && (
                    <Box mb={2}>
                        <TextInput
                            label={t("common.disinfectant")}
                            value={disinfectant}
                            onChange={(value) => setFieldValue("disinfectant", value)}
                            required={disinfectantField.required}
                            error={touched?.disinfectant && errors?.disinfectant}
                            data-testid="disinfectant-input"
                        />
                    </Box>
                )}
                {washingNoteField.show && (
                    <>
                        <Text color="grey.dark" pt={1} mb={-1} ml={3}>
                            {t("components.washingNote")}
                            {washingNoteField.required ? (
                                <Text color="blue.default" as="span">
                                    *
                                </Text>
                            ) : null}
                        </Text>
                        <Box mx={-2}>
                            <DocumentDropzone
                                file={values.washingNote ?? null}
                                onAcceptedFile={(file) => setFieldValue("washingNote", file)}
                                data-testid="washing-note-file-upload"
                                onRemoveFile={() => setFieldValue("washingNote", undefined)}
                                error={touched?.washingNote ? errors?.washingNote : undefined}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </>
    );
}

export function getCleaningField(cleaningMethod: CleaningRegime) {
    const fields = {
        detergentField: {show: false, required: false},
        disinfectantField: {show: false, required: false},
        washingNoteField: {show: false, required: false},
    };
    if (cleaningMethod === CleaningRegime.B) {
        fields.washingNoteField = {show: true, required: true};
    }
    if (cleaningMethod === CleaningRegime.C) {
        fields.detergentField = {show: true, required: true};
        fields.washingNoteField = {show: true, required: true};
    }
    if (cleaningMethod === CleaningRegime.D) {
        fields.detergentField = {show: true, required: false};
        fields.disinfectantField = {show: true, required: true};
        fields.washingNoteField = {show: true, required: false};
    }
    return fields;
}
