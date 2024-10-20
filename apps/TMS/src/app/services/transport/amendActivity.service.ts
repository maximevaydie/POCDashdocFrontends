import {Company, ManagerRole} from "dashdoc-utils";

import {transportViewerService} from "./transportViewer.service";

import type {Activity, Transport} from "app/types/transport";

function canAmendRealDate(
    activity: Activity,
    transport: Transport,
    managerRole: ManagerRole,
    companyPk: Company["pk"]
) {
    const isNotReadonlyManager = managerRole !== ManagerRole.ReadOnly;
    const isNotBreakSite = ["origin", "destination"].includes(activity.siteType);

    const isUnverifiedTransport = transport.invoicing_status === "UNVERIFIED";
    const isDoneTransport = transport.global_status === "done";

    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);

    const isCarrierOrCreator = isCarrier || isCreator;

    return (
        isNotReadonlyManager &&
        isNotBreakSite &&
        isUnverifiedTransport &&
        isDoneTransport &&
        isCarrierOrCreator
    );
}

export const amendActivityService = {
    canAmendRealDate,
};
