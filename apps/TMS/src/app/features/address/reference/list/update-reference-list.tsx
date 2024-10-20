import {t} from "@dashdoc/web-core";
import {TextInputEditableList} from "@dashdoc/web-ui";
import React from "react";

interface UpdateReferenceListProps {
    onChange: (item: string) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    reference: string;
    label?: string;
    "data-testid"?: string;
    confirmationExtractedCodes?: string[];
}

export const UpdateReferenceList = ({
    onChange,
    reference,
    autoFocus,
    disabled,
    label,
    confirmationExtractedCodes,
    ...otherProps
}: UpdateReferenceListProps) => {
    return (
        <TextInputEditableList
            autoFocus={autoFocus}
            defaultItem={reference}
            onChange={onChange}
            disabled={disabled}
            label={label}
            confirmationExtractedCodes={confirmationExtractedCodes}
            addItemLabel={t("components.addReference")}
            {...otherProps}
        />
    );
};
