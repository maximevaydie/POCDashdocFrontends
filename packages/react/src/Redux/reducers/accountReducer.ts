import {Logger, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import * as Sentry from "@sentry/browser";
import {
    Company,
    GroupView,
    ManagerMe,
    Subscription,
    SubscriptionEntitlement,
    Usage,
    UsagePayload,
    UpdatableSettings,
} from "dashdoc-utils";
import deepMerge from "lodash.merge";
import {normalize} from "normalizr";
import {z} from "zod";

import {webApi, ApiModels} from "../../../dashdocOLD/common/src/index";
import {apiService} from "../../services/api.service";
import {getErrorMessageFromServerError} from "../../services/errors.service";
import {ManagerCompany} from "../../types/types";
import {managerSchema} from "../schemas";

// Action Creators
// ---------------

export const updateAccountFeatureFlag = createAsyncThunk(
    "dashdoc/account/updateFeatureFlag",
    async ({flagName, value}: {flagName: string; value: boolean}) => {
        /**
         * We assume that an error free API call means that the feature flag is set to the expected value in configcat.
         * We could add a pusher on the feature flag to update the flag in the store, but it seems overkill.
         * Note : If configcat cannot set the flag, the next call to fetchAccount will update the flag to the correct value.
         */
        await apiService.patch(`/feature-flags/${flagName}/`, {value}, {apiVersion: "web"});
        return {flagName, value};
    }
);

export const updateAccountCompany = createAsyncThunk(
    "dashdoc/account/updateCompany",
    async ({companyId, path}: {companyId: number; path: string}) => {
        await apiService.post("/managers/set-company/", {
            company: companyId,
        });
        return {path};
    }
);

export const updateGroupViewSettings = createAsyncThunk(
    "dashdoc/account/updateGroupViewSettings",
    async ({groupViewId, settings}: {groupViewId: number; settings: GroupView["settings"]}) => {
        await apiService.patch(`/group-views/${groupViewId}/settings/`, settings, {
            apiVersion: "web",
        });
        return {groupViewId, settings};
    }
);

export const fetchAccountTriggers = createAsyncThunk(
    "dashdoc/account/fetchAccountTriggers",
    async () => {
        const response = await webApi.fetchAccountTriggers({});
        return response;
    }
);

export const loadAccount = createAsyncThunk(
    "dashdoc/account/load",
    async (_, {getState, dispatch}) => {
        const state = getState() as {account: Account};
        if (state.account.loading) {
            return; // Already loading
        }
        if (state.account.fetched) {
            return; // Already loaded
        }
        await dispatch(fetchAccount({silently: false}));
        return;
    }
);

/**
 * This function will NOT be removed.
 * It's just a reminder to use loadAccount instead of fetchAccount excepted if you know what you are doing.
 *
 * @deprecated In 99% of usecases, you don't need fetchAccount, you must use loadAccount who protect the isLoading/isFetching state.
 * Indeed, we fetch several endpoints and we need to avoid multiple fetches at the same time.
 * silently is used to avoid loading UX during the fetching (avoid UX unmount/mount)
 */
export const fetchAccount = createAsyncThunk(
    "dashdoc/account/fetch",
    async ({silently}: {silently: boolean}, {rejectWithValue}) => {
        const managerPromise = apiService
                .get(`/managers/me/`)
                .then((response) => normalize(response, managerSchema)),
            companiesPromise = apiService.get("/managers/companies/"),
            groupViewsPromise = apiService.get("/managers/groupviews/"),
            featureFlagsPromise = apiService.get("/feature-flags/", {apiVersion: "web"}),
            oldSubscriptionPromise = apiService.get("/billing/"),
            subscriptionPromise = apiService.get("/subscription/"),
            extensionTriggersPromise = webApi.fetchAccountTriggers({});

        try {
            const [manager, companies, groupViews, featureFlags, subscription] = await Promise.all(
                [
                    managerPromise,
                    companiesPromise,
                    groupViewsPromise,
                    featureFlagsPromise,
                    subscriptionPromise,
                ]
            );
            let oldSubscription = null;
            try {
                oldSubscription = await oldSubscriptionPromise;
            } catch (e) {
                if (e?.non_field_errors?.code === "permission_denied") {
                    // No subscription without manager admin rights !
                } else {
                    Logger.error("Error while fetching subscription", e);
                }
            }
            let extensionTriggersPromiseResult = null;
            try {
                extensionTriggersPromiseResult = await extensionTriggersPromise;
            } catch (e) {
                if (e?.non_field_errors?.code === "permission_denied") {
                    // No triggers without manager admin rights !
                } else {
                    Logger.error("Error while fetching extension triggers", e);
                }
            }
            return {
                silently,
                manager,
                companies,
                groupViews,
                featureFlags,
                oldSubscription,
                subscription,
                extensionTriggers: extensionTriggersPromiseResult
                    ? extensionTriggersPromiseResult.triggers
                    : [],
            };
        } catch (e) {
            return rejectWithValue(e);
        }
    }
);

export const requestPlanUpgrade = createAsyncThunk(
    "dashdoc/account/requestPlanUpgrade",
    async () => {
        await apiService.post("/subscription/request-plan-upgrade/", {
            usage_category: "transport_subcontracted",
        });
    }
);

export const fetchUsages = createAsyncThunk("dashdoc/account/fetchUsages", async () => {
    const response: UsagePayload = await apiService.get("/subscription/usage/");
    return response;
});

export const updateCompanySettings = createAsyncThunk(
    "dashdoc/account/updateCompanySettings",
    async (
        {companyId, settings}: {companyId: number; settings: UpdatableSettings},
        {rejectWithValue}
    ) => {
        try {
            await apiService.post(`/companies/${companyId}/update-settings/`, settings);
            return {companyId, settings};
        } catch (error) {
            const errorMessage = await getErrorMessageFromServerError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

// Reducer
// -------

export type Account = {
    fetched: boolean;
    managerId: number | null;
    manager: ManagerMe | null;
    companyId: number | null;
    company: Company | null;
    /**
     * Only admin or group admin can have a subscription.
     * @see CompanyBillingViewSet
     */
    subscription: Subscription | null;
    plan: string;
    entitlements: SubscriptionEntitlement[];
    usages: Usage[];
    companies: ManagerCompany[];
    groupViews: GroupView[];
    featureFlags: Record<string, boolean>;
    requestPlanUpgrade: boolean;
    extensionTriggers: ApiModels.ExtensionTriggers.AccountTriggersResponse["triggers"];
    loading: boolean;
};
const initialState: Account = {
    fetched: false,
    managerId: null,
    manager: null,
    companyId: null,
    company: null,
    subscription: null,
    plan: "",
    entitlements: [],
    usages: [],
    companies: [],
    groupViews: [],
    featureFlags: {},
    requestPlanUpgrade: false,
    extensionTriggers: [],
    loading: false,
};

const managerPayloadSchema = z.object({
    entities: z.object({
        companies: z.record(
            z.object({
                pk: z.number(),
            })
        ),
        managers: z.record(
            z.object({
                pk: z.number(),
                current_company: z.number(),
            })
        ),
    }),
    result: z.number(),
});

export const accountReducer = createReducer<Account>(initialState, (builder) => {
    builder.addCase(fetchAccount.pending, (state, action) => {
        if (action.meta.arg.silently) {
            // nothing
        } else {
            state.loading = true;
        }
    });
    builder.addCase(fetchAccount.fulfilled, (state, action) => {
        const {
            manager: managerResult,
            companies,
            groupViews,
            featureFlags,
            oldSubscription,
            subscription,
            extensionTriggers,
        } = action.payload;

        const {entities, result} = managerPayloadSchema.parse(managerResult);

        state.managerId = result;
        state.manager = (managerResult as any).entities.managers[
            result
        ] as ManagerMe; /* act of faith 🙏 */

        state.companyId = entities.managers[result].current_company;
        state.company = (managerResult as any).entities.companies[
            state.companyId
        ] as Company; /* act of faith 🙏 */

        if (subscription) {
            state.plan = subscription.plan;
            state.entitlements = subscription.entitlements;
        }

        state.groupViews = groupViews;
        state.companies = companies;
        state.featureFlags = featureFlags;
        state.subscription = oldSubscription;
        state.extensionTriggers = extensionTriggers;
        state.fetched = true;
        state.loading = false;
    });

    const updateManagerPayloadSchema = z.object({
        response: managerPayloadSchema,
        type: z.string(),
    });

    builder.addCase(updateGroupViewSettings.fulfilled, (state, action) => {
        const {groupViewId, settings} = action.payload;
        const index = state.groupViews.findIndex((groupView) => groupView.pk === groupViewId);
        if (index >= 0) {
            state.groupViews[index].settings = {...state.groupViews[index].settings, ...settings};
        }
        toast.success(t("common.updateSaved"));
    });
    builder.addCase(updateGroupViewSettings.rejected, () => {
        toast.error(t("common.error"));
    });

    builder.addCase("UPDATE_MANAGER_SUCCESS", (state, action) => {
        // keep in sync the manager/current company
        try {
            const {
                response: {result},
            } = updateManagerPayloadSchema.parse(action);
            if (state.managerId === result) {
                state.manager = {
                    ...state.manager,
                    ...((action as any).response.entities.managers[
                        result
                    ] as ManagerMe) /* act of faith 🙏 */,
                };

                state.company = {
                    ...state.company,
                    ...((action as any).response.entities.companies[
                        state.companyId as number
                    ] as Company) /* act of faith 🙏 */,
                };
            }
        } catch (e) {
            Logger.error("Error while updating manager", e);
        }
    });

    const updateEntitiesSchema = z.object({
        response: z.object({
            entities: z.object({
                companies: z
                    .record(
                        z.object({
                            pk: z.number(),
                        })
                    )
                    .optional(),
                managers: z
                    .record(
                        z.object({
                            pk: z.number(),
                            current_company: z.number(),
                        })
                    )
                    .optional(),
            }),
            result: z.union([z.string(), z.number()]),
        }),
        type: z.string(),
    });

    builder.addCase("UPDATE_ENTITIES_SUCCESS", (state, action) => {
        // keep in sync the manager/current company
        try {
            const {
                response: {result, entities},
            } = updateEntitiesSchema.parse(action);
            if (state.managerId === result) {
                const manager = (action as any).response.entities.managers[
                    state.managerId
                ] as ManagerMe; /* act of faith 🙏 */
                state.manager = {...state.manager, ...manager};
            }

            const companyId = state.companyId;
            if (
                companyId !== null &&
                (companyId === result || (entities.companies && entities.companies[companyId]))
            ) {
                const company = (action as any).response.entities.companies[
                    companyId
                ] as Company; /* act of faith 🙏 */
                state.company = {...state.company, ...company};
            }
        } catch (e) {
            Logger.error("Error while updating entities", e);
        }
    });

    const updateCompanySettingsSchema = z.object({
        companyId: z.number(),
        // Keep in sync with UpdatableSettings
        settings: z.object({
            optimization_settings: z
                .object({
                    default_vehicle_capacity_in_lm: z.number().optional(),
                })
                .optional(),
            geofencing_tracking: z.boolean().optional(),
            invoice_payment: z.boolean().optional(),
            transport_order_observations: z.string().optional(),
            contract_html: z.string().optional(),
        }),
    });
    builder.addCase(updateCompanySettings.fulfilled, (state, action) => {
        try {
            const {companyId, settings}: {companyId: number; settings: UpdatableSettings} =
                updateCompanySettingsSchema.parse(action.payload); // we need to cast settings because zod optional authorizes undefined values
            if (state.companyId === companyId && state.company?.settings) {
                deepMerge(state.company.settings, settings);
                toast.success(t("common.updateSaved"));
            }
        } catch (e) {
            Logger.error("Error while updating settings", e);
        }
    });

    builder.addCase(updateCompanySettings.rejected, (_, action) => {
        const errorMessage = action.payload as string;
        toast.error(errorMessage);
    });

    const updateQualimatSchema = z.object({
        companyPk: z.number(),
        enforceQualimatStandard: z.boolean(),
        // Keep in sync with IDTFCertification type
        idtfCertification: z.enum([
            "",
            "aic",
            "efisc_gtp",
            "gmp",
            "ovocom",
            "pastus",
            "qs",
            "qualimat",
            "other",
        ]),
        qualimatCertificateNumber: z.string(),
        certificationName: z.string(),
    });
    builder.addCase("UPDATE_QUALIMAT_SUCCESS", (state, action) => {
        try {
            const {
                companyPk,
                qualimatCertificateNumber,
                enforceQualimatStandard,
                idtfCertification,
                certificationName,
            } = updateQualimatSchema.parse(action);
            if (state.companyId === companyPk && state.company !== null) {
                if (state.company.settings) {
                    state.company.settings.enforce_qualimat_standard = enforceQualimatStandard;
                    state.company.settings.idtf_certification = idtfCertification;
                    state.company.settings.qualimat_certificate_number = qualimatCertificateNumber;
                    state.company.settings.certification_name = certificationName;
                }
            }
        } catch (e) {
            Logger.error("Error while updating qualimat", e);
        }
    });

    builder.addCase(fetchAccount.rejected, (state) => {
        return {...state, fetched: false, loading: false};
    });

    builder.addCase(updateAccountFeatureFlag.fulfilled, (state, action) => {
        const {flagName, value} = action.payload;
        if (!state.featureFlags[flagName]) {
            const message = `Updating an unknown feature flag ${flagName}`;
            Logger.error(message);
            Sentry.captureMessage(message);
        }
        state.featureFlags[flagName] = value;
    });

    builder.addCase(updateAccountCompany.fulfilled, (_, action) => {
        const {path} = action.payload;
        /**
         * TODO: we should not reload the page, but instead update the store and the router.
         * The easy way: trigger a fetchAccount after a successful updateAccountCompany.
         * We leave it like this to avoid to many changes in this PR.
         */
        window.location.pathname = path;
    });

    builder.addCase(updateAccountCompany.rejected, () => {
        toast.error(t("sidebar.companySwitchError"));
    });

    builder.addCase(fetchUsages.fulfilled, (state, action) => {
        state.usages = action.payload.usages;
    });

    builder.addCase(requestPlanUpgrade.fulfilled, (state) => {
        state.requestPlanUpgrade = true;
    });

    builder.addCase("REQUEST_CURRENT_SUBSCRIPTION_SUCCESS", (state, action: any) => {
        state.subscription = action.subscription;
    });

    builder.addCase(fetchAccountTriggers.fulfilled, (state, action) => {
        state.extensionTriggers = action.payload.triggers;
    });
});
