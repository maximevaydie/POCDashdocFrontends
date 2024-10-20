import {HasFeatureFlag, SidebarLink} from "@dashdoc/web-common";
import {useFeatureFlag} from "@dashdoc/web-common";
import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {PaneButtonGroup} from "@dashdoc/web-ui";
import React from "react";
import {connect} from "react-redux";

import {RootState} from "app/redux/reducers/index";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

type OwnProps = {
    onLinkClick: (path: string) => void;
};

type StateProps = {
    isCarrier: boolean;
    isAdmin: boolean;
};

type SettingsSidebarProps = OwnProps & StateProps;

const SettingsSidebar = (originalProps: SettingsSidebarProps) => {
    const {isCarrier, isAdmin, onLinkClick} = originalProps;

    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    return (
        <div>
            {isAdmin && (
                <>
                    <PaneButtonGroup title={t("common.company")}>
                        <SidebarLink
                            id="settings-company"
                            onLinkClick={onLinkClick}
                            icon="account"
                            path="company"
                            label={t("common.company")}
                        />
                        <SidebarLink
                            id="settings-team"
                            onLinkClick={onLinkClick}
                            icon="contacts"
                            path="team"
                            label={t("settings.team")}
                        />
                        <SidebarLink
                            id="settings-billing"
                            onLinkClick={onLinkClick}
                            icon="billing"
                            path="billing"
                            label={t("settings.payment")}
                        />
                    </PaneButtonGroup>

                    <PaneButtonGroup title={t("common.general")}>
                        <SidebarLink
                            id="scheduler"
                            onLinkClick={onLinkClick}
                            icon="calendar"
                            path="scheduler"
                            data-testid="scheduler-link"
                            label={t("sidebar.scheduler")}
                        />
                        <SidebarLink
                            id="setting-tags"
                            onLinkClick={onLinkClick}
                            icon="edit"
                            path="tags"
                            data-testid="tags-link"
                            label={t("common.tags")}
                        />
                        <SidebarLink
                            id="settings-support-types"
                            onLinkClick={onLinkClick}
                            icon="loading"
                            path="support-types"
                            label={t("settings.supportTypes")}
                        />
                        <HasFeatureFlag flagName="carbonfootprintiso">
                            <SidebarLink
                                id="settings-carbon-footprint"
                                data-testid="carbon-footprint-settings-link"
                                onLinkClick={onLinkClick}
                                icon="ecologyLeaf"
                                path="carbon-footprint"
                                label={t("carbonFootprint.title")}
                            />
                        </HasFeatureFlag>
                        <HasFeatureFlag flagName="tripOptimization">
                            <SidebarLink
                                id="settings-optimization"
                                data-testid="optimization-settings-link"
                                onLinkClick={onLinkClick}
                                icon="robot"
                                path="optimization"
                                label={t("settings.optimization")}
                            />
                        </HasFeatureFlag>
                    </PaneButtonGroup>

                    {hasInvoiceEntityEnabled && (
                        <PaneButtonGroup title={t("settings.invoicing")}>
                            {hasDashdocInvoicingEnabled && (
                                <SidebarLink
                                    id="settings-invoice"
                                    onLinkClick={onLinkClick}
                                    icon="accountingInvoice"
                                    path="invoice-settings"
                                    data-testid="invoice-settings-link"
                                    label={t("invoiceSettings.title")}
                                />
                            )}
                            {hasDashdocInvoicingEnabled && (
                                <SidebarLink
                                    id="settings-accounting"
                                    onLinkClick={onLinkClick}
                                    icon="export"
                                    path="accounting-settings"
                                    data-testid="accounting-settings-link"
                                    label={t("settings.accountingSettings")}
                                />
                            )}
                            {hasDashdocInvoicingEnabled && (
                                <SidebarLink
                                    id="sewttings-invoice-items-catalog"
                                    onLinkClick={onLinkClick}
                                    icon="list"
                                    path="invoice-item-catalog"
                                    data-testid="invoice-item-catalog-link"
                                    label={t("settings.invoiceItemCatalog")}
                                />
                            )}
                            <SidebarLink
                                id="settings-invoice-template"
                                onLinkClick={onLinkClick}
                                icon="creator"
                                path="invoice-template"
                                data-testid="invoice-description-template-link"
                                label={t("settings.invoiceTemplates")}
                            />
                        </PaneButtonGroup>
                    )}

                    <PaneButtonGroup title={t("settings.documents")}>
                        <SidebarLink
                            id="settings-transport-order-observations"
                            data-testid="settings-transport-order-observations"
                            onLinkClick={onLinkClick}
                            icon="creator"
                            path="transport-order-observations"
                            label={t("settings.charterConfirmation")}
                        />
                        {isCarrier && (
                            <SidebarLink
                                id="settings-contract"
                                data-testid="settings-contract"
                                onLinkClick={onLinkClick}
                                icon="contract"
                                path="contract"
                                label={t("settings.contractCarriage")}
                            />
                        )}
                    </PaneButtonGroup>

                    <PaneButtonGroup title={t("settings.addedFeatures")}>
                        <SidebarLink
                            id="settings-features"
                            onLinkClick={onLinkClick}
                            icon="checkList"
                            path="features"
                            label={t("settings.features")}
                            data-testid="settings-features-link"
                        />
                        <SidebarLink
                            id="settings-api"
                            onLinkClick={onLinkClick}
                            icon="link"
                            path="api"
                            label={t("settings.extensions")}
                            data-testid="settings-extensions-link"
                        />
                    </PaneButtonGroup>
                </>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootState) => {
    const connectedManager = getConnectedManager(state);
    const connectedCompany = getConnectedCompany(state);
    const role = connectedCompany?.settings?.default_role;
    return {
        isCarrier: role && ["carrier", "carrier_and_shipper"].includes(role),
        isAdmin: connectedManager && managerService.hasAtLeastAdminRole(connectedManager),
    };
};

export default connect(mapStateToProps)(SettingsSidebar);
