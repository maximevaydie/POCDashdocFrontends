import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, TextArea} from "@dashdoc/web-ui";
import {Address, SecurityProtocol} from "dashdoc-utils";
import {FormikContextType} from "formik";
import React from "react";

import {AddressForm} from "../types";

import {SecurityProtocolField} from "./components/SecurityProtocolField";

type Props = {
    originalAddress?: Address | Partial<Omit<Address, "pk">>;
    formik: FormikContextType<Partial<AddressForm>>;
    securityProtocol: SecurityProtocol | undefined;
    disabled?: boolean;
};

export function InstructionAndSecuritySection({formik, securityProtocol, disabled}: Props) {
    const isOriginOrDestination = formik.values.addressTypes?.some((addressType) => {
        if (addressType.value && ["is_origin", "is_destination"].includes(addressType.value)) {
            return true;
        }
        return false;
    });

    return (
        <Flex flexDirection="column" mt={4}>
            <Text variant="h1" mb={4}>
                {t("addressModal.securityProtocolAndInstructions")}
            </Text>
            <Text color="grey.dark" variant="caption">
                {t("addressModal.securityProtocolInfo")}
            </Text>
            <Flex justifyContent="space-between">
                {(securityProtocol || isOriginOrDestination) && (
                    <SecurityProtocolField
                        file={formik.values.securityProtocolFile}
                        document={securityProtocol}
                        onChange={handleSecurityProtocolChange}
                        disabled={disabled}
                    />
                )}
                <Box flexBasis="100%" pt={2}>
                    <TextArea
                        pt={3}
                        height={100}
                        maxLength={1000}
                        name="instructions"
                        aria-label={t("addressModal.siteInstructions")}
                        label={t("addressModal.siteInstructions")}
                        data-testid="address-modal-instructions"
                        value={formik.values.instructions ?? ""}
                        onChange={(value) => formik.setFieldValue("instructions", value)}
                        error={formik.errors.instructions}
                        disabled={disabled}
                    />
                </Box>
            </Flex>
        </Flex>
    );

    function handleSecurityProtocolChange(file: File | null) {
        formik.setFieldValue("securityProtocolFile", file);
    }
}
