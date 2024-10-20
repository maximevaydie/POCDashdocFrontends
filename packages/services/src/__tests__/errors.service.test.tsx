import {syncSetupI18n} from "@dashdoc/web-core";

import {getErrorMessageFromServerError} from "../errors.service";

import Mock = jest.Mock;

beforeAll(() => {
    syncSetupI18n();
});

describe("Test getErrorMessageFromServerError method", () => {
    test("should return common error message when there is nothing else", async () => {
        const serverResponse: {json: Mock<any, any>; clone?: Mock<any, any>} = {
            json: jest.fn().mockReturnValue({}),
        };
        serverResponse["clone"] = jest.fn().mockReturnValue(serverResponse);

        const errorMsg = await getErrorMessageFromServerError(serverResponse);

        expect(errorMsg).toBe("Une erreur est survenue");
    });

    test("should return error message for invalid remote_id", async () => {
        const serverResponse: {json: Mock<any, any>; clone?: Mock<any, any>} = {
            json: jest.fn().mockReturnValue({
                remote_id: {
                    detail: "There is already a transport with the remote_id 12345",
                    code: "invalid",
                },
            }),
        };
        serverResponse["clone"] = jest.fn().mockReturnValue(serverResponse);

        const errorMsg = await getErrorMessageFromServerError(serverResponse);

        expect(errorMsg).toBe("There is already a transport with the remote_id 12345");
    });

    test("should return error message when origin date is after destination date", async () => {
        const serverResponse: {json: Mock<any, any>; clone?: Mock<any, any>} = {
            json: jest.fn().mockReturnValue({
                origin: {
                    detail: "Origin min arrival_date (2021-04-22 22:00:00+00:00) must be before destination max arrival_date (2021-04-16 21:59:00+00:00)",
                    code: "origin_date_after_destination_date",
                },
                destination: {
                    detail: "Destination max arrival_date (2021-04-16 21:59:00+00:00) must be after origin min arrival_date (2021-04-22 22:00:00+00:00)",
                    code: "origin_date_after_destination_date",
                },
            }),
        };

        serverResponse["clone"] = jest.fn().mockReturnValue(serverResponse);

        const errorMsg = await getErrorMessageFromServerError(serverResponse);

        expect(errorMsg).toBe(
            "La date de livraison demandée est avant la date d'enlèvement demandée"
        );
    });

    test("should return error message for ETA tracking", async () => {
        const serverResponse: {json: Mock<any, any>; clone?: Mock<any, any>} = {
            json: jest.fn().mockReturnValue({
                segments: {
                    detail: [
                        {
                            origin: {
                                eta_tracking: [
                                    "We cannot enable the ETA. Arrival time / slots are missing.",
                                ],
                            },
                        },
                    ],
                    code: [
                        {
                            origin: {
                                eta_tracking: ["invalid"],
                            },
                        },
                    ],
                },
            }),
        };
        serverResponse["clone"] = jest.fn().mockReturnValue(serverResponse);

        const errorMsg = await getErrorMessageFromServerError(serverResponse);

        expect(errorMsg).toBe("We cannot enable the ETA. Arrival time / slots are missing.");
    });
});
