import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, TextInput} from "@dashdoc/web-ui";
import {TAG_COLOR_VARIANTS} from "@dashdoc/web-ui";
import {Tag, TagColor, yup} from "dashdoc-utils";
import {FormikProps, FormikProvider, useFormik} from "formik";
import {sample} from "lodash";
import React, {FunctionComponent, useCallback, useMemo, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router";

import {fetchAddTag, fetchUpdateTag} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import TagColorPicker from "./TagColorPicker";

const tagValidationSchema = yup.object().shape({
    name: yup.string().min(2).max(40),
    color: yup.string().oneOf(Object.keys(TAG_COLOR_VARIANTS)),
});

interface Values {
    name: string;
    color: TagColor;
}

type AddEditTagModalProps = {
    item: Tag | null;
    initialTagName?: string;
    onSubmit?: () => void;
    onSubmitFromTagSection?: (tag: Tag) => void;
    onClose: () => void;
} & RouteComponentProps;

const TagModal: FunctionComponent<AddEditTagModalProps> = ({
    item,
    initialTagName,
    onSubmit,
    onClose,
    onSubmitFromTagSection,
}: AddEditTagModalProps) => {
    const dispatch = useDispatch();
    const [initialValues] = useState<Values>({
        name: initialTagName || item?.name || "",
        color: item?.color ?? sample(TAG_COLOR_VARIANTS)!.color,
    });
    const handleSubmit = useCallback(
        async (values: Partial<Values>, formik: FormikProps<Values>) => {
            const fetchFunction = item ? fetchUpdateTag.bind(item.pk) : fetchAddTag;
            const data = {
                ...values,
                ...(item ? {pk: item.pk} : {}),
            };
            const fetch = await dispatch(fetchFunction(data));
            if (!fetch.error) {
                onSubmit?.();
                return onClose();
            }
            const errorMessages = await getErrorMessagesFromServerError(fetch.error);
            // reformatting error object for formik that wants only one error message string for each field
            const formikErrors = Object.fromEntries(
                Object.entries(errorMessages).map(([k, v]: [string, string | string[]]) => {
                    if (v instanceof Array) {
                        return [k, v.join("\n")];
                    }
                    return [k, v];
                })
            );
            formik.setErrors(formikErrors);
        },
        [dispatch, onSubmit, onClose, item]
    );

    const formik = useFormik({
        initialValues,
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: tagValidationSchema,
        onSubmit: onSubmitFromTagSection ? onSubmitFromTagSection : handleSubmit,
    });

    const modalTitle = useMemo(
        () => (item ? t("settings.editTag") : t("settings.addTag")),
        [item]
    );

    return (
        <Modal
            title={modalTitle}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "add-edit-tag-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "add-edit-tag-modal-close",
            }}
            onClose={onClose}
            data-testid="add-edit-tag-modal"
        >
            <FormikProvider value={formik}>
                <Flex flexDirection="column" mb={2}>
                    <Box mb={3} flexGrow={2}>
                        <TextInput
                            {...formik.getFieldProps("name")}
                            label={t("common.name")}
                            value={formik.values.name!}
                            data-testid="add-edit-tag-modal-name"
                            onChange={(_, e) => {
                                formik.handleChange(e);
                            }}
                            error={formik.errors.name}
                        />
                    </Box>
                    <TagColorPicker
                        color={formik.values.color!}
                        onChange={(color) => {
                            formik.setFieldValue("color", color);
                        }}
                    />
                </Flex>
            </FormikProvider>
        </Modal>
    );
};

const TagModalWithRouter = withRouter(TagModal);

export {TagModalWithRouter as TagModal};
