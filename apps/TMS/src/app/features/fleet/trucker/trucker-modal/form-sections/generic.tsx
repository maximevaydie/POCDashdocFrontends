import {Box, TextProps, Text} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

export const FieldSet = Box.withComponent("fieldset");
export const FieldSetLegend = styled((props: TextProps) => (
    <Text as="legend" variant="h1" {...props} />
))`
    border-bottom: none; // Remove style from bootstrap...
`;
