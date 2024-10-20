import {t} from "@dashdoc/web-core";
import {EditableField} from "@dashdoc/web-ui";
import {getItemAsAList} from "dashdoc-utils";
import React from "react";

type Props = {
    reference?: string;
    referenceIcon?: React.ReactNode;
    label?: string;
    "data-testid"?: string;
    onEditReferenceClick?: (ref: string) => void;
    onViewReferenceClick?: (ref: string) => void;
    updateAllowed: boolean;
    placeholder: string;
};

export function EditableReferenceList(props: Props) {
    const referenceList = getItemAsAList(props.reference);

    return (
        <EditableField
            noWrap={true}
            clickable
            label={props.label}
            value={referenceList.join(", ")}
            placeholder={props.placeholder}
            onClick={() =>
                props.updateAllowed
                    ? props.onEditReferenceClick?.(props.reference || "")
                    : // @ts-ignore
                      props.onViewReferenceClick?.(props.reference)
            }
            data-testid={props["data-testid"] + "-reference"}
            icon={props.referenceIcon}
            updateButtonLabel={!props.updateAllowed ? t("common.view") : undefined}
        />
    );
}
