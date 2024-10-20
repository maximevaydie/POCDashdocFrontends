import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router-dom";

type Props = {
    transportUid: string;
    isDeleted: boolean;
    isLoading: boolean;
    isComplex: boolean;
};
export function CreateTemplateButton({transportUid, isDeleted, isLoading, isComplex}: Props) {
    const history = useHistory();
    let path = `/app/transport-templates/new-from-transport/${transportUid}/`;
    if (isComplex) {
        path += "?complex=true";
    }
    return (
        <IconButton
            ml={2}
            name="copyPaste"
            onClick={() => {
                history.push(path);
            }}
            label={t("transportTemplates.newTemplateButtonLabel")}
            data-testid="transport-detail-create-template"
            disabled={isDeleted || isLoading}
        />
    );
}
