import {z} from "zod";

import {TARIFF_GRID_SCREEN_SORTABLE_COLUMNS} from "app/screens/invoicing/TariffGridsScreenColumn";

const TARIFF_GRID_ORDERING = [
    ...TARIFF_GRID_SCREEN_SORTABLE_COLUMNS,
    ...TARIFF_GRID_SCREEN_SORTABLE_COLUMNS.map((column) => `-${column}`),
] as [string, ...string[]];

export type TariffGridOrdering = keyof typeof TARIFF_GRID_ORDERING;

export const TARIFF_GRIDS_FILTERING_SCHEMA = z.object({
    ordering: z.enum(TARIFF_GRID_ORDERING).optional(),
    client__in: z.array(z.string()).optional(),
    owner_type__in: z.array(z.string()).optional(),
    status__in: z.array(z.string()),
    load_category__in: z.array(z.string()).optional(),
    text: z.array(z.string()).optional(),
});

export type TariffGridsFilteringQuery = {
    ordering?: TariffGridOrdering;
    client__in?: string[];
    owner_type__in?: string[];
    status__in?: string[];
    load_category__in?: string[];
    text?: string[];
    page?: number;
};

export type TariffGridsFilteringQueryParams = Omit<TariffGridsFilteringQuery, "ordering"> & {
    ordering?: string; // replaced with correct backend field
};

export const DEFAULT_TARIFF_GRIDS_FILTERING_QUERY: TariffGridsFilteringQuery = {
    ordering: undefined,
    client__in: [],
    owner_type__in: [],
    status__in: [],
    load_category__in: [],
    text: [],
    page: undefined,
};

export type TariffGridsFilteringClientQuery = {
    client__in?: string[];
};

export type TariffGridsFilteringOwnerTypeQuery = {
    owner_type__in?: string[];
};

export type TariffGridsFilteringStatusQuery = {
    status__in?: string[];
};

export type TariffGridsFilteringLoadCategoryQuery = {
    load_category__in?: string[];
};

export const TARIFF_GRIDS_VIEW_CATEGORY = "tariff_grids";
