import {t} from "@dashdoc/web-core";
import {
    Box,
    FiltersSelectOption,
    Flex,
    Icon,
    Link,
    Select,
    Text,
    TextInput,
    type SelectOptions,
    type SimpleOption,
} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useFormContext, useWatch} from "react-hook-form";

import {useFeatureFlag} from "../../../../hooks/useFeatureFlag";

type Props = {canEditCompany: boolean};

export function GeneralFieldset({canEditCompany}: Props) {
    const display_remote_id = useWatch({name: "display_remote_id"});
    const display_invoicing_remote_id = useWatch({name: "display_invoicing_remote_id"});
    const {setValue} = useFormContext();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");

    return (
        <Box>
            <Text variant="h1" mb={4}>
                {t("common.general")}
            </Text>
            <Flex flexDirection="column" style={{gap: "10px"}}>
                <Controller
                    name="name"
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            {...field}
                            required
                            data-testid="company-modal-name"
                            label={t("partnerModal.partnerName")}
                            placeholder={t("common.typeHere")}
                            error={error?.message}
                            disabled={!canEditCompany}
                        />
                    )}
                />
                <Controller
                    name="partner_types"
                    render={({field, fieldState: {error}}) => {
                        const partnerTypeOptions: SelectOptions = [
                            {
                                label: t("common.carrier"),
                                value: "is_carrier",
                            },
                            {
                                label: t("common.shipper"),
                                value: "is_shipper",
                            },
                        ];
                        const value = ((field.value ?? []) as ("is_carrier" | "is_shipper")[]).map(
                            (v) => partnerTypeOptions.find((o) => o.value === v)
                        );
                        return (
                            <Select
                                {...field}
                                value={value}
                                onChange={(value: SimpleOption[]) => {
                                    const partner_types = value.map((v) => v.value);
                                    field.onChange(partner_types);
                                }}
                                isMulti
                                isSearchable={false}
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                components={{
                                    Option: FiltersSelectOption,
                                }}
                                label={t("partnerModal.partnerType")}
                                options={partnerTypeOptions}
                                data-testid="company-modal-partner-types"
                                error={error?.message}
                            />
                        );
                    }}
                />
                <Flex flexDirection="row" style={{gap: "10px"}}>
                    <Box flex={1}>
                        <Controller
                            name="vat_number"
                            render={({field, fieldState: {error}}) => (
                                <TextInput
                                    {...field}
                                    data-testid="company-modal-vat-number"
                                    label={t("components.VATNumber")}
                                    error={error?.message}
                                    disabled={!canEditCompany}
                                    width="100%"
                                />
                            )}
                        />
                    </Box>
                    <Box flex={1}>
                        <Controller
                            name="trade_number"
                            render={({field, fieldState: {error}}) => (
                                <TextInput
                                    {...field}
                                    data-testid="company-modal-trade_number"
                                    label={t("components.tradeNumber")}
                                    error={error?.message}
                                    disabled={!canEditCompany}
                                    width="100%"
                                />
                            )}
                        />
                    </Box>
                </Flex>
                {display_remote_id ? (
                    <Controller
                        name="remote_id"
                        render={({field, fieldState: {error}}) => (
                            <TextInput
                                {...field}
                                error={error?.message}
                                label={t("components.remoteId")}
                                data-testid="company-modal-remote-id"
                            />
                        )}
                    />
                ) : (
                    <Link
                        display="flex"
                        onClick={handleAddRemoteId}
                        data-testid="company-modal-add-remote-id-button"
                    >
                        <Icon name="add" mr={2} fontSize={1} />
                        {t("partnerModal.addRemoteId")}
                    </Link>
                )}
                {hasInvoiceEntityEnabled &&
                    !hasDashdocInvoicingEnabled &&
                    (display_invoicing_remote_id ? (
                        <Box ml={2} flex={1}>
                            <Controller
                                name="invoicing_remote_id"
                                render={({field, fieldState: {error}}) => (
                                    <TextInput
                                        {...field}
                                        data-testid="company-modal-invoicing-remote-idr"
                                        label={t("components.invoicingRemoteId")}
                                        error={error?.message}
                                        disabled={!canEditCompany}
                                    />
                                )}
                            />
                        </Box>
                    ) : (
                        <Link
                            display="flex"
                            onClick={handleAddInvoicingRemoteId}
                            data-testid="company-modal-add-invoicing-remote-id-button"
                        >
                            <Icon name="add" mr={2} fontSize={1} />
                            {t("partnerModal.addInvoicingRemoteId")}
                        </Link>
                    ))}
            </Flex>
        </Box>
    );

    function handleAddRemoteId() {
        setValue("display_remote_id", true);
    }

    function handleAddInvoicingRemoteId() {
        setValue("display_invoicing_remote_id", true);
    }
}
