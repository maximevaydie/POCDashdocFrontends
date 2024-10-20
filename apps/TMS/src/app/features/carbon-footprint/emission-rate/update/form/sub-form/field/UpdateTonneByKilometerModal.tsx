import {t} from "@dashdoc/web-core";
import {Modal, NumberInput} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {Controller, FormProvider, UseFormReturn, useForm} from "react-hook-form";
import {z} from "zod";

type Props = {
    defaultTonneByKilometer: number;
    onClose: () => void;
    onUpdate: (tonneByKilometer: number) => void;
};

export function UpdateTonneByKilometerModal({defaultTonneByKilometer, onClose, onUpdate}: Props) {
    const form = useForm<FormType>({
        resolver: zodResolver(schema),
        defaultValues: {tonneKilometer: defaultTonneByKilometer},
    });
    return (
        <Modal
            title={t("common.tonneKilometer")}
            onClose={onClose}
            mainButton={{
                children: t("common.update"),
                disabled: form.formState.isSubmitting,
                onClick: form.handleSubmit(handleSubmit),
                "data-testid": "update-tonne-by-km-main-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                onClick: onClose,
                "data-testid": "update-tonne-by-km-secondary-button",
            }}
            size="medium"
        >
            <Form form={form} />
        </Modal>
    );

    async function handleSubmit(values: FormType) {
        onUpdate(values.tonneKilometer);
    }
}

const schema = z.object({
    tonneKilometer: z.number().min(0),
});
type FormType = z.infer<typeof schema>;
type FormProps = {
    form: UseFormReturn<FormType>;
};
function Form({form}: FormProps) {
    return (
        <FormProvider {...form}>
            <Controller
                name="tonneKilometer"
                render={({field, fieldState: {error}}) => (
                    <NumberInput
                        min={0}
                        label={t("common.tonneKilometer")}
                        units={t("carbonFootprint.tonnekilometerUnit")}
                        {...field}
                        error={error?.message}
                    />
                )}
            />
        </FormProvider>
    );
}
