import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text, TextInput} from "@dashdoc/web-ui";
import {FormikContextType} from "formik";
import React from "react";

import {urlService} from "../../../../../services/url.service";
import {AddressForm} from "../types";

type Props = {
    formik: FormikContextType<Partial<AddressForm>>;
    disabled?: boolean;
};
export function FlowSiteSection({formik, disabled}: Props) {
    return (
        <Flex flexDirection="column" mt={4}>
            <Flex alignItems="center" mb={4}>
                <Text variant="h1">{t("tmsIntegration.FlowSiteSection.title")}</Text>
                <Icon name="flow" ml={2} fontSize={4} />
            </Flex>
            <Text>{t("tmsIntegration.FlowSiteSection.description")}</Text>
            <Flex mt={4} justifyContent="space-between">
                <Box flexBasis="50%">
                    <TextInput
                        name="flowUrl"
                        placeholder={urlService.getFlowSiteUrl("my-site")}
                        label={t("tmsIntegration.flowBookingLink")}
                        data-testid="flow-url"
                        value={formik.values.flowUrl ?? ""}
                        onChange={(value) => {
                            formik.setFieldError("flowUrl", undefined);
                            formik.setFieldValue("flowUrl", value);
                        }}
                        error={formik.errors.flowUrl}
                        disabled={disabled}
                    />
                </Box>
            </Flex>
        </Flex>
    );
}
