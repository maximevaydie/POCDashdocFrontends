import {
    ApiOptions,
    APIListResponse,
    APIVersion,
    ApiScope,
    GenericDataQuery,
    Query,
} from "dashdoc-utils";

import {Report, ReportPatch, ReportPost} from "../../types/reportsTypes";

export class Reports extends ApiScope<
    Query,
    Report,
    Query,
    APIListResponse<Report>,
    GenericDataQuery<ReportPost>,
    Report,
    GenericDataQuery<ReportPatch>,
    Report
>() {
    path = "reports";

    constructor(options: ApiOptions) {
        const webOptions = {...options, apiVersion: "web" as APIVersion};
        super(webOptions);
    }
}
