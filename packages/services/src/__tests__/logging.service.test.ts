import {Logger} from "../../dashdocOLD/core/src/services/logging.service";

let logs: any[];
function logMock(...data: any[]) {
    logs.push(...data);
}
// eslint-disable-next-line no-console
console.log = logMock;

let errors: any[];
function errorMock(...data: any[]) {
    errors.push(...data);
}
// eslint-disable-next-line no-console
console.error = errorMock;

describe("Test logging.service", () => {
    beforeEach(() => {
        logs = [];
        errors = [];
    });

    test("log", () => {
        const logArg = "test";
        Logger.log(logArg);
        const [log] = logs;
        expect(log).toEqual(logArg);
    });

    test("error", () => {
        const logArg = "test";
        Logger.error(logArg);
        const [log] = errors;
        expect(log).toEqual(logArg);
    });
});
