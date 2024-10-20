import {t} from "@dashdoc/web-core";
import {Flex, Modal, Text, TextInput, toast} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React from "react";

import {
    TransportOperationCategory,
    transportOperationCategoryApiService,
} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

type RenameTransportOperationCategoryForm = {
    name: string;
};

type Props = {
    onClose: (didUpdate: boolean) => void;
    transportOperationCategory: TransportOperationCategory;
};

export function RenameTransportOperationCategoryModal({
    onClose,
    transportOperationCategory,
}: Props) {
    const handleSubmit = async (values: RenameTransportOperationCategoryForm) => {
        const payload = {
            name: values.name,
        };
        try {
            await transportOperationCategoryApiService.patch(transportOperationCategory.uid, {
                data: payload,
            });
            toast.success(t("carbonFootprint.transportOperationCategoryRenamed"));
            onClose(true);
        } catch (error) {
            toast.error(t("common.error"));
        } finally {
            formik.setSubmitting(false);
        }
    };

    const formik = useFormik<RenameTransportOperationCategoryForm>({
        initialValues: {
            name: transportOperationCategory.name,
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: yup.object({
            name: yup.string().required(t("errors.field_cannot_be_empty")),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <FormikProvider value={formik}>
            <Modal
                title={
                    <Flex>
                        <Text variant="title">
                            {t("carbonFootprint.renameTransportOperationCategory")}
                        </Text>
                    </Flex>
                }
                onClose={() => onClose(false)}
                mainButton={{
                    onClick: () => formik.submitForm(),
                    disabled: formik.isSubmitting,
                    loading: formik.isSubmitting,
                    "data-testid": "rename-transport-operation-category-modal-confirm-button",
                }}
                data-testid="rename-transport-operation-category-modal"
            >
                <TextInput
                    label={t("common.name")}
                    required={true}
                    value={formik.values.name}
                    error={formik.errors.name}
                    onChange={(e) => {
                        formik.setFieldError("name", undefined);
                        formik.setFieldValue("name", e);
                    }}
                    data-testid="transport-operation-category-rename-input"
                />
            </Modal>
        </FormikProvider>
    );
}
