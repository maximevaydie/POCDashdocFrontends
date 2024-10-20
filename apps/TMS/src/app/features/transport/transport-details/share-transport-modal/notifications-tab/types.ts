import {SimpleContact, TrackingContact} from "dashdoc-utils";

import type {Site} from "app/types/transport";

export type NormalizedTrackingContact = Omit<TrackingContact, "contact" | "uid" | "delivery"> & {
    uid?: string;
    contact: SimpleContact;
    delivery: string;
    site?: Site;
    // Used to keep track of deleted contact (as we need a separate `DELETE` call)
    // to avoid having to compare the original list with the new one
    toDelete: boolean;
    owned_by_user: boolean;
};

export type DeletableSimpleContact = SimpleContact & {canBeDeleted: boolean};
