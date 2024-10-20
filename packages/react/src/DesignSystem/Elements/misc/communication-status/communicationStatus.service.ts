import orderBy from "lodash.orderby";

import {CommunicationStatus} from "./types";

function sort<T extends CommunicationStatus>(communicationStatuses: T[]): T[] {
    return orderBy(communicationStatuses, ["status_updated_at"], ["desc"]);
}

function getCountByStatus(communicationStatuses: CommunicationStatus[]) {
    return communicationStatuses.reduce(
        (
            totalByStatus: Record<CommunicationStatus["status"], number>,
            {status}: CommunicationStatus
        ): Record<CommunicationStatus["status"], number> => {
            if (!totalByStatus[status]) {
                totalByStatus[status] = 0;
            }
            totalByStatus[status] += 1;
            return totalByStatus;
        },
        {submitted: 0, delivered: 0, bounced: 0}
    );
}

function isSubmitting(communicationStatuses: CommunicationStatus[]) {
    return communicationStatuses.some(({status}: CommunicationStatus) => {
        // Ensure the status is "submitted"
        return status === "submitted";
    });
}

export const communicationStatusService = {
    sort,
    getCountByStatus,
    isSubmitting,
};
