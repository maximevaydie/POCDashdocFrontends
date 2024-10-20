import {getConnectedCompanyId} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    SwitchInput,
    ButtonProps,
    Text,
    TextInput,
    themeAwareCss,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {MessageDocumentType, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {FC} from "react";

import {useSelector} from "app/redux/hooks";
import {
    getDocumentTypeIcon,
    getDocumentTypeOptions,
    getMessageDocumentDefaultVisibility,
} from "app/services/transport";

import {DocumentCompaniesVisibilitySelect} from "./DocumentCompaniesVisibilitySelect";
import {ExtractedReference} from "./ExtractedReference";
import {SitePicker} from "./SitePicker";

import type {Transport} from "app/types/transport";

export interface DocumentValues {
    document_type: MessageDocumentType;
    reference: string;
    site: string | null;
    readable_by_company_ids: number[];
    visible_by_everyone: boolean;
    readable_by_trucker: boolean;
}

const DocumentTypeButton = styled((props: ButtonProps) => (
    <Button variant="secondary" {...props} />
))<{active: boolean}>(({active}) =>
    themeAwareCss({
        backgroundColor: active ? "grey.light" : "grey.ultraLight",
        width: "7em",
        height: "7em",
        textAlign: "center",
        padding: 3,
        margin: 1,
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        border: "1px solid",
        borderColor: "transparent",
    })
);

type DocumentOptionsFormProps = {
    formId?: string;
    documentInitialValues: DocumentValues;
    transport: Transport;
    extractedReference?: string | null;
    authorCompanyPk?: number;
    onSubmit: (values: DocumentValues) => void;
};

export const DocumentOptionsForm: FC<DocumentOptionsFormProps> = ({
    formId,
    documentInitialValues,
    transport,
    extractedReference,
    authorCompanyPk,
    onSubmit,
}) => {
    const connectedCompanyId = useSelector(getConnectedCompanyId);
    const documentTypeOptions = getDocumentTypeOptions();

    const formik = useFormik({
        initialValues: documentInitialValues,
        onSubmit: onSubmit,
        validationSchema: yup.object().shape({
            document_type: yup.string().oneOf(documentTypeOptions.map(({value}) => value)),
            reference: yup.string(),
            site: yup.string().optional().nullable(true),
            readable_by_company_ids: yup.array().of(yup.number()).optional(),
            visible_by_everyone: yup.boolean(),
            readable_by_trucker: yup.boolean(),
        }),
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <FormikProvider value={formik}>
            <Form id={formId}>
                <Text variant="captionBold" mt={2}>
                    {t("components.documentType")}
                </Text>
                <Flex justifyContent="center" flexWrap="wrap">
                    {documentTypeOptions.map((option) => (
                        <DocumentTypeButton
                            data-testid={`document-options-form-document-type-${option.value}-button`}
                            type="button"
                            onClick={() => {
                                formik.setFieldValue("document_type", option.value);

                                const {
                                    readable_by_company_ids,
                                    readable_by_trucker,
                                    visible_by_everyone,
                                } = getMessageDocumentDefaultVisibility(option.value, transport);
                                formik.setFieldValue(
                                    "readable_by_company_ids",
                                    readable_by_company_ids
                                );
                                formik.setFieldValue("visible_by_everyone", visible_by_everyone);
                                formik.setFieldValue("readable_by_trucker", readable_by_trucker);
                            }}
                            active={formik.values.document_type === option.value}
                            key={`document-type-${option.label}`}
                        >
                            <Icon
                                name={getDocumentTypeIcon(option.value)}
                                color="blue.default"
                                scale={[1.5, 1.5]}
                            />
                            <Text color="black" variant="subcaption" mt={1}>
                                {option.label}
                            </Text>
                        </DocumentTypeButton>
                    ))}
                </Flex>
                <Text variant="captionBold" mb={2} mt={4}>
                    {t("common.reference")}
                </Text>
                <TextInput
                    {...formik.getFieldProps("reference")}
                    placeholder={t("transportsForm.enterReference")}
                    onChange={(value) => formik.setFieldValue("reference", value)}
                    data-testid="document-options-form-title"
                    key="document-reference"
                />
                {extractedReference && (
                    <ExtractedReference
                        reference={formik.values.reference}
                        extractedReference={extractedReference}
                        onUseButtonClick={() =>
                            formik.setFieldValue("reference", extractedReference)
                        }
                        displayedFrom="edition_modal"
                        my={2}
                        borderRadius={1}
                    />
                )}
                <Text variant="captionBold" mt={4}>
                    {t("common.sharingSettings")}
                </Text>
                {transport.carrier && connectedCompanyId === transport.carrier.pk && (
                    <Flex mt={2}>
                        <SwitchInput
                            {...formik.getFieldProps("readable_by_trucker")}
                            data-testid="document-options-form-readable-by-trucker-switch"
                            labelRight={t("components.readableByTrucker")}
                            onChange={(value) =>
                                formik.setFieldValue("readable_by_trucker", value)
                            }
                        />
                    </Flex>
                )}
                <Flex mt={2}>
                    <SwitchInput
                        {...formik.getFieldProps("visible_by_everyone")}
                        data-testid="document-options-form-visible-by-everyone-switch"
                        labelRight={t("components.visibleByStakeholders")}
                        onChange={(value) => formik.setFieldValue("visible_by_everyone", value)}
                    />
                </Flex>

                {formik.values.visible_by_everyone && transport.deliveries.length > 1 && (
                    <Box mt={2}>
                        <SitePicker
                            {...formik.getFieldProps("site")}
                            label={t("components.attachToSite")}
                            setSite={(value) => formik.setFieldValue("site", value)}
                            transport={transport}
                        />
                    </Box>
                )}
                {!formik.values.visible_by_everyone && (
                    <Box mt={2}>
                        <DocumentCompaniesVisibilitySelect
                            label={t("components.companiesWithAccessToDocument")}
                            transport={transport}
                            authorCompany={(authorCompanyPk || connectedCompanyId) as number}
                            initialReadableByCompanyIds={formik.values.readable_by_company_ids}
                            setReadableByCompanyIds={(newSelection) =>
                                formik.setFieldValue("readable_by_company_ids", newSelection)
                            }
                        />
                    </Box>
                )}
            </Form>
        </FormikProvider>
    );
};
