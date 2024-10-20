import {t} from "@dashdoc/web-core";
import {Modal, TextArea, TextInput} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {FC} from "react";
import {Controller, FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

type InputFormType = {
    name: string;
    description: string;
};

const validationScheme = z.object({
    name: z.string().min(1),
    description: z.string(),
});

export type ValidPaymentMethodFormType = z.output<typeof validationScheme>;
/**
 * A modal containing a form for creating or editing a payment method.
 */
export const AddOrUpdatePaymentMethodModal: FC<{
    paymentMethod?: PaymentMethod;
    onSubmit: (paymentMethod: ValidPaymentMethodFormType) => unknown;
    onClose: () => unknown;
    "data-testid"?: string;
}> = ({paymentMethod, onSubmit, onClose, ...props}) => {
    const methods = useForm<InputFormType, never, ValidPaymentMethodFormType>({
        resolver: zodResolver(validationScheme),
        defaultValues: {
            name: paymentMethod?.name || "",
            description: paymentMethod?.description || "",
        },
    });

    const {handleSubmit, formState} = methods;

    const submit = handleSubmit((data) => {
        onSubmit(data);
    });

    const isCreating = !paymentMethod?.uid;

    return (
        <Modal
            title={
                isCreating ? t("components.addPaymentMethod") : t("components.updatePaymentMethod")
            }
            onClose={onClose}
            data-testid={props["data-testid"]}
            secondaryButton={{
                onClick: onClose,
            }}
            mainButton={{
                type: "button",
                children: isCreating ? t("common.create") : t("common.update"),
                onClick: submit,
                disabled: !formState.isValid || formState.isSubmitting,
                "data-testid": "add-or-update-payment-method-submit-button",
            }}
        >
            <FormProvider {...methods}>
                <Controller
                    name="name"
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            required
                            autoFocus
                            label={t("common.name")}
                            {...field}
                            error={error?.message}
                            data-testid={"payment-method-name-input"}
                        />
                    )}
                />
                <Controller
                    name="description"
                    render={({field, fieldState: {error}}) => (
                        <TextArea
                            height={100}
                            containerProps={{mt: 2}}
                            label={t("common.description")}
                            {...field}
                            error={error?.message}
                            data-testid={"payment-method-description-input"}
                        />
                    )}
                />
            </FormProvider>
        </Modal>
    );
};
