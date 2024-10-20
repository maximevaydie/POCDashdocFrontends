import {getConnectedCompany} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, Checkbox, Flex, Select, Text, TextInput, toast} from "@dashdoc/web-ui";
import {
    IDTF_CERTIFICATIONS_TO_DISPLAY_NAMES,
    companyIsQualimat,
    useToggle,
    yup,
} from "dashdoc-utils";
import {setNestedObjectValues, useFormik} from "formik";
import React from "react";

import {fetchUpdateQualimat} from "app/redux/actions/company/fetch-update-qualimat";
import {useDispatch, useSelector} from "app/redux/hooks";

import QualimatFeatureModal from "./qualimat-modal";

export const QualimatFeature = () => {
    const dispatch = useDispatch();

    const company = useSelector(getConnectedCompany);
    const isQualimatEnabled = companyIsQualimat(company);

    const [isEnableQualimatChecked, , , toggleIsEnableQualimatChecked] =
        useToggle(isQualimatEnabled);
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();

    const certificationOptions = Object.entries(IDTF_CERTIFICATIONS_TO_DISPLAY_NAMES).map(
        ([value, label]) => ({label, value})
    );
    certificationOptions.push({label: t("common.other"), value: "other"});

    const form = useFormik({
        initialValues: {
            idtfCertification: company?.settings?.idtf_certification ?? "",
            certificationName: company?.settings?.certification_name ?? "",
            certificationNumber: company?.settings?.qualimat_certificate_number ?? "",
        },
        validationSchema: yup.object().shape({
            idtfCertification: yup
                .string()
                .oneOf(certificationOptions.map((c) => c.value))
                .required(t("settings.errors.certificationName.empty")),
            certificationName: yup.string().when("certification", {
                is: "other",
                then: yup.string().required(t("settings.errors.certificationName.empty")),
            }),
            certificationNumber: yup
                .string()
                .required(t("settings.errors.certificationNumber.empty")),
        }),
        onSubmit: async (data) => {
            if (!company) {
                Logger.error("Can't submit qualimat update without a company");
                toast.error(t("common.error"));
                return;
            }
            setIsSubmitting();
            try {
                await dispatch(
                    fetchUpdateQualimat(company.pk, {
                        idtf_certification: data.idtfCertification,
                        certification_name: data.certificationName,
                        qualimat_certificate_number: data.certificationNumber,
                    })
                );
                setIsSubmitted();
                closeModal();
                toast.success(t("qualimatFeature.updateCertificateNumber.success"));
            } catch (error) {
                Logger.error(error);
                toast.error(t("qualimatFeature.updateCertificateNumber.error"));
            }
        },
    });

    return (
        <Box>
            <Checkbox
                label={t("qualimatFeature.label")}
                data-testid="qualimat-feature-checkbox"
                checked={isEnableQualimatChecked}
                onChange={toggleIsEnableQualimatChecked}
                disabled={isQualimatEnabled}
            />
            {isEnableQualimatChecked && (
                <form>
                    <Text variant="h2" mb={2} mt={4}>
                        {t("settings.CMRMention")}
                    </Text>
                    <Flex mt={4} flexDirection="row" style={{gap: 8}}>
                        <Box flex={1} mb={2} maxWidth="calc(50% - 8px)">
                            <Select
                                label="Certification"
                                data-testid="qualimat-idtf-certification-select"
                                isClearable={false}
                                value={
                                    form.values.idtfCertification
                                        ? certificationOptions.find(
                                              (c) => c.value === form.values.idtfCertification
                                          )
                                        : undefined
                                }
                                isMulti={false}
                                options={certificationOptions}
                                onChange={(value) => {
                                    form.setFieldValue("idtfCertification", value?.value);
                                    form.setFieldValue("certificationName", "");
                                }}
                                required
                                error={
                                    form.touched.idtfCertification && form.errors.idtfCertification
                                }
                            />
                        </Box>

                        <Box
                            flex={1}
                            mb={2}
                            display={form.values.idtfCertification != "other" ? "none" : undefined}
                        >
                            <TextInput
                                label={t("settings.qualimatCertificateName")}
                                data-testid="qualimat-certificate-name-input"
                                {...form.getFieldProps("certificationName")}
                                onChange={(_value, e) => {
                                    form.handleChange(e);
                                }}
                                required
                                error={
                                    form.touched.certificationName && form.errors.certificationName
                                }
                            />
                        </Box>
                    </Flex>
                    <Box flex={1} mb={4} maxWidth="calc(50% - 8px)">
                        <TextInput
                            label={t("settings.qualimatCertificateNumber")}
                            data-testid="qualimat-certificate-number-input"
                            {...form.getFieldProps("certificationNumber")}
                            onChange={(_value, e) => {
                                form.handleChange(e);
                            }}
                            required
                            error={
                                form.touched.certificationNumber && form.errors.certificationNumber
                            }
                        />
                    </Box>
                </form>
            )}
            <Box>
                <Text>{t("qualimatFeature.helpText")}</Text>
                <Box py={4}>
                    <ol>
                        <li>{t("qualimatFeature.helpItem1")}</li>
                        <li>{t("qualimatFeature.helpItem2")}</li>
                        <li>{t("qualimatFeature.helpItem3")}</li>
                        <li>{t("qualimatFeature.helpItem4")}</li>
                    </ol>
                </Box>
                {isEnableQualimatChecked && (
                    <Button
                        onClick={async () => {
                            const validationErrors = await form.validateForm();
                            if (Object.keys(validationErrors).length > 0) {
                                form.setTouched(setNestedObjectValues(validationErrors, true));
                                return;
                            }

                            openModal();
                        }}
                        loading={isSubmitting}
                        disabled={isSubmitting || company === null}
                        css={{margin: "auto"}}
                        data-testid="qualimat-modal-open"
                    >
                        {t(
                            isQualimatEnabled
                                ? "settings.updateCertificate"
                                : "qualimatFeature.save"
                        )}
                    </Button>
                )}
            </Box>
            {isModalOpen && (
                <QualimatFeatureModal
                    submitting={isSubmitting}
                    onClose={closeModal}
                    onSubmit={form.handleSubmit}
                    isQualimatEnabled={isQualimatEnabled}
                />
            )}
        </Box>
    );
};
