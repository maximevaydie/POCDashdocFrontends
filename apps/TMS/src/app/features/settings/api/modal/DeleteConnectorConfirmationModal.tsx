import {t} from "@dashdoc/web-core";
import {Box, Callout, Checkbox, Flex, Icon, Modal, Text} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {FC} from "react";

type DeleteConnectorConfirmationModalProps = {
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

export const DeleteConnectorConfirmationModal: FC<DeleteConnectorConfirmationModalProps> = ({
    onSubmit,
    onClose,
}) => {
    const formik = useFormik({
        initialValues: {
            requirementsChecked: new Array(3).fill(false),
        },
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: getValidationSchema(),
        onSubmit: onSubmit,
    });

    return (
        <Modal
            title={t("deleteConnectorConfirmationModal.title")}
            onClose={onClose}
            mainButton={{
                children: t("common.delete"),
                type: "submit",
                form: "mark-delete-connector-confirmation-form",
                disabled: formik.isSubmitting,
                severity: "danger",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                type: "button",
            }}
            data-testid="mark-delete-connector-confirmation-modal"
        >
            <Flex flexDirection="column">
                <Callout variant="danger">
                    <Text mt={3}>{t("deleteConnectorConfirmationModal.warning")}</Text>
                </Callout>

                <Box mt={5}>
                    <Text mb={3}>{t("deleteConnectorConfirmationModal.dataAboutToLose")}</Text>
                    <Flex>
                        <Icon
                            name="removeCircle"
                            scale={[1.5, 1.5]}
                            color="red.default"
                            mr={2}
                            mb={2}
                        />
                        <Text mb={2}>{t("deleteConnectorConfirmationModal.invoiceLink")}</Text>
                    </Flex>
                    <Flex>
                        <Icon
                            name="removeCircle"
                            scale={[1.5, 1.5]}
                            color="red.default"
                            mr={2}
                            mb={1}
                        />
                        <Text mb={1}>{t("deleteConnectorConfirmationModal.productLink")}</Text>
                    </Flex>
                </Box>

                <FormikProvider value={formik}>
                    <Form id="mark-delete-connector-confirmation-form">
                        <Box mt={6} pt={4} borderTop="1px solid" borderTopColor="grey.light">
                            <Text mb={4}>
                                {t("deleteConnectorConfirmationModal.readAndUnderstood")}
                            </Text>
                            <Box mt={2}>
                                <Checkbox
                                    id={`requirement-checked-0`}
                                    name={`requirementsChecked[0]`}
                                    label={t("deleteConnectorConfirmationModal.requirement1")}
                                    checked={formik.values.requirementsChecked[0]}
                                    onChange={(_, event) => {
                                        formik.handleChange(event);
                                    }}
                                    error={
                                        (!formik.values.requirementsChecked[0] &&
                                            formik.errors.requirementsChecked) as string
                                    }
                                    data-testid={`mark-delete-connector-requirement-0`}
                                />
                            </Box>
                            <Box mt={2}>
                                <Checkbox
                                    id={`requirement-checked-1`}
                                    name={`requirementsChecked[1]`}
                                    label={t("deleteConnectorConfirmationModal.requirement2")}
                                    checked={formik.values.requirementsChecked[1]}
                                    onChange={(_, event) => {
                                        formik.handleChange(event);
                                    }}
                                    error={
                                        (!formik.values.requirementsChecked[1] &&
                                            formik.errors.requirementsChecked) as string
                                    }
                                    data-testid={`mark-delete-connector-requirement-1`}
                                />
                            </Box>
                            <Box mt={2}>
                                <Checkbox
                                    id={`requirement-checked-2`}
                                    name={`requirementsChecked[2]`}
                                    label={t("deleteConnectorConfirmationModal.requirement3")}
                                    checked={formik.values.requirementsChecked[2]}
                                    onChange={(_, event) => {
                                        formik.handleChange(event);
                                    }}
                                    error={
                                        (!formik.values.requirementsChecked[2] &&
                                            formik.errors.requirementsChecked) as string
                                    }
                                    data-testid={`mark-delete-connector-requirement-2`}
                                />
                            </Box>
                        </Box>
                    </Form>
                </FormikProvider>
            </Flex>
        </Modal>
    );
};
