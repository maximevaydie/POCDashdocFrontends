import {t} from "@dashdoc/web-core";
import {Box, Callout, Checkbox, Flex, Icon, Modal, Text} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {FC} from "react";

import {getMarkUndoneSiteTranslations} from "./utils";

import type {Site, Transport} from "app/types/transport";

type MarkSiteUndoneConfirmationModalProps = {
    site: Site;
    transport: Transport;
    onSubmit: () => void;
    onClose: () => void;
};

const getValidationSchema = () =>
    yup.object().shape({
        requirementsChecked: yup
            .array()
            .of(yup.boolean())
            .test("everyRequirementsChecked", t("common.mandatoryField"), (list) =>
                // @ts-ignore
                list.every((el) => !!el)
            ),
    });

export const MarkSiteUndoneConfirmationModal: FC<MarkSiteUndoneConfirmationModalProps> = ({
    site,
    transport,
    onSubmit,
    onClose,
}) => {
    // Contains all the conditional translations
    const translations = getMarkUndoneSiteTranslations(site.category, transport);

    const formik = useFormik({
        initialValues: {
            requirementsChecked: new Array(translations.requirements.length).fill(false),
        },
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: getValidationSchema(),
        onSubmit: onSubmit,
    });

    return (
        <Modal
            title={t("components.importantModification")}
            onClose={onClose}
            mainButton={{
                children: t("markActivityUndoneModal.changeStatus"),
                type: "submit",
                form: "mark-undone-confirmation-form",
                disabled: formik.isSubmitting,
                severity: "warning",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                type: "button",
            }}
            data-testid="mark-site-undone-confirmation-modal"
        >
            <Flex flexDirection="column">
                <Callout variant="warning">
                    <Text>{translations.regenerateDeliveryDocumentCallout}</Text>
                    <Text mt={3}>
                        {t("markActivityUndoneModal.correctInformationWithoutLosingData")}
                    </Text>
                </Callout>

                <Box mt={5}>
                    <Text mb={3}>
                        {t("markActivityUndoneModal.modifyActivityWillRemoveFollowingData")}
                    </Text>
                    {translations.warnings.map((text, index) => (
                        <Flex key={index} mt={index === 0 ? "unset" : 2} alignItems="baseline">
                            <Icon name="removeCircle" color="red.dark" mr={1} />
                            <Text>{text}</Text>
                        </Flex>
                    ))}
                </Box>

                {translations.requirements.length > 0 && (
                    <FormikProvider value={formik}>
                        <Form id="mark-undone-confirmation-form">
                            <Box mt={7} pt={4} borderTop="1px solid" borderTopColor="grey.light">
                                <Text mb={4}>
                                    {t("markActivityUndoneModal.readAndUnderstood")}
                                </Text>
                                {translations.requirements.map((text, index) => {
                                    const hasError =
                                        !formik.values.requirementsChecked[index] &&
                                        formik.errors.requirementsChecked;
                                    return (
                                        <Box key={index} mt={index === 0 ? "unset" : 2}>
                                            <Checkbox
                                                id={`requirement-checked-${index}`}
                                                name={`requirementsChecked[${index}]`}
                                                label={text}
                                                checked={formik.values.requirementsChecked[index]}
                                                onChange={(_, event) => {
                                                    formik.handleChange(event);
                                                }}
                                                error={hasError as string}
                                                data-testid={`mark-site-undone-confirmation-requirement-${index}`}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Form>
                    </FormikProvider>
                )}
            </Flex>
        </Modal>
    );
};
