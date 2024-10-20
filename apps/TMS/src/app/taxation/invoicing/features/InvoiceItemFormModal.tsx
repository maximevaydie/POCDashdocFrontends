import {t} from "@dashdoc/web-core";
import {Callout, Flex, Modal, SwitchInput, Text, TextInput} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {FC} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {AccountCodeSelect} from "app/taxation/invoicing/features/AccountCodeSelect";
import {TaxCodeSelect} from "app/taxation/invoicing/features/TaxCodeSelect";
import {useItemAccountCodeSuggestions} from "app/taxation/invoicing/hooks/useAccountCodeSuggestions";
import {useDashdocTaxCodes} from "app/taxation/invoicing/services/invoiceItemCatalogApiHooks";

import {TaxCodeForCatalog} from "../types/invoiceItemCatalogTypes";

type InputFormType = {
    itemName: string;
    accountCode: string;
    taxCode: TaxCodeForCatalog | null;
    enabled: boolean;
};

const validationScheme = z.object({
    itemName: z.string().min(1),
    accountCode: z.string(),
    taxCode: z.object({
        id: z.number(),
        country: z.string(),
        tax_rate: z.string(),
        dashdoc_id: z.string(),
    }),
    enabled: z.boolean(),
});

export type ValidInvoiceItemFormType = z.output<typeof validationScheme>;
/**
 * A modal containing a form for creating or editing an invoice item.
 */
export const InvoiceItemFormModal: FC<{
    title: string;
    initialValues: InputFormType;
    onSubmit: (invoiceItemForm: ValidInvoiceItemFormType) => unknown;
    onClose: () => unknown;
    "data-testid"?: string;
}> = ({title, initialValues, onSubmit, onClose, ...props}) => {
    const accountCodesSuggestions = useItemAccountCodeSuggestions();
    const {taxCodes} = useDashdocTaxCodes();
    const {handleSubmit, control, formState} = useForm<
        InputFormType,
        never,
        ValidInvoiceItemFormType
    >({
        resolver: zodResolver(validationScheme),
        defaultValues: initialValues,
    });
    const submit = handleSubmit((data) => {
        onSubmit(data);
    });

    return (
        <Modal
            title={title}
            onClose={onClose}
            data-testid={props["data-testid"]}
            secondaryButton={{
                onClick: onClose,
            }}
            mainButton={{
                type: "button",
                children: t("common.save"),
                onClick: submit,
                disabled: !formState.isValid || formState.isSubmitting,
                "data-testid": "invoiceItemCatalog-save-form-button",
            }}
        >
            <>
                <form>
                    <Controller
                        name="enabled"
                        control={control}
                        render={({field}) => (
                            <>
                                <Flex
                                    flexDirection={"row"}
                                    alignItems={"center"}
                                    justifyContent={"left"}
                                    mb={3}
                                    pb={2}
                                >
                                    <Text variant="h1" flexGrow={1}>
                                        {t("invoiceItemCatalog.createModalInformation")}
                                    </Text>
                                    <SwitchInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        data-testid={"invoiceItemCatalog-enable-switch"}
                                    />
                                    <Text ml={2}>{t("invoiceItemCatalog.ActivateTheItem")}</Text>
                                </Flex>
                                {!field.value && (
                                    <Callout
                                        variant={"warning"}
                                        mb={4}
                                        data-testid={"invoiceItemCatalog-warning-inactive-item"}
                                    >
                                        {t("invoiceItemCatalog.InactiveInvoiceItemWarning")
                                            .split("\n")
                                            .map((sentence, index) => (
                                                <>
                                                    {index > 0 && <br />}
                                                    {sentence}
                                                </>
                                            ))}
                                    </Callout>
                                )}
                            </>
                        )}
                    />
                    <Flex flexDirection={"column"} alignItems={"stretch"} justifyContent={"start"}>
                        <Controller
                            control={control}
                            name="itemName"
                            render={({field}) => (
                                <TextInput
                                    required={true}
                                    label={t("invoiceItemCatalog.itemNameInput")}
                                    value={field.value}
                                    onChange={field.onChange}
                                    data-testid={"invoiceItemCatalog-itemName-input"}
                                    mb={4}
                                />
                            )}
                        />
                        <Flex
                            flexDirection={"row"}
                            alignItems={"center"}
                            justifyContent={"stretch"}
                            mb={4}
                        >
                            <Flex flexDirection={"column"} flexGrow={1} mr={4} flexBasis={"50%"}>
                                <Controller
                                    control={control}
                                    name="accountCode"
                                    render={({field}) => (
                                        <AccountCodeSelect
                                            value={field.value}
                                            suggestions={accountCodesSuggestions}
                                            onChange={field.onChange}
                                            data-testid={"invoiceItemCatalog-accountCode-input"}
                                            required={false}
                                        />
                                    )}
                                />
                            </Flex>
                            <Flex flexDirection={"column"} flexGrow={1} flexBasis={"50%"}>
                                <Controller
                                    control={control}
                                    name="taxCode"
                                    render={({field}) => (
                                        <TaxCodeSelect
                                            value={field.value}
                                            options={taxCodes}
                                            onChange={field.onChange}
                                            data-testid={"invoiceItemCatalog-taxCode-input"}
                                            required={true}
                                        />
                                    )}
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                </form>
            </>
        </Modal>
    );
};
