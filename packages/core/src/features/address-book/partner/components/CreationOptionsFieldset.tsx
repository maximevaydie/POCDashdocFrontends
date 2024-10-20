import {t} from "@dashdoc/web-core";
import {Box, ErrorMessage, Flex, SwitchInput, Text} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useWatch} from "react-hook-form";

type CreationOptionsFieldsetProps = {
    canEditCompany: boolean;
};

export function CreationOptionsFieldset({canEditCompany}: CreationOptionsFieldsetProps) {
    const partner_types = useWatch({name: "partner_types"});
    return (
        <Box>
            <Text variant="h1" mb={4}>
                {t("partnerModal.creationOptions")}
            </Text>
            <Flex flexDirection="column" style={{gap: "10px"}}>
                {partner_types.includes("is_shipper") && (
                    <Box>
                        <Controller
                            name="is_invoiceable"
                            render={({field, fieldState: {error}}) => (
                                <>
                                    <SwitchInput
                                        {...field}
                                        data-testid="company-modal-is-invoiceable"
                                        labelRight={t("company.invoicing.invoiceableSwitchLabel")}
                                        disabled={!canEditCompany}
                                    />
                                    {error?.message && <ErrorMessage error={error.message} />}
                                </>
                            )}
                        />
                    </Box>
                )}
                <Box>
                    <Controller
                        name="is_also_a_logistic_point"
                        render={({field, fieldState: {error}}) => (
                            <>
                                <SwitchInput
                                    {...field}
                                    data-testid="company-modal-is-also-a-logistic-point"
                                    labelRight={t("partnerModal.addressIsAlsoALogisiticPoint")}
                                    disabled={!canEditCompany}
                                />
                                {error?.message && <ErrorMessage error={error.message} />}
                                <Text variant="caption" color="grey.dark" mt={2}>
                                    {t("partnerModal.addressIsAlsoALogisiticPointDescription")}
                                </Text>
                            </>
                        )}
                    />
                </Box>
            </Flex>
        </Box>
    );
}
