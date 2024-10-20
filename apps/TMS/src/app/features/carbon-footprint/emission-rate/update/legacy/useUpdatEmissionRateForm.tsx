import {FuelType, yup} from "dashdoc-utils";
import {FormikErrors, useFormik} from "formik";
import {useCallback, useMemo} from "react";

import {FuelConsumption, NullableFuelConsumption} from "app/features/carbon-footprint/types";

export type FuelConsumptionForForm = NullableFuelConsumption & {
    fuelError?: string;
    quantityError?: string;

    onChange: (fuel: FuelType, quantity: number) => void;
    onDelete: () => void;
};

export const useUpdateEmissionRateForm = (
    defaultConsumption: NullableFuelConsumption[],
    onSubmit: (fuelConsumptions: FuelConsumption[]) => Promise<void>
) => {
    const formik = useFormik({
        initialValues: {
            consumptions: defaultConsumption,
        },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object().shape({
            consumptions: yup.array().of(
                yup.object().shape({
                    fuel: yup.string().required(),
                    quantity: yup.number().required().min(0),
                })
            ),
        }),
        onSubmit: async (values) => {
            return await onSubmit(values.consumptions as FuelConsumption[]);
        },
    });

    // @ts-ignore
    const errors: FormikErrors<NullableFuelConsumption>[] = formik.errors?.consumptions;

    const fuelConsumptionsForForm: FuelConsumptionForForm[] = useMemo(() => {
        return formik.values.consumptions.map((consumption, index) => ({
            fuel: consumption.fuel,
            quantity: consumption.quantity,
            fuelError: errors?.[index]?.fuel,
            quantityError: errors?.[index]?.quantity,

            onChange: (fuel: FuelType, quantity: number) => {
                formik.setFieldValue(`consumptions[${index}].fuel`, fuel);
                formik.setFieldValue(`consumptions[${index}].quantity`, quantity);
            },

            onDelete: () => {
                formik.setFieldValue(
                    "consumptions",
                    formik.values.consumptions.filter((_, i) => i !== index)
                );
            },
        }));
    }, [formik, errors]);

    const addEmptyFuelConsumption = useCallback(() => {
        formik.setFieldValue("consumptions", [
            ...formik.values.consumptions,
            {
                fuel: null,
                quantity: null,
            },
        ]);
    }, [formik.values.consumptions]);

    return {
        fuelConsumptions: fuelConsumptionsForForm,
        addEmptyFuelConsumption,
        submit: formik.handleSubmit,
        isSubmitting: formik.isSubmitting,
    };
};
