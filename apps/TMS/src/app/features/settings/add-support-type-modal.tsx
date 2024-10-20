import {t} from "@dashdoc/web-core";
import {Modal, TextInput} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {Field, Form, FormikProvider, useFormik} from "formik";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchAddSupportType} from "app/redux/actions/company/support-types";

export type AddSupportTypeFormProps = {
    name: string;
    remote_id?: string;
};

type AddSupportTypeModalProps = {
    onClose: () => void;
    onSubmit: () => void;
};

function AddSupportTypeModal({onClose, onSubmit}: AddSupportTypeModalProps) {
    const dispatch = useDispatch();

    const handleSubmit = async (values: AddSupportTypeFormProps) => {
        if (!values.remote_id) {
            delete values.remote_id;
        }

        await dispatch(fetchAddSupportType(values));

        onSubmit();
        onClose();
    };

    const formik = useFormik<AddSupportTypeFormProps>({
        initialValues: {name: "", remote_id: undefined},
        validationSchema: yup.object().shape({
            name: yup.string().required(t("common.mandatoryField")),
            remote_id: yup.string().nullable(),
        }),
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("components.addSupportType")}
            onClose={onClose}
            id="add-support-type-modal"
            data-testid="add-support-type-modal"
            mainButton={{
                children: t("common.save"),
                form: "add-support-type-form",
                type: "submit",
                ["data-testid"]: "add-support-type-modal-save",
            }}
        >
            <FormikProvider value={formik}>
                <Form id="add-support-type-form">
                    <Field
                        required
                        mb={2}
                        component={TextInput}
                        // @ts-ignore
                        name="name"
                        {...formik.getFieldProps("name")}
                        onChange={(value: string) => {
                            // @ts-ignore
                            formik.setFieldError("name", null);
                            formik.setFieldValue("name", value);
                        }}
                        label={t("common.name")}
                        placeholder={t("common.name")}
                        data-testid="add-support-type-modal-name"
                        error={formik.errors.name}
                    />

                    <Field
                        component={TextInput}
                        // @ts-ignore
                        name="remote_id"
                        {...formik.getFieldProps("remote_id")}
                        onChange={(value: string) => formik.setFieldValue("remote_id", value)}
                        placeholder={t("supportType.internalReference", undefined, {
                            capitalize: true,
                        })}
                        label={t("supportType.internalReference", undefined, {
                            capitalize: true,
                        })}
                        data-testid="add-support-type-modal-remote-id"
                        error={formik.errors.remote_id}
                    />
                </Form>
            </FormikProvider>
        </Modal>
    );
}

export default AddSupportTypeModal;
