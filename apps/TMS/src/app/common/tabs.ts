import {BusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {t} from "@dashdoc/web-core";

import {
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_CHECKED_TAB,
    ORDERS_DELETED_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_DELETED_OR_DECLINED_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TAB,
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
} from "app/types/businessStatus";
import {SidebarTabNames} from "app/types/constants";

export const ORDERS_OR_TRANSPORTS_RESULTS_TAB = "results";
export type TabName = SidebarTabNames | BusinessStatus | typeof ORDERS_OR_TRANSPORTS_RESULTS_TAB;

export const getTabTranslations = (tab: TabName) => {
    const translations: {
        [key in TabName]: string;
    } = {
        [SidebarTabNames.DASHBOARD]: t("sidebar.dashboard"),
        [SidebarTabNames.NEW_TRANSPORT]: t("transportsForm.newTransport"),
        [SidebarTabNames.NEW_TRANSPORT_COMPLEX]: t("transportsForm.newMultipointTransport"),
        [SidebarTabNames.NEW_ORDER]: t("transportsForm.newOrder"),
        [SidebarTabNames.NEW_ORDER_COMPLEX]: t("transportsForm.newMultipointOrder"),
        [SidebarTabNames.NEW_TEMPLATE]: t("transportTemplates.newTemplateTitle"),
        [SidebarTabNames.TEMPLATE_EDITION]: t("transportTemplates.editTemplateTitle"),
        [SidebarTabNames.TRIP_EDITION]: t("sidebar.tripEdition"),
        [SidebarTabNames.ADDRESS_BOOK]: t("sidebar.addressBook"),
        [SidebarTabNames.PARTNERS]: t("sidebar.partners"),
        [SidebarTabNames.ORIGIN]: t("sidebar.origin"),
        [SidebarTabNames.DELIVERY]: t("sidebar.delivery"),
        [SidebarTabNames.CONTACTS]: t("sidebar.contacts"),
        [SidebarTabNames.TRACKING]: t("sidebar.tracking"),
        [SidebarTabNames.LOGISTIC_POINTS]: t("sidebar.logisticPoints"),
        [SidebarTabNames.SCHEDULER]: t("sidebar.scheduler"),
        [SidebarTabNames.CARRIER_SCHEDULER]: t("sidebar.carrier"),
        [SidebarTabNames.SITE_SCHEDULER]: t("sidebar.siteScheduler"),
        [SidebarTabNames.FLEET]: t("sidebar.myEquipment"),
        [SidebarTabNames.TRUCKERS]: t("sidebar.myTruckers"),
        [SidebarTabNames.EXTENSIONS]: t("settings.myExtensions"),
        [SidebarTabNames.INVOICE]: t("sidebar.myInvoices"),
        [SidebarTabNames.CREDIT_NOTES]: t("sidebar.myCreditNotes"),
        [SidebarTabNames.INVOICES_EXPORTS]: t("sidebar.invoicesExports"),
        [SidebarTabNames.REVENUE_REPORTS]: `${t("sidebar.reports")} : ${t("sidebar.revenue")}`,
        [SidebarTabNames.INVOICES_REPORTS]: `${t("sidebar.reports")} : ${t("sidebar.invoicing")}`,
        [SidebarTabNames.USERS]: t("sidebar.users"),
        [SidebarTabNames.ENTITIES]: t("sidebar.entities"),
        [SidebarTabNames.REPORTS]: `${t("sidebar.reports")} : ${t("sidebar.transportsAndOrders")}`,
        [SidebarTabNames.TAGS]: t("common.tags"),
        [SidebarTabNames.TARIFF_GRIDS]: t("sidebar.myTariffGrids"),
        [SidebarTabNames.FUEL_SURCHARGES]: t("sidebar.myFuelSurcharges"),
        [SidebarTabNames.CARRIER_ASSIGNATION_RULES]: t("sidebar.carrierAssignationRules"),
        [SidebarTabNames.ACCOUNT]: t("settings.myAccount"),
        [SidebarTabNames.TRANSPORTS_EXPORT]: t("common.exports"),
        [SidebarTabNames.CARBON_FOOTPRINT]: t("carbonFootprint.title"),
        [TRANSPORTS_TAB]: t("sidebar.transports.all"),
        [TRANSPORTS_TO_APPROVE_TAB]: `${t("sidebar.transports")} : ${t(
            "sidebar.transports.toConfirm"
        )}`,
        [TRANSPORTS_TO_PLAN_TAB]: `${t("sidebar.transports")} : ${t("sidebar.toPlan")}`,
        [TRANSPORTS_TO_SEND_TO_TRUCKER_TAB]: `${t("sidebar.transports")} : ${t(
            "sidebar.toSendToTrucker"
        )}`,
        [TRANSPORTS_ONGOING_TAB]: `${t("sidebar.transports")} : ${t("sidebar.ongoing")}`,
        [TRANSPORTS_DONE_TAB]: `${t("sidebar.transports")} : ${t("sidebar.done")}`,
        [TRANSPORTS_BILLING_TAB]: `${t("sidebar.transports")} : ${t("sidebar.billing")}`,
        [TRANSPORTS_DELETED_OR_DECLINED_TAB]: `${t("sidebar.transports")} : ${t("sidebar.bin")}`,
        [ORDERS_TAB]: t("sidebar.orders.all"),
        [ORDERS_TO_ASSIGN_OR_DECLINED_TAB]: `${t("sidebar.orders")} : ${t(
            "sidebar.ordersToAssign"
        )}`,
        [ORDERS_TO_SEND_TO_CARRIER_TAB]: `${t("sidebar.orders")} : ${t("sidebar.ordersToSend")}`,
        [ORDERS_AWAITING_CONFIRMATION_TAB]: `${t("sidebar.orders")} : ${t(
            "sidebar.ordersAwaitingConfirmation"
        )}`,
        [ORDERS_ONGOING_TAB]: `${t("sidebar.orders")} : ${t("sidebar.orders.handledByCarriers")}`,
        [ORDERS_DONE_OR_CANCELLED_TAB]: `${t("sidebar.orders")} : ${t("sidebar.orderDone")}`,
        [ORDERS_DELETED_TAB]: `${t("sidebar.orders")} : ${t("sidebar.bin")}`,
        [ORDERS_CHECKED_TAB]: `${t("sidebar.orders")} : ${t("sidebar.orders.checked")}`,
        [ORDERS_OR_TRANSPORTS_RESULTS_TAB]: t("common.results"),
    };
    return translations[tab];
};
