import {
    CreateCompanyPayload,
    SelectCompanyPayload,
} from "features/company/SelectOrCreateCompanyForm";
import {SelectOrCreateCompanyModal} from "features/company/SelectOrCreateCompanyModal";
import React, {useState} from "react";
import {FlowProfile} from "types";

import {CompanySelect, CompanySelectProps} from "./CompanySelect";

type Props = Omit<CompanySelectProps, "onCreateCompany"> & {
    allowSearch: boolean;
    profile: FlowProfile;
    onSelectOrCreate?: (payload: SelectCompanyPayload | CreateCompanyPayload) => Promise<void>;
};

export function CompanyCreatableSelect({
    flowSite,
    allowSearch,
    profile,
    onSelectOrCreate,
    ...selectProps
}: Props) {
    const [addCompanyModalParam, setAddCompanyModalParam] = useState<{name: string} | null>(null);

    return (
        <>
            <CompanySelect
                {...selectProps}
                flowSite={flowSite}
                profile={profile}
                onFindOrCreateCompany={
                    onSelectOrCreate
                        ? (newCompanyName: string) =>
                              setAddCompanyModalParam({name: newCompanyName})
                        : undefined
                }
            />
            {!!addCompanyModalParam && (
                <SelectOrCreateCompanyModal
                    name={addCompanyModalParam.name}
                    flowSite={flowSite}
                    allowSearch={allowSearch}
                    onSelectOrCreate={handleSelectOrCreate}
                    onAbort={() => {
                        setAddCompanyModalParam(null);
                    }}
                />
            )}
        </>
    );

    async function handleSelectOrCreate(payload: SelectCompanyPayload | CreateCompanyPayload) {
        await onSelectOrCreate?.(payload);
        setAddCompanyModalParam(null);
    }
}
