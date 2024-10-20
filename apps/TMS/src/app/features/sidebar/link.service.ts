import {SidebarChildLink} from "@dashdoc/web-common/src/features/navbar/types";
import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";
import isNil from "lodash.isnil";

import {getTabTranslations} from "app/common/tabs";
import {
    LINK_CONTACTS,
    LINK_LOGISTIC_POINTS,
    LINK_LOGISTIC_POINTS_EXPORTS,
    LINK_PARTNERS,
    LINK_PARTNERS_EXPORTS,
    SIDEBAR_DASHBOARD_QUERY,
    SIDEBAR_REVENUE_REPORTS_QUERY,
} from "app/features/sidebar/constants";
import {
    LINK_ADDRESS_BOOK,
    LINK_ENTITIES,
    LINK_FLEET,
    LINK_REQUESTED_VEHICLES,
    LINK_TRUCKERS_HOMOGENEOUS,
    LINK_USERS,
    SIDEBAR_ADDRESS_BOOK_QUERY,
    SIDEBAR_CONTACTS_QUERY,
    SIDEBAR_CREDIT_NOTES_QUERY,
    SIDEBAR_ENTITIES_QUERY,
    SIDEBAR_FLEET_QUERY,
    SIDEBAR_FUEL_SURCHARGES_QUERY,
    SIDEBAR_INVOICE_QUERY,
    SIDEBAR_INVOICE_REPORTS_QUERY,
    SIDEBAR_SCHEDULER_QUERY,
    SIDEBAR_TARIFFS_QUERY,
    SIDEBAR_TARIFF_GRIDS_QUERY,
    SIDEBAR_TRACKING_QUERY,
    SIDEBAR_USERS_QUERY,
} from "app/features/sidebar/constants";
import {SidebarLink} from "app/features/sidebar/types";
import {
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_CHECKED_TAB,
    ORDERS_DELETED_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    OrderBusinessStatuses,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_DELETED_OR_DECLINED_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TAB,
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
    TransportBusinessStatuses,
} from "app/types/businessStatus";
import {SidebarTabNames} from "app/types/constants";

/**
 * Extract a base link from a link, return undefined if unable to generate a base link
 * @param {string} link
 * @param {string} baseUrl Base url, eg: /app or /app/groupview
 * @returns {string | null}
 *
 * @example
 * From /app/what-ever/some/path/ to /app/what-ever/
 * From /app/groupview/what-ever/some/path to /app/groupview/what-ever/
 */
function extractBaseLink(link: string, baseUrl: string): string | null {
    let baseLink = link.match(new RegExp(`${baseUrl}/[\\w-]+(/)?`))?.[0] || null;
    // Be sure that base link always end with a slash
    if (baseLink && !baseLink.endsWith("/")) {
        baseLink += "/";
    }
    return baseLink;
}

