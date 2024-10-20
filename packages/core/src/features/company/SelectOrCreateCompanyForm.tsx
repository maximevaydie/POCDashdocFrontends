import {Box} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {Site} from "types";

import {CreateCompanyForm} from "./CreateCompanyForm";
import {SelectCompanyForm} from "./SelectCompanyForm";

export type SelectCompanyPayload = {
    existing_company: number;
    existing_company_name: string; // only for option purpose
};

export type CreateCompanyPayload = {
    new_company: CreateCompanyForm;
};

type Props = {
    site: Site;
    submitLabel?: string;
    onSelectOrCreate: (payload: SelectCompanyPayload | CreateCompanyPayload) => void;
};
export function SelectOrCreateCompanyForm({submitLabel, site, onSelectOrCreate}: Props) {
    const [state, setState] = useState<"create" | "select">("select");

    let content: React.ReactNode;
    // FIXME, we cannot select or create a company with if we already have a company.
    if (state === "create") {
        content = (
            <CreateCompanyForm
                site={site}
                submitLabel={submitLabel}
                onCreateCompany={(createCompanyForm) => {
                    const payload: CreateCompanyPayload = {
                        new_company: createCompanyForm,
                    };
                    onSelectOrCreate(payload);
                }}
                onSelectCompany={handleSelectCompany}
            />
        );
    } else {
        content = (
            <SelectCompanyForm
                site={site}
                submitLabel={submitLabel}
                onAddCompany={() => {
                    setState("create");
                }}
                onSelectCompany={handleSelectCompany}
            />
        );
    }

    return <Box flexGrow={1}>{content}</Box>;

    function handleSelectCompany(companyId: number, companyName: string) {
        if (companyId) {
            const payload: SelectCompanyPayload = {
                existing_company: companyId,
                existing_company_name: companyName,
            };
            onSelectOrCreate(payload);
        }
    }
}
