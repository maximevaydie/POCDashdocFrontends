import {IconNames} from "@dashdoc/web-ui";

export type SidebarChildLink = {
    query: SidebarQuery;
    count?: number;
    countImportant?: boolean;
    countAlert?: boolean;
    link?: string;
    alternativeLinks?: string[];
    label: string;
    icon?: IconNames | null;
    separatorBelow?: boolean;
    testId?: string;
    isNew?: boolean;
};

export type SidebarQuery = {
    tab?: string;
};
