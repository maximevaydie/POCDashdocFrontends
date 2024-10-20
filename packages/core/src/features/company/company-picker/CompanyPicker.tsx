import {Box, Flex} from "@dashdoc/web-ui";
import {
    CreateCompanyPayload,
    SelectCompanyPayload,
} from "features/company/SelectOrCreateCompanyForm";
import React, {FunctionComponent, useState} from "react";
import {FlowProfile, Site} from "types";
import {Company} from "types/company";

import {CompanyCreatableSelect} from "./components/CompanyCreatableSelect";

type CompanyPickerProps = {
    companyError?: string;
    initialSelection: Company;
    flowSite: Site;
    onUpdate: (company: Company) => void;
    onSelectOrCreate?: (payload: SelectCompanyPayload | CreateCompanyPayload) => Promise<Company>;
    allowCreate: boolean;
    allowSearch: boolean;
    profile: FlowProfile;
};

export const CompanyPicker: FunctionComponent<CompanyPickerProps> = ({
    companyError,
    initialSelection,
    flowSite,
    onUpdate,
    onSelectOrCreate,
    allowSearch,
    profile,
}) => {
    const [company, setCompany] = useState<Company>(initialSelection);

    return (
        <Flex flexDirection="column" width="100%">
            <Flex
                flexDirection="row"
                justifyContent="space-around"
                flexGrow={1}
                data-testid="contact-picker"
            >
                <Box width="100%">
                    <CompanyCreatableSelect
                        data-testid={`company-select`}
                        flowSite={flowSite}
                        profile={profile}
                        error={companyError}
                        onChange={handleSelectCompany}
                        value={company}
                        displayAddress={true}
                        onSelectOrCreate={async (payload) => {
                            if (onSelectOrCreate) {
                                const newCompany = await onSelectOrCreate(payload);
                                handleSelectCompany(newCompany);
                            }
                        }}
                        allowSearch={allowSearch}
                        required
                    />
                </Box>
            </Flex>
        </Flex>
    );

    function handleSelectCompany(newCompany: Company) {
        setCompany(newCompany);
        onUpdate(newCompany);
    }
};
