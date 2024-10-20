import {getConnectedCompany} from "@dashdoc/web-common";
import {queryService} from "@dashdoc/web-core";

import {useCompaniesInGroupViews} from "app/hooks/useCompaniesInGroupViews";
import {useSelector} from "app/redux/hooks";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import type {Transport} from "app/types/transport";

export function useTransportViewer(transport: Transport) {
    const isPublicTokenAuthorized = queryService.isPublicTokenAuthorized();

    const companiesInGroupViews = useCompaniesInGroupViews();
    const company = useSelector(getConnectedCompany);
    if (company === null) {
        return {
            isCarrier: false,
            isCarrierGroup: false,
            isShipper: false,
            isCreator: false,
            isPrivateViewer: false,
            isPublicViewer: true,
            isReadOnly: true,
            isPublicTokenAuthorized,
        };
    }
    const companyPk = company.pk;

    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isCarrierGroup =
        isCarrier || transportViewerService.isCarrierGroupOf(transport, companiesInGroupViews);
    const isShipper = transportViewerService.isShipperOf(transport, companyPk);
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isPrivateViewer = transportViewerService.isPrivateViewerOf(transport, companyPk);
    const isReadOnly = transportViewerService.isReadOnly(transport);

    return {
        isCarrier,
        isCarrierGroup,
        isShipper,
        isCreator,
        isPrivateViewer,
        isPublicViewer: !isPrivateViewer,
        isReadOnly,
        isPublicTokenAuthorized,
    };
}
