import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

import {DynamicParameterComponent} from "./DynamicParameterComponent";
import {DynamicParameterSpec, DynamicParametersSection} from "./types";

type Props = {
    section: DynamicParametersSection;
    readOnly: boolean;
};

export function DynamicFormSectionComponent({section, readOnly}: Props) {
    return (
        <Box as="fieldset">
            {section.name && (
                <Text pt={5} as="legend" variant="h1" color="grey.dark" border="none">
                    {section.name}
                </Text>
            )}
            {section.description && (
                <Text mt={2} variant="body">
                    {section.description}
                </Text>
            )}
            {section.parameters.map((parameter: DynamicParameterSpec) => (
                <DynamicParameterComponent
                    key={parameter.key}
                    parameter={parameter}
                    readOnly={readOnly}
                />
            ))}
        </Box>
    );
}
