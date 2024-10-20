import {HasFeatureFlag, useFeatureFlag} from "@dashdoc/web-common";
import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {TabTitle, Box, Flex} from "@dashdoc/web-ui";
import React from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";

import {getTabTranslations} from "app/common/tabs";
import {AsyncExtensionsDetails} from "app/features/settings/api/AsyncExtensionsDetails";
import {AsyncExtensionsPicker} from "app/features/settings/api/AsyncExtensionsPicker";
import {ExtensionsPicker} from "app/features/settings/api/ExtensionsPicker";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {SidebarTabNames} from "app/types/constants";

import {ExtensionDetails} from "./api/ExtensionDetails";
import {SettingsApi} from "./api/settings-api";
import {ExtensionDataSource} from "./api/types";
import SettingsTrackdechets from "./settings-trackdechets";
import {TelematicSetting} from "./telematic/TelematicSetting";

export enum Tab {
    Api = "api",
    Invoicing = "invoicing",
    Telematic = "telematic",
    Trackdechets = "trackdechets",
    ExternalTms = "external-tms",
    AbsenceManager = "absence-manager",
    Custom = "custom",
}

type Props = {
    selectedTab: Tab;
    dataSource?: ExtensionDataSource;
    extensionUid?: string;
};
export const SettingsExtensions = ({selectedTab, extensionUid, dataSource}: Props) => {
    const company = useSelector(getConnectedCompany);
    const hasTrackdechetsEnabled = company?.settings?.trackdechets;
    // Check company account isn't an invited account
    const fullEnableTrackdechets = hasTrackdechetsEnabled && company?.account_type !== "invited";
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    const renderSelectedTab = () => {
        switch (selectedTab) {
            case Tab.Api:
                return <SettingsApi />;
            case Tab.Invoicing:
                if (dataSource) {
                    return (
                        <ExtensionDetails dataSource={dataSource} connectorCategory="invoicing" />
                    );
                } else {
                    return <ExtensionsPicker connectorCategory="invoicing" />;
                }
            case Tab.Telematic:
                return <TelematicSetting />;
            case Tab.Trackdechets:
                return <SettingsTrackdechets />;
            case Tab.ExternalTms:
                if (dataSource) {
                    return (
                        <ExtensionDetails
                            dataSource={dataSource}
                            connectorCategory="external_tms"
                        />
                    );
                } else {
                    return <ExtensionsPicker connectorCategory="external_tms" />;
                }
            case Tab.AbsenceManager:
                if (dataSource) {
                    return (
                        <ExtensionDetails
                            dataSource={dataSource}
                            connectorCategory="absence_manager"
                        />
                    );
                } else {
                    return <ExtensionsPicker connectorCategory="absence_manager" />;
                }
            case Tab.Custom:
                if (extensionUid) {
                    return (
                        <AsyncExtensionsDetails
                            connectorCategory="custom"
                            extensionUid={extensionUid}
                        />
                    );
                } else {
                    return <AsyncExtensionsPicker connectorCategory="custom" />;
                }
            default:
                return <></>;
        }
    };

    return (
        <Flex height="100%" flex={1} flexDirection="column">
            <Box>
                <Box mb={3}>
                    <TabTitle title={getTabTranslations(SidebarTabNames.EXTENSIONS)} />
                </Box>
                <ul className="nav nav-tabs">
                    <li role="presentation" className={selectedTab === Tab.Api ? "active" : ""}>
                        <Link to={`/app/settings/api`}>{t("settings.api")}</Link>
                    </li>
                    {hasInvoiceEntityEnabled && !hasDashdocInvoicingEnabled && (
                        <li
                            role="presentation"
                            className={selectedTab === Tab.Invoicing ? "active" : ""}
                        >
                            <Link
                                to={`/app/settings/invoicing/`}
                                data-testid="settings-extensions-invoicing-tab"
                            >
                                {t("settings.invoicing")}
                            </Link>
                        </li>
                    )}
                    <li
                        role="presentation"
                        className={selectedTab === Tab.Telematic ? "active" : ""}
                    >
                        <Link to="/app/settings/telematic/" data-testid="settings-telematic-tab">
                            {t("settings.telematics")}
                        </Link>
                    </li>
                    <li
                        role="presentation"
                        className={selectedTab === Tab.ExternalTms ? "active" : ""}
                    >
                        <Link
                            to="/app/settings/external-tms/"
                            data-testid="settings-external-tms-tab"
                        >
                            {t("settings.external_tms")}
                        </Link>
                    </li>
                    {fullEnableTrackdechets && (
                        <li
                            role="presentation"
                            className={selectedTab === Tab.Trackdechets ? "active" : ""}
                        >
                            <Link
                                to="/app/settings/trackdechets/"
                                data-testid="settings-trackdechets-tab"
                            >
                                {t("settings.trackdechets")}
                            </Link>
                        </li>
                    )}
                    <li
                        role="presentation"
                        className={selectedTab === Tab.AbsenceManager ? "active" : ""}
                    >
                        <Link
                            to="/app/settings/absence-manager/"
                            data-testid="settings-absence-manager-tab"
                        >
                            {t("settings.absenceManager")}
                        </Link>
                    </li>
                    <HasFeatureFlag flagName="edi-template-connector">
                        <li
                            role="presentation"
                            className={selectedTab === Tab.Custom ? "active" : ""}
                        >
                            <Link
                                to="/app/settings/custom-extensions/"
                                data-testid="settings-custom-extensions-tab"
                            >
                                {t("settings.customExtensions")}
                            </Link>
                        </li>
                    </HasFeatureFlag>
                </ul>
            </Box>
            <Flex flexDirection="column">{renderSelectedTab()}</Flex>
        </Flex>
    );
};
