import type {Site} from "app/types/transport";

export type SchedulerCardActivity = Pick<Site, "uid"> & {
    eta_tracking?: Site["eta_tracking"];
    eta?: Site["eta"];
    punctuality_status?: Site["punctuality_status"];
    real_start?: Site["real_start"];
    real_end?: Site["real_end"];
    slots?: Site["slots"];
    scheduled_range?: Site["scheduled_range"] | null;
    address: SchedulerCardAddress | null;
};

type SchedulerCardAddress = {
    name?: string;
    city: string;
    postcode: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    coords_validated?: boolean;
};

export type SchedulerActivitiesForCard = SchedulerCardActivity & {
    category?: Site["category"];
    onSite: boolean;
    siteDone: boolean;
    isDeletedOrCancelled: boolean;
};
