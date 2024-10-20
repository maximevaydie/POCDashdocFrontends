import {t} from "@dashdoc/web-core";
import {Box, Checkbox, ErrorMessage, Text} from "@dashdoc/web-ui";
import React from "react";
import {Controller, FormProvider, UseFormReturn} from "react-hook-form";
import {z} from "zod";

export const deleteBulkSchema = z.object({
    cannot_be_undo: z.boolean().refine((val) => val === true, {
        message: "common.mandatoryField",
    }),
});
export type DeleteBulkFormType = z.infer<typeof deleteBulkSchema>;

export function getDefaultValues(): DeleteBulkFormType {
    return {
        cannot_be_undo: false,
    };
}

export function DeleteBulkForm({form}: {form: UseFormReturn<DeleteBulkFormType>}) {
    const {formState} = form;
    return (
        <FormProvider {...form}>
            <Box>
                <Text variant="h2" mb={2}>
                    {t("common.confirm")}
                </Text>
                <Controller
                    name="cannot_be_undo"
                    render={({field, fieldState: {error}}) => (
                        <Checkbox
                            {...field}
                            required
                            data-testid="cannot-be-undo"
                            label={t("components.logisticPointBulkDeleteConfirm")}
                            error={error?.message}
                        />
                    )}
                />
            </Box>
            {formState.errors?.root?.message && (
                <ErrorMessage error={formState.errors.root.message} />
            )}
        </FormProvider>
    );
}
