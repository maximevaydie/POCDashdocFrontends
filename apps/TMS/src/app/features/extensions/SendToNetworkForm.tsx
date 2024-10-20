import {t} from "@dashdoc/web-core";
import {Box, TextInput, Text, ErrorMessage} from "@dashdoc/web-ui";
import React from "react";
import {Controller, FormProvider, UseFormReturn} from "react-hook-form";
import {z} from "zod";

type Props = {
    form: UseFormReturn<SendToNetworkFormValues>;
};

export const sendToNetworkFormSchema = z.object({
    instructions: z.string(),
});
export type SendToNetworkFormValues = z.infer<typeof sendToNetworkFormSchema>;

export function SendToNetworkForm({form}: Props) {
    const disabled = form.formState.isSubmitting;

    return (
        <FormProvider {...form}>
            <Text variant="h1">{t("common.instructions")}</Text>
            <Text mt={4}>{t("extensions.triggers.trip_send_to_network.instructions_text")}</Text>
            <Box pt={3}>
                <Controller
                    name="instructions"
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            {...field}
                            label={t("transportForm.globalInstructionsTitle")}
                            disabled={disabled}
                            error={error?.message}
                        />
                    )}
                />
            </Box>
            {form.formState.errors?.root?.message && (
                <ErrorMessage error={form.formState.errors.root.message} />
            )}
        </FormProvider>
    );
}
