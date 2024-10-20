import {
    hasRoleAdmin,
    hasRoleUser,
    NotFoundScreen,
    RouteFeatureFlag,
    SettingsPassword,
    SettingsPersonalInfo,
    useFeatureFlag,
} from "@dashdoc/web-common";
import React, {useMemo} from "react";
import {RouteComponentProps} from "react-router";
import {Route, Switch} from "react-router-dom";

import {CompanySettingsScheduler} from "app/features/scheduler/settings/CompanySettingsScheduler";
import SettingsCompany from "app/features/settings/settings-company";
import {SettingsContract} from "app/features/settings/settings-contract";
import {SettingsExtensions, Tab} from "app/features/settings/settings-extensions";
import SettingsFeatures from "app/features/settings/settings-features";
import SettingsInvoiceTemplate from "app/features/settings/settings-invoice-template";
import SettingsSupportTypes from "app/features/settings/settings-support-types";
import {SettingsTransportOrderObservations} from "app/features/settings/settings-transport-order-observations";
import SettingsBilling from "app/features/settings/SettingsBilling";
import {SettingsCarbonFootprint} from "app/features/settings/SettingsCarbonFootprint";
import {SettingsOptimization} from "app/features/settings/SettingsOptimization";
import SettingsTeam from "app/features/settings/SettingsTeam";
import SettingsTags from "app/features/settings/tags/SettingsTags";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {AccountingSettingsScreen} from "app/taxation/invoicing/screens/AccountingSettingsScreen";
import {InvoiceItemCatalogScreen} from "app/taxation/invoicing/screens/InvoiceItemCatalogScreen";
import {InvoiceSettingsScreen} from "app/taxation/invoicing/screens/InvoiceSettingsScreen";

import {ExtensionDataSource} from "../../features/settings/api/types";

const RoleApi = hasRoleAdmin(() => <SettingsExtensions selectedTab={Tab.Api} />);
const RoleInvoicingPicker = hasRoleAdmin(() => <SettingsExtensions selectedTab={Tab.Invoicing} />);
const RoleInvoicing = hasRoleAdmin(
    ({match}: Partial<RouteComponentProps<{dataSource: string}>>) => {
        const dataSource = useMemo(() => match?.params?.dataSource, [match?.params?.dataSource]);
        return (
            <SettingsExtensions
                selectedTab={Tab.Invoicing}
                dataSource={dataSource as ExtensionDataSource}
            />
        );
    }
);
const RoleTelematic = hasRoleAdmin(() => <SettingsExtensions selectedTab={Tab.Telematic} />);
const RoleExternalTmsPicker = hasRoleAdmin(() => (
    <SettingsExtensions selectedTab={Tab.ExternalTms} />
));
const RoleExternalTms = hasRoleAdmin(
    ({match}: Partial<RouteComponentProps<{dataSource: string}>>) => {
        const dataSource = useMemo(() => match?.params?.dataSource, [match?.params?.dataSource]);
        return (
            <SettingsExtensions
                selectedTab={Tab.ExternalTms}
                dataSource={dataSource as ExtensionDataSource}
            />
        );
    }
);
const RoleTrackdechets = hasRoleAdmin(() => <SettingsExtensions selectedTab={Tab.Trackdechets} />);
const RoleAbsenceManagerPicker = hasRoleAdmin(() => (
    <SettingsExtensions selectedTab={Tab.AbsenceManager} />
));
const RoleAbsenceManager = hasRoleAdmin(
    ({match}: Partial<RouteComponentProps<{dataSource: string}>>) => {
        const dataSource = useMemo(() => match?.params?.dataSource, [match?.params?.dataSource]);
        return (
            <SettingsExtensions
                selectedTab={Tab.AbsenceManager}
                dataSource={dataSource as ExtensionDataSource}
            />
        );
    }
);
const RoleBilling = hasRoleAdmin(() => <SettingsBilling />);
const RoleTeam = hasRoleAdmin(() => <SettingsTeam />);

const RoleScheduler = hasRoleAdmin(() => <CompanySettingsScheduler />);
const RoleSupports = hasRoleUser(() => <SettingsSupportTypes />);
const RoleTags = hasRoleUser(() => <SettingsTags />);
const RoleOptimization = hasRoleUser(() => <SettingsOptimization />);

