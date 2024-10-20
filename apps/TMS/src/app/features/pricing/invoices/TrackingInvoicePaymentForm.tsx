import {t} from "@dashdoc/web-core";
import {Box, DatePicker, Flex, TextInput} from "@dashdoc/web-ui";
import React from "react";
import {Controller, FormProvider, UseFormReturn} from "react-hook-form";

import {PaymentMethodAsyncCreatableSelect} from "app/taxation/invoicing/features/PaymentMethodAsyncCreatableSelect";
import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

export type TrackingInvoicePaymentFormType = {
    paid_at?: Date | null;
    payment_method?: PaymentMethod | null;
    payment_notes?: string;
};

type Props = {
    form: UseFormReturn<TrackingInvoicePaymentFormType>;
    autoSuggestPaymentMethod?: boolean;
    debtorId?: number;
};

export function TrackingInvoicePaymentForm({form, autoSuggestPaymentMethod, debtorId}: Props) {
    return (
        <FormProvider {...form}>
            <Flex css={{gap: "12px"}} mt={3}>
                <Controller
                    name="paid_at"
                    render={({field}) => (
                        <DatePicker
                            clearable
                            label={t("invoice.paymentDate")}
                            onChange={field.onChange}
                            date={field.value}
                            disabled={field.disabled}
                            rootId="react-app-modal-root"
                            data-testid="tracking-invoice-payment-form-paid-at"
                        />
                    )}
                />
                <Box flexBasis={"50%"}>
                    <Controller
                        name="payment_method"
                        render={({field}) => (
                            <PaymentMethodAsyncCreatableSelect
                                required={false}
                                value={field.value}
                                onChange={field.onChange}
                                data-testid="tracking-invoice-payment-form-payment-method"
                                autoSuggest={autoSuggestPaymentMethod}
                                debtorId={debtorId}
                            />
                        )}
                    />
                </Box>
            </Flex>
            <Controller
                name="payment_notes"
                render={({field, fieldState: {error}}) => (
                    <TextInput
                        containerProps={{mt: 3}}
                        label={t("invoice.paymentNotes")}
                        {...field}
                        required={false}
                        error={error?.message}
                        data-testid="tracking-invoice-payment-form-notes"
                    />
                )}
            />
        </FormProvider>
    );
}
