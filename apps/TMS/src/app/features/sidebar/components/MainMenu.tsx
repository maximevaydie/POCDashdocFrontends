import {
    NavbarLink,
    getConnectedCompany,
    getConnectedManager,
    managerService,
    useBaseUrl,
    useFeatureFlag,
    useIsGroupView,
} from "@dashdoc/web-common";
import React, {useContext, useMemo} from "react";
import {useHistory} from "react-router-dom";

import {CollapsedContext} from "app/features/sidebar/CollapsedContext";
import {useSelector} from "app/redux/hooks";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

import {linkService} from "../link.service";
import {SidebarLink} from "../types";

type Props = {isOpen: boolean; onClose: () => void};
export function MainMenu({isOpen, onClose}: Props) {
    const baseUrl = useBaseUrl();
    const history = useHistory();
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);
    const isGroupView = useIsGroupView();

    const {collapsed} = useContext(CollapsedContext);
    const counts = useSelector((state) => state.counts);
    const {transports: transportsCounts, orders: ordersCounts} = counts;
    const hasTracking = !!connectedCompany?.settings?.has_tracking;
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasBetaReportsEnabled = useFeatureFlag("betaReports");
    const hasFuelSurchargesAndTariffGridsManagementEnabled = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );
    const hasTransportsReportScreenEnabled = useFeatureFlag("transportsReportScreen");

    const isAtLeastUser = managerService.hasAtLeastReadOnlyRole(connectedManager);
    const canDisplayFuelSurchargesAndTariffGrids =
        hasFuelSurchargesAndTariffGridsManagementEnabled &&
        connectedCompany?.account_type !== "invited";
    const canDisplayReportsTab =
        hasTransportsReportScreenEnabled &&
        isAtLeastUser &&
        // TODO: remove when adding accountType attribute to ConfigCat feature flag request or Chargebee entitlement
        connectedCompany?.account_type !== "invited";
    const links = useMemo((): SidebarLink[] => {
        return linkService.getLinks(
            baseUrl,
            isGroupView,
            canDisplayFuelSurchargesAndTariffGrids,
            canDisplayReportsTab,
            hasTracking,
            ordersCounts,
            transportsCounts,
            {
                hasInvoiceEntityEnabled,
                hasDashdocInvoicingEnabled,
                hasBetaReportsEnabled,
            }
        );
    }, [
        canDisplayFuelSurchargesAndTariffGrids,
        hasInvoiceEntityEnabled,
        hasDashdocInvoicingEnabled,
        isGroupView,
        baseUrl,
        canDisplayReportsTab,
        transportsCounts,
        ordersCounts,
        hasTracking,
        hasBetaReportsEnabled,
    ]);

    return (
        <>
            {links.map((link) => (
                <NavbarLink
                    key={link.label}
                    {...link}
                    handleLinkClick={handleLinkClick}
                    openedSidebar={isOpen}
                    closeSidebar={onClose}
                    collapsedSidebar={collapsed}
                />
            ))}
        </>
    );

    function handleLinkClick(event: React.MouseEvent, link: string, query: any) {
        handleClick(event, link, query);
    }

    function handleClick(event: React.MouseEvent, link: string, query: any) {
        event.preventDefault();
        history.push({
            pathname: link,
            search: query ? `?${$.param(query)}` : undefined,
        });
    }
}
