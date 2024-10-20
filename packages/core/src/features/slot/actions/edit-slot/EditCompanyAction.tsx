import {apiService, fetchAccount} from "@dashdoc/web-common";
import {storeService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {
    CreateCompanyPayload,
    SelectCompanyPayload,
} from "features/company/SelectOrCreateCompanyForm";
import React from "react";
import {useDispatch} from "react-redux";
import {useSelector} from "redux/hooks";
import {selectFlowDelegateCompanies, selectProfile} from "redux/reducers/flow";
import {isUpdating} from "redux/reducers/flow/slot.slice";
import {Company, Site} from "types";

import {EditCompanyModal} from "./modals/EditCompanyModal";
type Props = {site: Site; defaultCompany: Company; slotId: number};

export function EditCompanyAction({site, defaultCompany, slotId}: Props) {
    const disabled = useSelector(isUpdating);
    const profile = useSelector(selectProfile);
    const dispatch = useDispatch();
    const [show, setShow, setHide] = useToggle(false);
    return (
        <>
            <Button variant="secondary" onClick={setShow} disabled={disabled} width="fit-content">
                {t("common.edit")}
            </Button>
            {show && (
                <EditCompanyModal
                    title={t("common.editCompany")}
                    site={site}
                    defaultCompany={defaultCompany}
                    onClose={setHide}
                    onSubmit={setHide}
                    onJoinCompany={handleJoinCompany}
                    onCreateCompany={handleCreateCompany}
                    slotId={slotId}
                    data-testid="testId"
                />
            )}
        </>
    );

    async function handleJoinCompany(payload: SelectCompanyPayload): Promise<Company> {
        let company: Company;
        await apiService.post(
            `/flow/companies/${payload.existing_company}/join/`,
            {},
            {
                apiVersion: "web",
            }
        );
        await dispatch(fetchAccount({silently: true}));
        const state = storeService.getState();
        const delegateCompanies = selectFlowDelegateCompanies(state as any);
        const delegateCompany = delegateCompanies.find(
            (company) => company.pk === payload.existing_company
        );
        if (delegateCompany) {
            company = delegateCompany;
        } else {
            Logger.error("Invalid state, cannot retrieve the delegate company");
            company = {pk: payload.existing_company, name: t("common.notDefined")};
        }

        return company;
    }

    async function handleCreateCompany(payload: CreateCompanyPayload): Promise<Company> {
        const company: Company = await apiService.post(
            `/flow/companies/`,
            {
                site: site.id,
                ...payload.new_company,
                with_manager: profile === "siteManager" ? false : true,
            },
            {
                apiVersion: "web",
            }
        );
        return company;
    }
}
