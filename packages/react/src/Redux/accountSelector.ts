import {Logger} from "@dashdoc/web-core";
import {BROWSER_TIMEZONE} from "@dashdoc/web-core";
import {
    FeatureFlags,
    Manager,
    DEFAULT_SUBCONTRACT_USAGE,
    Usage,
    UsageCategory,
    ManagerRole,
    Settings,
} from "dashdoc-utils";
import {companyGetTimezone} from "dashdoc-utils";

import {ApiModels} from "../../dashdocOLD/common/src/index";
import {ManagerCompany} from "../types/types";

import {CommonRootState} from "./types";
import {createSelector} from "./utils";

const getManager = ({account}: CommonRootState) => account.manager;
const getCompany = ({account}: CommonRootState) => account.company;
const getAccountSubscription = ({account}: CommonRootState) => account.subscription;

export const getConnectedManagerId = ({account: {managerId}}: CommonRootState) => managerId;

export const getConnectedManager = createSelector(getManager, (manager): Manager | null => {
    return manager;
});

const getUsage = createSelector(
    [
        ({account: {usages}}: CommonRootState) => usages,
        (_state, category: UsageCategory) => category,
    ],
    (usages: Usage[], category) => {
        const usage: Usage | undefined = usages.find(
            (usage: Usage) => usage.category === category
        );
        return usage ?? null;
    }
);

export const getTruckersUsage = createSelector(
    (state: CommonRootState) => getUsage(state, "mobile_app_used"),
    (usage) => usage
);

export const getManagersUsage = createSelector(
    (state: CommonRootState) => getUsage(state, "web_app_used"),
    (usage) => usage
);

export const getSubcontractUsage = createSelector(
    (state: CommonRootState) => getUsage(state, "transport_subcontracted"),
    (usage) => {
        if (usage) {
            return usage;
        }
        return DEFAULT_SUBCONTRACT_USAGE;
    }
);

export const getConnectedGroupViews = ({account: {groupViews}}: CommonRootState) => groupViews;

export const getEntitlements = ({account: {entitlements}}: CommonRootState) => entitlements;

export const getFeatureFlag = createSelector(
    [
        ({account: {loading, featureFlags, companyId}}: CommonRootState) => ({
            loading,
            loaded: companyId !== null,
            featureFlags,
        }),
        (_state, flagName: FeatureFlags) => flagName,
    ],
    ({loading, loaded, featureFlags}, flagName) => {
        if (loading || !loaded) {
            // waiting for a loaded state to be able to respond
            return false;
        }
        const flag = featureFlags[flagName];
        if (flag === undefined) {
            const message = `Unknown feature flag ${flagName}`;
            Logger.warn(message);
        }
        // we default to true to be able to remove feature flags and enable by default
        return flag ?? true;
    }
);

export const getConnectedCompanyId = ({account: {companyId}}: CommonRootState) => companyId;

export const getConnectedCompany = createSelector(getCompany, (company) => {
    if (company) {
        return company;
    }
    return null;
});

export const getGroupViewSettings = createSelector(
    getConnectedCompany,
    getConnectedGroupViews,
    (company, groupViews) => {
        return (
            groupViews.find((groupView) => groupView.pk === company?.group_view_id)?.settings ??
            null
        );
    }
);

export const getGroupView = createSelector(
    getConnectedCompany,
    getConnectedGroupViews,
    (company, groupViews) => {
        return groupViews.find((groupView) => groupView.pk === company?.group_view_id) ?? null;
    }
);
export const getIsTheOnlyCompanyInGroupView = createSelector(
    getConnectedCompany,
    getConnectedGroupViews,
    (company, groupViews) => {
        return (
            groupViews.find((groupView) => groupView.pk === company?.group_view_id)?.companies
                .length === 1
        );
    }
);

export const getSubscription = createSelector(getAccountSubscription, (subscription) => {
    if (subscription) {
        return subscription;
    }
    return null;
});

/**
 * company timezone > browser timezone > default timezone Europe/Paris
 * */
export const getTimezone = createSelector(getConnectedCompany, (company) =>
    company ? companyGetTimezone(company) : BROWSER_TIMEZONE
);

export const getConnectedCompanies = ({
    account: {companies},
}: {
    account: {companies: ManagerCompany[]};
}) => companies;

export const getConnectedCompaniesWithAccess = createSelector(
    ({account}: CommonRootState) => account.companies,
    (companies) => {
        const filteredCompanies = companies.filter(
            (company) => company.role !== ManagerRole.NoTmsAccess
        );
        return filteredCompanies;
    }
);

export const getCompanySetting = createSelector(
    [getConnectedCompany, (_state, settingName: keyof Settings) => settingName],
    (company, settingName) => {
        return company?.settings?.[settingName] ?? null;
    }
);

export const getExtensionsWithTrigger = createSelector(
    [
        ({account: {extensionTriggers}}: CommonRootState) => extensionTriggers,
        (
            _state,
            triggerName: ApiModels.ExtensionTriggers.AccountTriggersResponse["triggers"][0]["trigger"]
        ) => triggerName,
    ],
    (extensionTriggers, triggerName) => {
        return extensionTriggers
            .filter((trigger) => trigger.trigger === triggerName)
            .map((trigger) => trigger.extension);
    }
);
