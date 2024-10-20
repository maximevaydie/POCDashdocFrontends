import {SidebarQuery as CommonSidebarQuery, SidebarChildLink} from "@dashdoc/web-common";
import {BusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {IconNames} from "@dashdoc/web-ui";

export interface SidebarQuery extends CommonSidebarQuery {
    archived?: boolean;
    pending?: boolean;
    declined?: boolean;
    ongoing?: boolean;
    done?: boolean;
    invoiced?: boolean;
    paid?: boolean;
    business_status?: BusinessStatus;
}

export type SidebarLink = {
    query?: SidebarQuery;
    link: string;
    icon: IconNames;
    label: string;
    testId?: string;
    count?: number;
    isNew?: boolean;
    children?: SidebarChildLink[];
};
