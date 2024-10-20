import {t} from "@dashdoc/web-core";
import {Flex, Icon, Modal, Text, TextInput} from "@dashdoc/web-ui";
import {FuelPriceIndex, Nullable, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React from "react";

type FuelPriceIndexFormModalProps = {
    fuelPriceIndex?: FuelPriceIndex;
    onClose: () => void;
    onSubmit: (fuelPriceIndex: Pick<FuelPriceIndex, "name" | "source">) => void;
};

export const FuelPriceIndexFormModal: React.FC<FuelPriceIndexFormModalProps> = ({
    onClose,
    onSubmit,
    fuelPriceIndex = null,
}) => {
    const FuelPriceIndexFormValidationSchema = yup.object().shape({
        name: yup
            .string()
            .max(255, t("errors.max_length"))
            .required(t("errors.field_cannot_be_empty")),
        source: yup.string().max(255, t("errors.max_length")).nullable(true),
    });

    const formik = useFormik<Nullable<Pick<FuelPriceIndex, "name" | "source">>>({
        initialValues: {
            name: fuelPriceIndex?.name || null,
            source: fuelPriceIndex?.source || null,
        },
        onSubmit: onSubmit,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: FuelPriceIndexFormValidationSchema,
    });

    const title = fuelPriceIndex
        ? t("fuelSurcharges.updateNewFuelPriceIndex")
        : t("fuelSurcharges.createNewFuelPriceIndex");

    return (
        <Modal
            title={title}
            mainButton={{
                type: "submit",
                form: "form-fuel-price-index",
                ["data-testid"]: "fuel-price-index-creation-modal-create-button",
            }}
            secondaryButton={{
                onClick: onClose,
                ["data-testid"]: "fuel-price-index-creation-modal-cancel-button",
            }}
            onClose={onClose}
            minWidth="300px"
        >
            <FormikProvider value={formik}>
                <Form
                    id="form-fuel-price-index"
                    onSubmit={formik.handleSubmit}
                    style={{display: "flex", flexDirection: "column", rowGap: "12px"}}
                >
                    <TextInput
                        required
                        label={t("common.name")}
                        value={formik.values.name as string}
                        error={formik.errors.name as string}
                        onChange={(name: string) => formik.setFieldValue("name", name)}
                        data-testid="fuel-price-index-creation-modal-name-input"
                    />
                    <TextInput
                        label={t("fuelSurcharges.source")}
                        value={formik.values.source as string}
                        error={formik.errors.source as string}
                        onChange={(source: string) => formik.setFieldValue("source", source)}
                        data-testid="fuel-price-index-creation-modal-source-input"
                    />

                    <Flex style={{columnGap: "4px"}}>
                        <Icon name="alert" />
                        <Text fontStyle="italic" color="grey.dark">
                            {t("fuelSurcharges.fuelPriceIndexSourceExplanation")}
                        </Text>
                    </Flex>
                </Form>
            </FormikProvider>
        </Modal>
    );
};
