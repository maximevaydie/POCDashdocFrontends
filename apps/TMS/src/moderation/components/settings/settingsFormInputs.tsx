import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {JSONSchema7} from "json-schema";
import isNil from "lodash.isnil";
import React from "react";

export const FormStyle = styled("div")`
    .control-label,
    .checkbox > label > span {
        font-weight: bold;
    }
    .rjsf > div > fieldset > div > fieldset > div {
        border-top: 1px solid ${theme.colors.grey.light};
    }
`;

export type Schema = {
    properties: {
        [key: string]: JSONSchema7;
    };
    required: [];
    type: "object";
};

// Override the default checkbox component to have the description below the input like other components
export const CustomCheckbox = function (props: {
    id: string;
    schema: any;
    value: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <>
            <label className="control-label" htmlFor={props.id}>
                {props.schema.title}
            </label>
            <input
                id={props.id}
                type="checkbox"
                defaultChecked={props.value}
                style={{marginLeft: "10px"}}
                onClick={() => props.onChange(!props.value)}
            />
            <p className="field-description">{props.schema.description}</p>
        </>
    );
};

export function formatDataWithJSONSchema(formData: any, schema: Schema) {
    // replace undefined with "" in enums and null in numbers
    // see https://github.com/rjsf-team/react-jsonschema-form/issues/410
    for (let field of Object.keys(formData)) {
        if (formData[field] !== undefined) {
            continue;
        }

        let schemaField = schema.properties[field];

        if (
            (schemaField?.enum?.length ?? 0) > 0 &&
            schemaField?.type === "string" &&
            // @ts-ignore
            schemaField?.enum.indexOf("") > -1
        ) {
            formData[field] = "";
        } else if (
            (schemaField?.type?.length ?? 0) > 0 &&
            // @ts-ignore
            schemaField?.type?.indexOf("integer") > -1 &&
            // @ts-ignore
            schemaField?.type?.indexOf("null") > -1
        ) {
            formData[field] = null;
        } else if (
            (schemaField?.type?.length ?? 0) > 0 &&
            // @ts-ignore
            schemaField?.type?.indexOf("string") > -1 &&
            !isNil(schemaField?.default)
        ) {
            formData[field] = schemaField?.default;
        }
    }
}
