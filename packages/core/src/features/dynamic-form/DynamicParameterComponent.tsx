import {Box, Flex, Text, TextInput} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";

import {AddressSelect} from "../address-book/address/input/AddressSelect";
import {CompanySelect} from "../address-book/company/CompanySelect";
import {SupportTypeSelectForDynamicForm} from "./inputs/SupportTypeSelectForDynamicForm";

import {DynamicParameterSpec} from "./types";

export type DynamicParameterComponentProps = {
    readOnly?: boolean;
    parameter: DynamicParameterSpec;
};

export function DynamicParameterComponent({parameter, readOnly}: DynamicParameterComponentProps) {
    const input = (() => {
        const type = parameter.type;
        if (type === "text" || type === "email" || type === "password") {
            return (
                <Controller
                    name={parameter.key}
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            {...field}
                            disabled={readOnly}
                            error={error?.message}
                            label={parameter.name}
                            required={parameter.is_required}
                            type={type}
                        />
                    )}
                />
            );
        }

        if (type === "partner.shipper") {
            return (
                <Controller
                    name={parameter.key}
                    render={({field, fieldState: {error}}) => (
                        <CompanySelect
                            companyCategory="shipper"
                            label={parameter.name}
                            isDisabled={readOnly}
                            required={parameter.is_required}
                            error={error?.message}
                            {...field}
                        />
                    )}
                />
            );
        }

        if (type === "logistic_point") {
            return (
                <Controller
                    name={parameter.key}
                    render={({field, fieldState: {error}}) => (
                        <AddressSelect
                            categories={["origin", "destination"]}
                            label={parameter.name}
                            isDisabled={readOnly}
                            required={parameter.is_required}
                            error={error?.message}
                            {...field}
                        />
                    )}
                />
            );
        }

        if (type === "support_type") {
            return (
                <Controller
                    name={parameter.key}
                    render={({field, fieldState: {error}}) => (
                        <SupportTypeSelectForDynamicForm
                            label={parameter.name}
                            isDisabled={readOnly}
                            required={parameter.is_required}
                            error={error?.message}
                            {...field}
                        />
                    )}
                />
            );
        }

        throw new Error(`Unsupported parameter type: ${parameter.type}`);
    })();

    if (parameter.arrow_name) {
        return (
            <Flex justifyContent="start" alignItems="center" mt={2}>
                <Box width={100}>
                    <Text>{parameter.arrow_name}</Text>
                </Box>
                <RightArrow mx={5} />
                <Box width={["initial", 280, 400]}>{input}</Box>
            </Flex>
        );
    }

    return (
        <Flex justifyContent="space-between" mt={2}>
            <Flex alignItems="center">
                <Box width={["initial", 280, 400]}>{input}</Box>
            </Flex>
        </Flex>
    );
}

type BoxProps = Parameters<typeof Box>[0];
const RightArrow = (props: BoxProps) => (
    <Box {...props}>
        <svg
            width="50"
            height="24"
            viewBox="0 0 50 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M49.0607 13.0607C49.6464 12.4749 49.6464 11.5251 49.0607 10.9393L39.5147 1.3934C38.9289 0.807615 37.9792 0.807615 37.3934 1.3934C36.8076 1.97919 36.8076 2.92894 37.3934 3.51472L45.8787 12L37.3934 20.4853C36.8076 21.0711 36.8076 22.0208 37.3934 22.6066C37.9792 23.1924 38.9289 23.1924 39.5147 22.6066L49.0607 13.0607ZM-1.31134e-07 13.5L48 13.5L48 10.5L1.31134e-07 10.5L-1.31134e-07 13.5Z"
                fill="#C4CDD5"
            />
        </svg>
    </Box>
);
