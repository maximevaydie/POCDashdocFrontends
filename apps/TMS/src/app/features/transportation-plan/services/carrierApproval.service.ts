import {CarrierApprovalStatus} from "app/features/transportation-plan/types";

import type {Transport} from "app/types/transport";

export function getStatus(transport: Transport): CarrierApprovalStatus {
    const {carrier, global_status} = transport;

    if (global_status === "ordered" && carrier) {
        return "requested";
    } else if (["declined", "ordered", "cancelled"].includes(global_status)) {
        return global_status as CarrierApprovalStatus;
    } else if (["accepted", "ongoing", "done"].includes(global_status)) {
        return "accepted";
    } else {
        return "other";
    }
}

export const carrierApprovalService = {getStatus};