const RoleInvoiceTemplate = hasRoleUser(() => <SettingsInvoiceTemplate />);
const RoleInvoiceItemCatalog = hasRoleUser(() => <InvoiceItemCatalogScreen />);
const RoleAccountingSettings = hasRoleUser(() => <AccountingSettingsScreen />);
const RoleInvoiceSettings = hasRoleUser(() => <InvoiceSettingsScreen />);
const RoleCompany = hasRoleAdmin(() => <SettingsCompany />);
const RoleFeatures = hasRoleAdmin(() => <SettingsFeatures />);
const RoleContract = hasRoleAdmin(() => <SettingsContract />);
const RoleTransportOrderObservations = hasRoleAdmin(() => <SettingsTransportOrderObservations />);
const RoleCarbonFootprint = hasRoleAdmin(() => <SettingsCarbonFootprint />);
const RoleCustomExtensionsPicker = hasRoleAdmin(() => (
    <SettingsExtensions selectedTab={Tab.Custom} />
));
const RoleCustomExtension = hasRoleAdmin(
    ({match}: Partial<RouteComponentProps<{extensionUid: string}>>) => {
        const extensionUid = useMemo(
            () => match?.params?.extensionUid,
            [match?.params?.extensionUid]
        );
        return <SettingsExtensions selectedTab={Tab.Custom} extensionUid={extensionUid} />;
    }
);

export function SettingsSwitch() {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    return (
        <Switch>
            <Route path="/app/account/infos" component={SettingsPersonalInfo} />
            <Route path="/app/account/password" component={SettingsPassword} />
            <Route path="/app/settings/features" component={SettingsFeatures} />
            <Route path="/app/settings/api" component={RoleApi} />
            <Route path="/app/settings/invoicing/:dataSource" component={RoleInvoicing} />
            <Route path="/app/settings/invoicing/" component={RoleInvoicingPicker} />
            <Route path="/app/settings/telematic" component={RoleTelematic} />
            <Route path="/app/settings/external-tms/:dataSource" component={RoleExternalTms} />
            <Route path="/app/settings/external-tms/" component={RoleExternalTmsPicker} />
            <Route path="/app/settings/trackdechets" component={RoleTrackdechets} />
            <Route
                path="/app/settings/absence-manager/:dataSource"
                component={RoleAbsenceManager}
            />
            <Route path="/app/settings/absence-manager/" component={RoleAbsenceManagerPicker} />
            <RouteFeatureFlag
                flagName="edi-template-connector"
                path="/app/settings/custom-extensions/:extensionUid"
                component={RoleCustomExtension}
            />
            <RouteFeatureFlag
                flagName="edi-template-connector"
                path="/app/settings/custom-extensions/"
                component={RoleCustomExtensionsPicker}
            />
            <Route path="/app/settings/billing" component={RoleBilling} />
            <Route path="/app/settings/team" component={RoleTeam} />
            <Route path="/app/settings/company" component={RoleCompany} />
            <Route path="/app/settings/features" component={RoleFeatures} />
            <Route path="/app/settings/contract" component={RoleContract} />
            <Route
                path="/app/settings/transport-order-observations"
                component={RoleTransportOrderObservations}
            />
            <Route path="/app/settings/support-types" component={RoleSupports} />
            <RouteFeatureFlag
                flagName="carbonfootprintiso"
                path="/app/settings/carbon-footprint"
                component={RoleCarbonFootprint}
            />
            <Route path="/app/settings/tags" component={RoleTags} />
            <Route path="/app/settings/scheduler" component={RoleScheduler} />
            <RouteFeatureFlag
                flagName="tripOptimization"
                path="/app/settings/optimization"
                component={RoleOptimization}
            />
            {hasInvoiceEntityEnabled && (
                <Route path="/app/settings/invoice-template" component={RoleInvoiceTemplate} />
            )}
            {hasDashdocInvoicingEnabled && (
                <Route
                    path="/app/settings/invoice-item-catalog"
                    component={RoleInvoiceItemCatalog}
                />
            )}
            {hasDashdocInvoicingEnabled && (
                <Route
                    path="/app/settings/accounting-settings"
                    component={RoleAccountingSettings}
                />
            )}
            {hasDashdocInvoicingEnabled && (
                <Route path="/app/settings/invoice-settings" component={RoleInvoiceSettings} />
            )}
            <Route component={NotFoundScreen} />
        </Switch>
    );
}
