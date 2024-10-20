import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {Form, FormikProvider, useFormik} from "formik";
import React from "react";

import {LocationPicker as Component, LocationPickerProps} from "../LocationPicker";
import {LocationTypeValue} from "../types";

type SampleForm = {
    value: string;
};

const Template = (args: LocationPickerProps) => {
    const handleSubmit = (values: SampleForm) => {
        alert(`submit "${values.value}"`);
    };
    const validateValues = (values: SampleForm) => {
        let errors: any = {};
        if (!values.value) {
            errors.company = t("errors.field_cannot_be_empty");
        }
        return errors;
    };
    const formik = useFormik({
        // @ts-ignore
        initialValues: {value: undefined},
        onSubmit: handleSubmit,
        validate: validateValues,
        validateOnBlur: false,
        validateOnChange: false,
    });
    return (
        <Box width="400px" backgroundColor="white">
            <FormikProvider value={formik}>
                <Form>
                    <Component {...args} />
                </Form>
            </FormikProvider>
        </Box>
    );
};
export const Playground = Template.bind({});
Playground.args = {
    title: "Title",
    availableTypes: ["county", "city"],
    defaultType: "county",
    onChange: (value: string, locationType: LocationTypeValue) => {
        // eslint-disable-next-line no-console
        console.log(`availableTypes(${value}, ${locationType})`);
    },
};
Playground.argTypes = {
    title: {
        control: {
            type: "text",
        },
    },
    subtitle: {
        control: {
            type: "text",
        },
    },
    availableTypes: {control: "multi-select", options: ["county", "postcode", "city"]},
    rows: {control: "object"},
};

export default {
    title: "Web UI/picker/LocationPicker",
    component: Playground,
};