function getLinks(
    baseUrl: string,
    isGroupView: boolean,
    canDisplayFuelSurchargesAndTariffGrids: boolean,
    canDisplayReportsTab: boolean,
    hasTracking: boolean,
    ordersCounts: {[key: string]: number},
    transportsCounts: {[key: string]: number},
    featureflags: {
        hasInvoiceEntityEnabled: boolean;
        hasDashdocInvoicingEnabled: boolean;
        hasBetaReportsEnabled: boolean;
    }
) {
    let links: SidebarLink[] = [];

    if (!isGroupView) {
        links = [
            {
                link: "/app/home/",
                icon: "house",
                label: t("sidebar.home"),
                query: SIDEBAR_DASHBOARD_QUERY[SidebarTabNames.DASHBOARD],
                testId: "navbar-home",
            },
        ];

        // schedulers
        const children: any = [
            {
                query: SIDEBAR_SCHEDULER_QUERY[SidebarTabNames.CARRIER_SCHEDULER],
                label: t("sidebar.transportsScheduler"),
                icon: "",
            },
            {
                query: SIDEBAR_SCHEDULER_QUERY[SidebarTabNames.SITE_SCHEDULER],
                label: t("sidebar.siteScheduler"),
                icon: "",
            },
        ];

        links.splice(1, 0, {
            link: "/app/scheduler/",
            icon: "calendar",
            label: t("sidebar.scheduler"),
            // @ts-ignore
            query: SIDEBAR_SCHEDULER_QUERY[SidebarTabNames.SCHEDULER],
            testId: "navbar-scheduler",
            children,
        });

        let orderSublinks: SidebarChildLink[] = [
            {
                ...OrderBusinessStatuses[ORDERS_TO_ASSIGN_OR_DECLINED_TAB],
                count: ordersCounts.to_assign_or_declined,
                countImportant: true,
                countAlert: !!ordersCounts.to_assign_or_declined_alert,
                label: t("sidebar.ordersToAssign"),
                icon: null,
            },
            {
                ...OrderBusinessStatuses[ORDERS_TO_SEND_TO_CARRIER_TAB],
                count: ordersCounts.to_send_to_carrier,
                countImportant: true,
                label: t("sidebar.ordersToSend"),
                icon: null,
            },
            {
                ...OrderBusinessStatuses[ORDERS_AWAITING_CONFIRMATION_TAB],
                count: ordersCounts.awaiting_carrier_confirmation,
                label: t("sidebar.ordersAwaitingConfirmation"),
                icon: null,
                separatorBelow: true,
            },
            {
                ...OrderBusinessStatuses[ORDERS_ONGOING_TAB],
                count: ordersCounts.ongoing,
                label: t("sidebar.orders.handledByCarriers"),
                icon: null,
            },
            {
                ...OrderBusinessStatuses[ORDERS_DONE_OR_CANCELLED_TAB],
                count: ordersCounts.done_or_cancelled,
                label: t("sidebar.orderDone"),
                icon: null,
                separatorBelow: true,
            },
        ].filter((link) => !isNil(link));

        orderSublinks.push({
            ...OrderBusinessStatuses[ORDERS_CHECKED_TAB],
            count: ordersCounts.checked,
            label: t("sidebar.orders.checked"),
            icon: null,
            separatorBelow: true,
        });

        orderSublinks.push({
            ...OrderBusinessStatuses[ORDERS_DELETED_TAB],
            label: t("sidebar.bin"),
            icon: null,
        });

        links.push({
            icon: "cart",
            ...OrderBusinessStatuses[ORDERS_TAB],
            label: t("sidebar.orders"),
            children: orderSublinks,
            testId: "navbar-orders",
            count: ordersCounts.total_action_needed,
        });

        let transportsSublinks: SidebarChildLink[] = [
            {
                ...TransportBusinessStatuses[TRANSPORTS_TO_APPROVE_TAB],
                count: transportsCounts.to_approve,
                countImportant: true,
                label: t("sidebar.transports.toConfirm"),
                icon: null,
                separatorBelow: true,
            },
            {
                ...TransportBusinessStatuses[TRANSPORTS_TO_PLAN_TAB],
                count: transportsCounts.to_plan,
                countAlert: !!transportsCounts.to_plan_alert,

                countImportant: true,
                label: t("sidebar.toPlan"),
                icon: null,
            },
            {
                ...TransportBusinessStatuses[TRANSPORTS_TO_SEND_TO_TRUCKER_TAB],
                countImportant: true,
                count: transportsCounts.to_send_to_trucker,
                label: t("sidebar.toSendToTrucker"),
                icon: null,
                separatorBelow: true,
            },
            {
                ...TransportBusinessStatuses[TRANSPORTS_ONGOING_TAB],
                count: transportsCounts.ongoing,
                label: t("sidebar.ongoing"),
                icon: null,
            },
            {
                ...TransportBusinessStatuses[TRANSPORTS_DONE_TAB],
                count: transportsCounts.done_or_cancelled,
                label: t("sidebar.done"),
                separatorBelow: true,
                icon: null,
            },
            {
                ...TransportBusinessStatuses[TRANSPORTS_BILLING_TAB],
                count: transportsCounts.billed_or_billable,
                label: t("sidebar.billing"),
                separatorBelow: true,
                icon: null,
            },
            {
                ...TransportBusinessStatuses[TRANSPORTS_DELETED_OR_DECLINED_TAB],
                label: t("sidebar.bin"),
                icon: null,
            },
        ];

        links.push({
            icon: "truck",
            label: t("sidebar.transports"),
            ...TransportBusinessStatuses[TRANSPORTS_TAB],
            testId: "navbar-transports",
            children: transportsSublinks,
            count: transportsCounts.total_action_needed,
        });

        const tariffGridLink: SidebarChildLink = {
            link: "/app/tariff-grids/",
            icon: "tariffGrid" as IconNames,
            label: t("sidebar.myTariffGrids"),
            query: SIDEBAR_TARIFF_GRIDS_QUERY[SidebarTabNames.TARIFF_GRIDS],
            testId: "navbar-tariff-grids",
        };

        const fuelSurchargeLink: SidebarChildLink = {
            link: "/app/fuel-surcharges/",
            icon: "gasIndex" as IconNames,
            label: t("sidebar.myFuelSurcharges"),
            query: SIDEBAR_FUEL_SURCHARGES_QUERY[SidebarTabNames.FUEL_SURCHARGES],
            testId: "navbar-fuel-surcharges",
        };

        if (canDisplayFuelSurchargesAndTariffGrids) {
            const tariffSublinks: SidebarChildLink[] = [
                {
                    ...tariffGridLink,
                    icon: null,
                    query: SIDEBAR_TARIFFS_QUERY[SidebarTabNames.TARIFF_GRIDS],
                },
                {
                    ...fuelSurchargeLink,
                    icon: null,
                    query: SIDEBAR_TARIFFS_QUERY[SidebarTabNames.FUEL_SURCHARGES],
                },
            ];
            links.push({
                link: tariffSublinks[0].link as string,
                icon: "workflowDataTable2",
                label: t("sidebar.tariffs"),
                children: tariffSublinks,
                testId: "navbar-tariffs",
            });
        }

        if (featureflags.hasInvoiceEntityEnabled) {
            const invoiceLink = {
                link: "/app/invoices/",
                icon: "invoice",
                label: t("sidebar.myInvoices"),
                query: SIDEBAR_INVOICE_QUERY[SidebarTabNames.INVOICE],
                testId: "navbar-invoice",
            } as const;

            if (!featureflags.hasDashdocInvoicingEnabled) {
                links.push(invoiceLink);
            } else {
                const creditNoteChildLink = {
                    link: "/app/credit-notes/",
                    icon: null,
                    label: t("sidebar.creditNotes"),
                    query: SIDEBAR_CREDIT_NOTES_QUERY[SidebarTabNames.CREDIT_NOTES],
                    testId: "navbar-credit-notes",
                } as const;
                const invoiceChildLink = {
                    ...invoiceLink,
                    icon: null,
                } as const;
                const invoicingSublinks = [invoiceChildLink, creditNoteChildLink];
                links.push({
                    link: invoicingSublinks[0].link,
                    icon: "invoice",
                    label: t("sidebar.invoicing"),
                    children: invoicingSublinks,
                    testId: "navbar-invoicing",
                });
            }
        }

        if (canDisplayReportsTab) {
            if (featureflags.hasDashdocInvoicingEnabled) {
                const transportReportingChildLink = {
                    link: "/app/reports/",
                    icon: "reports",
                    label: t("sidebar.transportsAndOrders"),
                    query: SIDEBAR_INVOICE_QUERY[SidebarTabNames.REPORTS],
                    testId: "navbar-reports",
                } as const;
                const invoiceReportingChildLink = {
                    link: "/app/invoice-reports/",
                    icon: null,
                    label: t("sidebar.invoicing"),
                    query: SIDEBAR_INVOICE_REPORTS_QUERY[SidebarTabNames.INVOICES_REPORTS],
                    testId: "navbar-invoice-reports",
                } as const;
                const revenueReportingChildLink = {
                    link: "/app/revenue-reports/",
                    icon: null,
                    label: t("sidebar.revenue"),
                    query: SIDEBAR_REVENUE_REPORTS_QUERY[SidebarTabNames.REVENUE_REPORTS],
                    testId: "navbar-revenue-reports",
                } as const;
                const reportingSublinks = featureflags.hasBetaReportsEnabled
                    ? [
                          transportReportingChildLink,
                          invoiceReportingChildLink,
                          revenueReportingChildLink,
                      ]
                    : [transportReportingChildLink, invoiceReportingChildLink];
                links.push({
                    link: reportingSublinks[0].link,
                    icon: "reports",
                    label: t("sidebar.reports"),
                    children: reportingSublinks,
                    testId: "navbar-reports",
                });
            } else {
                links.push({
                    link: "/app/reports/",
                    icon: "reports",
                    label: t("sidebar.reports"),
                    query: SIDEBAR_INVOICE_QUERY[SidebarTabNames.REPORTS],
                    testId: "navbar-reports",
                });
            }
        }

        const fleetSublinks: SidebarChildLink[] = [
            {
                query: SIDEBAR_FLEET_QUERY[SidebarTabNames.TRUCKERS],
                label: getTabTranslations(SidebarTabNames.TRUCKERS),
                link: baseUrl + LINK_TRUCKERS_HOMOGENEOUS,
                icon: null,
            },
            {
                query: SIDEBAR_FLEET_QUERY[SidebarTabNames.FLEET],
                label: getTabTranslations(SidebarTabNames.FLEET),
                link: baseUrl + LINK_FLEET,
                alternativeLinks: [baseUrl + LINK_REQUESTED_VEHICLES],
                icon: null,
            },
        ];
        // Vehicles/trailers/truckers
        links.push({
            query: fleetSublinks[0].query,
            link: fleetSublinks[0].link!,
            icon: "steeringWheel",
            label: t("sidebar.myFleet"),
            children: fleetSublinks,
        });
    }

    // address book
    const addressBookSublinks: SidebarChildLink[] = [
        {
            query: SIDEBAR_ADDRESS_BOOK_QUERY[SidebarTabNames.PARTNERS],
            alternativeLinks: [baseUrl + LINK_PARTNERS_EXPORTS],
            link: baseUrl + LINK_PARTNERS,
            label: t("sidebar.partners"),
            icon: null,
            testId: "partners",
        },
        {
            query: SIDEBAR_ADDRESS_BOOK_QUERY[SidebarTabNames.LOGISTIC_POINTS],
            link: baseUrl + LINK_LOGISTIC_POINTS,
            alternativeLinks: [baseUrl + LINK_LOGISTIC_POINTS_EXPORTS],
            label: t("sidebar.logisticPoints"),
            icon: null,
            testId: "logistic-points",
        },
        {
            query: SIDEBAR_CONTACTS_QUERY[SidebarTabNames.CONTACTS],
            link: baseUrl + LINK_CONTACTS,
            label: t("sidebar.contacts"),
            icon: null,
            testId: "contacts",
        },
    ].filter((link) => !isNil(link));

    links.push({
        query: SIDEBAR_ADDRESS_BOOK_QUERY[SidebarTabNames.ADDRESS_BOOK],
        link: baseUrl + LINK_ADDRESS_BOOK,
        label: t("sidebar.addressBook"),
        icon: "addressBook",
        children: addressBookSublinks,
    });

    if (!isGroupView) {
        // tracking
        if (hasTracking) {
            links.push({
                link: "/app/tracking/",
                label: t("sidebar.tracking"),
                icon: "address",
                children: [],
                query: SIDEBAR_TRACKING_QUERY[SidebarTabNames.TRACKING],
            });
        }
    } else {
        links.push({
            query: SIDEBAR_USERS_QUERY[SidebarTabNames.USERS],
            link: baseUrl + LINK_USERS,
            icon: "user",
            label: t("sidebar.users"),
        });
        links.push({
            query: SIDEBAR_ENTITIES_QUERY[SidebarTabNames.ENTITIES],
            link: baseUrl + LINK_ENTITIES,
            icon: "house",
            label: t("sidebar.entities"),
        });
    }
    return links;
}

export const linkService = {
    extractBaseLink,
    getLinks,
};
