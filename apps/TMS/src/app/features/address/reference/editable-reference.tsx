import {EditableField} from "@dashdoc/web-ui";
import React from "react";

interface ReferenceEditableFieldProps {
    reference?: string;
    onEditReferenceClick?: (ref: string) => void;
    label: string;
    placeholder: string;
    updateAllowed: boolean;
    referenceIcon?: React.ReactNode;
    referenceTooltip?: string;
    "data-testid"?: string;
}

export function EditableReference(props: ReferenceEditableFieldProps) {
    const trimmedReference = props.reference ? props.reference.trim() : "";
    return (
        <EditableField
            clickable={props.updateAllowed}
            label={props.label}
            value={trimmedReference}
            placeholder={props.placeholder}
            onClick={
                props.onEditReferenceClick &&
                props.onEditReferenceClick.bind(null, props.reference || "")
            }
            data-testid={props["data-testid"] + "-reference"}
            icon={props.referenceIcon}
        ></EditableField>
    );
}
