import {
    CompanyModal,
    companyService,
    getConnectedCompany,
    getConnectedManager,
    managerService,
    useBaseUrl,
} from "@dashdoc/web-common";
import type {PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {LINK_PARTNERS_EXPORTS} from "app/features/sidebar/constants";
import {useSelector} from "app/redux/hooks";

import {NuvoPartnerImporter} from "./NuvoPartnerImporter";

type Props = {
    onRefresh: () => void;
};
export function PartnersAction({onRefresh}: Props) {
    const history = useHistory();
    const baseUrl = useBaseUrl();
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);
    const [isNewCompanyModalOpen, openNewCompanyModal, closeNewCompanyModal] = useToggle();

    const canAddCompany =
        companyService.canCreateCompany(connectedCompany) &&
        connectedManager &&
        managerService.hasAtLeastUserRole(connectedManager);

    return (
        <Flex alignItems="baseline">
            <Button
                data-testid="companies-screen-exports-view-button"
                name="exports"
                onClick={handleExportView}
                variant="plain"
            >
                <Icon name="exports" mr={3} />
                {t("common.exports")}
            </Button>
            {canAddCompany && (
                <>
                    <NuvoPartnerImporter key="partnerImporter" onImportDone={onRefresh} />
                    <Button onClick={openNewCompanyModal} data-testid="add-company-button" ml={2}>
                        <Icon name="add" mr={3} />
                        {t("components.addPartner")}
                    </Button>
                    {isNewCompanyModalOpen && (
                        <CompanyModal onClose={closeNewCompanyModal} onSave={handleAddCompany} />
                    )}
                </>
            )}
        </Flex>
    );

    function handleExportView() {
        history.push(`${baseUrl}${LINK_PARTNERS_EXPORTS}`);
    }

    function handleAddCompany(company: Company | PartnerDetailOutput) {
        const link = companyService.getPartnerLink(baseUrl, company);
        history.push(link);
    }
}
