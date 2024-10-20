import {
    apiService,
    authService,
    fetchAccount,
    isAuthenticated,
    storeService,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Token} from "dashdoc-utils/dist/api/scopes/authentification";
import {CreateAccountPayload} from "features/account/actions/forms/CreateAccountForm";
import {LoginPayload} from "features/account/actions/forms/LoginForm";
import {LoginOrCreateForm} from "features/account/actions/forms/LoginOrCreateForm";
import {CreateCompanyForm} from "features/company/CreateCompanyForm";
import {AvailableCompany} from "features/company/SelectCompanyForm";
import {
    CreateCompanyPayload,
    SelectCompanyPayload,
    SelectOrCreateCompanyForm,
} from "features/company/SelectOrCreateCompanyForm";
import {SlotTime, Step} from "features/slot/actions/slot-booking/step/types";
import React from "react";
import {Control} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {selectFlowDelegateCompanies, selectProfile} from "redux/reducers/flow";
import {firstTimeAsDelegate} from "redux/reducers/flow/site.slice";
import {Company, Site, Zone} from "types";

import {AddSlotStepOne} from "./content/AddSlotStepOne";
import {AddSlotStepThree} from "./content/AddSlotStepThree";
import {AddSlotStepTwo} from "./content/AddSlotStepTwo";

interface StepContentProps {
    site: Site;
    step: Step;
    zones: Zone[];
    isMulti: boolean;
    selectedZone: Zone | null;
    onSelectZone: (zone: Zone) => Promise<void>;
    selectedSlotTime: SlotTime | null;
    onSelectSlotTime: (slotTime: SlotTime) => Promise<void>;
    createAccountPayload: CreateAccountPayload | null;
    onCreateAccount: (payload: CreateAccountPayload) => void;
    control: Control<any, object>;
}

export function StepContent({createAccountPayload, onCreateAccount, ...props}: StepContentProps) {
    const isAuth = useSelector(isAuthenticated);
    const profile = useSelector(selectProfile);
    const dispatch = useDispatch();

    const needAuth = !isAuth && createAccountPayload === null;

    switch (props.step) {
        case 1:
            return <AddSlotStepOne {...props} />;
        case 2:
            return <AddSlotStepTwo {...props} />;
        case 3:
            if (profile !== "guest") {
                return (
                    <AddSlotStepThree
                        {...props}
                        onJoinCompany={handleJoinCompany}
                        onCreateCompany={handleCreateCompany}
                    />
                );
            }
            if (needAuth) {
                return (
                    <LoginOrCreateForm
                        site={props.site}
                        selectedSlotTime={
                            props.selectedSlotTime as SlotTime /* a selectedSlotTime cannot be null here */
                        }
                        onCreateAccount={handleCreateAccount}
                        onLogin={handleLogin}
                    />
                );
            } else {
                return (
                    <SelectOrCreateCompanyForm
                        site={props.site}
                        onSelectOrCreate={isAuth ? handleJoinOrCreate : handleRegister}
                    />
                );
            }
        default:
            return null;
    }

    function handleCreateAccount(payload: CreateAccountPayload) {
        onCreateAccount(payload);
    }

    async function handleLogin(payload: LoginPayload): Promise<void> {
        const token = await apiService.Auth.login({data: payload});
        authService.setAuthToken(token);
        await dispatch(fetchAccount({silently: true}));
    }

    async function handleRegister(companyPayload: SelectCompanyPayload | CreateCompanyPayload) {
        if (createAccountPayload === null) {
            return;
        }
        let payload: RegisterAndJoinPayload | RegisterAndCreateCompanyPayload;
        if ("existing_company" in companyPayload) {
            payload = {
                site: props.site.id,
                ...createAccountPayload,
                existing_company: companyPayload.existing_company,
            };
        } else {
            payload = {
                site: props.site.id,
                ...createAccountPayload,
                new_company: companyPayload.new_company,
            };
        }
        const {token}: RegisterResponse = await apiService.post(`/flow/register/`, payload, {
            apiVersion: "web",
        });
        if (token) {
            authService.setAuthToken(token);
            await dispatch(fetchAccount({silently: true}));
            await dispatch(firstTimeAsDelegate());
        }
    }

    async function handleJoinOrCreate(
        companyPayload: SelectCompanyPayload | CreateCompanyPayload
    ) {
        let company: Company;
        if ("existing_company" in companyPayload) {
            company = await handleJoinCompany(companyPayload);
        } else {
            company = await handleCreateCompany(companyPayload);
        }

        await dispatch(fetchAccount({silently: true}));
        await dispatch(firstTimeAsDelegate());
        return company;
    }

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
                site: props.site.id,
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

type RegisterAndJoinPayload = CreateAccountPayload & {
    site: number;
    existing_company: number;
};

type RegisterAndCreateCompanyPayload = CreateAccountPayload & {
    new_company: CreateCompanyForm;
    site: number;
};

type RegisterResponse = {token: Token; company: AvailableCompany};
