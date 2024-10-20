import {AutoCompleteTextInput, AutoCompleteInputProps} from "@dashdoc/web-ui";
import React, {FC} from "react";

export type CompanyLegalFormSelectProps<TValue> = AutoCompleteInputProps<TValue> & {
    country: string;
    rootId?: string;
};

export const CompanyLegalFormSelect: FC<CompanyLegalFormSelectProps<any>> = ({
    country,
    rootId = "react-app",
    ...props
}) => {
    const suggestions =
        (country ?? "").toUpperCase() === "FR"
            ? [
                  {
                      label: "Entreprise unipersonnelle à responsabilité limitée (EURL)",
                      value: "EURL",
                  },
                  {label: "Société anonyme (SA)", value: "SA"},
                  {label: "Société à responsabilité limitée (SARL)", value: "SARL"},
                  {label: "Société par actions simplifiée (SAS)", value: "SAS"},
                  {label: "Société en commandite par actions (SCA)", value: "SCA"},
                  {label: "Société en commandite simple (SCS)", value: "SCS"},
                  {label: "Société en nom collectif (SNC)", value: "SNC"},
                  {label: "Société par actions simplifiée unipersonnelle (SASU)", value: "SASU"},
              ]
            : [];

    return <AutoCompleteTextInput rootId={rootId} suggestions={suggestions} {...props} />;
};
