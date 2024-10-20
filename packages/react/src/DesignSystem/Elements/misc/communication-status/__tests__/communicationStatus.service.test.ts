import {communicationStatusService} from "../communicationStatus.service";
import {CommunicationStatus} from "../types";

const communicationStatuses_1: CommunicationStatus[] = [
    {
        pk: 1,
        status: "delivered",
        // @ts-ignore
        status_updated_at: "2021-08-17T13:00:00.000Z",
        email: "email_1@mail.com",
    },
    {
        pk: 2,
        status: "bounced",
        // @ts-ignore
        status_updated_at: "2021-08-17T14:00:00.000Z",
        email: "email_1@mail.com",
    },
    {
        pk: 3,
        status: "bounced",
        // @ts-ignore
        status_updated_at: "2021-08-18T11:00:00.000Z",
        email: "email_1@mail.com",
    },
];

const communicationStatuses_2: CommunicationStatus[] = [
    {
        pk: 1,
        status: "submitted",
        // @ts-ignore
        status_updated_at: "2021-08-17T13:00:00.000Z",
        email: "email_1@mail.com",
    },
    {
        pk: 2,
        status: "bounced",
        // @ts-ignore
        status_updated_at: "2021-08-17T14:00:00.000Z",
        email: "email_1@mail.com",
    },
    {
        pk: 3,
        status: "bounced",
        // @ts-ignore
        status_updated_at: "2021-08-18T11:00:00.000Z",
        email: "email_1@mail.com",
    },
];

test("sort communication status", () => {
    const sortedCommunicationStatuses = communicationStatusService.sort(communicationStatuses_1);
    expect(sortedCommunicationStatuses[0].pk).toBe(3);
    expect(sortedCommunicationStatuses[1].pk).toBe(2);
    expect(sortedCommunicationStatuses[2].pk).toBe(1);
});

test("get communication status counts by status", () => {
    const countByStatus = communicationStatusService.getCountByStatus(communicationStatuses_1);
    expect(countByStatus.submitted).toBe(0);
    expect(countByStatus.delivered).toBe(1);
    expect(countByStatus.bounced).toBe(2);
});

test("if submitting", () => {
    expect(communicationStatusService.isSubmitting(communicationStatuses_1)).toBe(false);
    expect(communicationStatusService.isSubmitting(communicationStatuses_2)).toBe(true);
});
