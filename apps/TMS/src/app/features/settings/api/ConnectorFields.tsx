import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, TextInput, TooltipWrapper} from "@dashdoc/web-ui";
import {FormikErrors} from "formik";
import React from "react";

import {ExtensionsConnectorPayload} from "../hooks/useCrudConnector";

import {RequiredInput} from "./types";

interface CredentialFieldsProps {
    requiredCredentials: RequiredInput[] | undefined;
    requiredParameters: RequiredInput[] | undefined;
    dataSource: string;
    values: ExtensionsConnectorPayload;
    errors: FormikErrors<ExtensionsConnectorPayload>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    disabled: boolean;
}

export const ConnectorFields = ({
    requiredCredentials,
    requiredParameters,
    dataSource,
    values,
    errors,
    setFieldValue,
    disabled,
}: CredentialFieldsProps) => {
    const requiredFields = (requiredCredentials ?? []).concat(requiredParameters ?? []);
    return (
        <>
            {requiredFields.map((field, index) => (
                <Flex justifyContent="space-between" mt={2} key={index}>
                    <Flex alignItems={"center"}>
                        <Box width={["initial", 280, 400]}>
                            <TextInput
                                value={values[field["id"]] as string}
                                id={field["id"]}
                                autoComplete="off"
                                label={field["label"]}
                                type={field["type"]}
                                error={errors[field["id"]]}
                                onChange={(value) => {
                                    setFieldValue(field["id"], value);
                                }}
                                data-testid={`${dataSource}-credentials-${field["id"]}-input`}
                                disabled={disabled}
                            />
                        </Box>
                        {field["helpText"] && (
                            <TooltipWrapper content={t(field["helpText"])}>
                                <Icon name="info" ml={2} />
                            </TooltipWrapper>
                        )}
                    </Flex>
                </Flex>
            ))}
        </>
    );
};
