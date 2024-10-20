import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal} from "@dashdoc/web-ui";
import {GoBack} from "features/company/components/GoBack";
import {
    SelectCompanyPayload,
    CreateCompanyPayload,
    SelectOrCreateCompanyForm,
} from "features/company/SelectOrCreateCompanyForm";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {selectProfile} from "redux/reducers/flow";
import {Site} from "types";

import {CreateCompanyForm} from "./CreateCompanyForm";

type Props = {
    name?: string;
    flowSite: Site;
    allowSearch: boolean;
    onSelectOrCreate: (payload: SelectCompanyPayload | CreateCompanyPayload) => void;
    onAbort: () => void;
};

export function SelectOrCreateCompanyModal({
    name,
    flowSite,
    allowSearch,
    onSelectOrCreate,
    onAbort,
}: Props) {
    const profile = useSelector(selectProfile);
    const [key, setKey] = useState<string>("_");

    return (
        <Modal
            title={
                profile === "siteManager"
                    ? t("flow.selectOrCreateCompanyModal.addCompany")
                    : t("flow.selectOrCreateCompanyModal.addOrFindCompany")
            }
            onClose={onAbort}
            size="large"
            mainButton={null}
        >
            <Flex flexGrow={1}>
                <Box pr={2}>
                    <GoBack onAbort={handleBack} />
                </Box>
                <Box flexGrow={1}>
                    {allowSearch ? (
                        <SelectOrCreateCompanyForm
                            key={key}
                            submitLabel={t("common.add")}
                            site={flowSite}
                            onSelectOrCreate={onSelectOrCreate}
                        />
                    ) : (
                        <CreateCompanyForm
                            key={key}
                            name={name}
                            submitLabel={t("common.add")}
                            site={flowSite}
                            onCreateCompany={(createCompanyForm) => {
                                const payload: CreateCompanyPayload = {
                                    new_company: createCompanyForm,
                                };
                                onSelectOrCreate(payload);
                            }}
                            onSelectCompany={handleSelectCompany}
                        />
                    )}
                </Box>
            </Flex>
        </Modal>
    );

    async function handleBack() {
        setKey(guid()); // reset the SelectOrCreateCompanyForm/CreateCompanyForm state
    }

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
