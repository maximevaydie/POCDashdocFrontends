import {TransportsBusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";

import {
    TransportBusinessStatuses,
    TransportBusinessStatusesDescriptor,
} from "app/types/businessStatus";
import {SidebarTabNames} from "app/types/constants";

export const LINK_HOME = "/home/";
export const LINK_SCHEDULER = "/scheduler/";
export const LINK_TRANSPORTS = "/transports/";
export const LINK_ORDERS = "/orders/";
export const LINK_ADDRESS_BOOK = "/address-book/";
export const LINK_PARTNERS = "/address-book/partners/";
export const LINK_PARTNERS_EXPORTS = "/address-book/partners/exports/";
export const LINK_LOGISTIC_POINTS = "/address-book/logistic-points/";
export const LINK_LOGISTIC_POINTS_EXPORTS = "/address-book/logistic-points/exports/";
export const LINK_CONTACTS = "/address-book/contacts/";
export const LINK_CONTACTS_DEPRECATED = "/contacts/";
export const LINK_USERS = "/users/";
export const LINK_ENTITIES = "/entities/";
export const LINK_FLEET = "/fleet/vehicles/";
export const LINK_REQUESTED_VEHICLES = "/fleet/requested-vehicles/";
export const LINK_TRUCKERS_HOMOGENEOUS = "/fleet/truckers/";

export const SIDEBAR_DASHBOARD_QUERY: any = {
    [SidebarTabNames.DASHBOARD]: {
        tab: SidebarTabNames.DASHBOARD,
        archived: false,
        isExtendedSearch: true,
    },
};

export const SIDEBAR_SCHEDULER_QUERY: {
    [key in SidebarTabNames]?: {
        tab: SidebarTabNames;
    };
} = {
    [SidebarTabNames.CARRIER_SCHEDULER]: {
        tab: SidebarTabNames.CARRIER_SCHEDULER,
    },
    [SidebarTabNames.SITE_SCHEDULER]: {
        tab: SidebarTabNames.SITE_SCHEDULER,
    },
};

export const SIDEBAR_TRANSPORTS_QUERY: Record<string, any> = {
    ...Object.keys(TransportBusinessStatuses).reduce(
        (acc, key) => {
            const {query} = TransportBusinessStatuses[key as TransportsBusinessStatus];
            return {...acc, [key]: query};
        },
        {} as {
            [Property in TransportsBusinessStatus]: TransportBusinessStatusesDescriptor["query"];
        }
    ),
};

export const SIDEBAR_ADDRESS_BOOK_QUERY: any = {
    [SidebarTabNames.ADDRESS_BOOK]: {
        tab: SidebarTabNames.ADDRESS_BOOK,
    },
    [SidebarTabNames.PARTNERS]: {},
    [SidebarTabNames.LOGISTIC_POINTS]: {},
    [SidebarTabNames.CONTACTS]: {},
};

export const SIDEBAR_CONTACTS_QUERY: any = {
    [SidebarTabNames.CONTACTS]: {},
};

export const SIDEBAR_USERS_QUERY: any = {
    [SidebarTabNames.USERS]: {},
};

export const SIDEBAR_ENTITIES_QUERY: any = {
    [SidebarTabNames.ENTITIES]: {},
};

export const SIDEBAR_FLEET_QUERY: any = {
    [SidebarTabNames.FLEET]: {
        tab: SidebarTabNames.FLEET,
    },
    [SidebarTabNames.TRUCKERS]: {
        tab: SidebarTabNames.TRUCKERS,
    },
};

export const SIDEBAR_TRACKING_QUERY: any = {
    [SidebarTabNames.TRACKING]: {
        tab: SidebarTabNames.TRACKING,
    },
};

export const SIDEBAR_INVOICE_QUERY: any = {
    [SidebarTabNames.INVOICE]: {},
};

export const SIDEBAR_CREDIT_NOTES_QUERY = {
    [SidebarTabNames.CREDIT_NOTES]: {},
} as const;

export const SIDEBAR_INVOICE_REPORTS_QUERY = {
    [SidebarTabNames.INVOICES_REPORTS]: {},
} as const;

export const SIDEBAR_REVENUE_REPORTS_QUERY = {
    [SidebarTabNames.REVENUE_REPORTS]: {},
} as const;

export const SIDEBAR_TARIFF_GRIDS_QUERY: any = {
    [SidebarTabNames.TARIFF_GRIDS]: {},
};

export const SIDEBAR_FUEL_SURCHARGES_QUERY: any = {
    [SidebarTabNames.FUEL_SURCHARGES]: {},
};

export const SIDEBAR_TARIFFS_QUERY: any = {
    [SidebarTabNames.TARIFF_GRIDS]: {
        tab: SidebarTabNames.TARIFF_GRIDS,
    },
    [SidebarTabNames.FUEL_SURCHARGES]: {
        tab: SidebarTabNames.FUEL_SURCHARGES,
    },
};
