import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {NoWrap} from "@dashdoc/web-ui";
import React from "react";

import {useTransportViewer} from "app/hooks/useTransportViewer";
import {useSelector} from "app/redux/hooks";
import {isTransportCancelled, isTransportOrder} from "app/services/transport/transport.service";
import {
    getTransportStatusDisplay,
    getTransportationPlanStatusName,
} from "app/services/transport/transportStatus.service";

import type {Transport} from "app/types/transport";
import type {TransportListWeb} from "app/types/transport_list_web";

export function ProgressBarCell({transport}: {transport: TransportListWeb}) {
    //Fixme: TransportListWeb does not provide the external_transport field
    const {isPublicViewer} = useTransportViewer(transport as unknown as Transport);
    const connectedCompany = useSelector(getConnectedCompany);
    let statusDisplay = getTransportStatusDisplay(
        transport.status,
        transport.managed_through?.status,
        isTransportOrder(transport, connectedCompany?.pk)
    );
    const text = getTransportationPlanStatusName(transport, statusDisplay.text);
    statusDisplay = {...statusDisplay, text};
    return (
        <div className="shipment-list-progress-bar-cell">
            <NoWrap>
                <span className="shipment-list-progress-bar-text">{statusDisplay.text}</span>
            </NoWrap>
            <div className="shipment-list-progress-bar-outer">
                <div
                    className="shipment-list-progress-bar-inner"
                    style={{
                        width: statusDisplay.width + "%",
                        backgroundColor: statusDisplay.backgroundColor,
                    }}
                />
            </div>
            {transport.has_observations && (
                <NoWrap>
                    <span className="shipment-list-progress-bar-text">
                        <i className="fa fa-exclamation-triangle text-warning" />{" "}
                        {t("transportsList.observations")}
                    </span>
                </NoWrap>
            )}
            {isTransportCancelled(transport) && (
                <NoWrap>
                    <span className="shipment-list-progress-bar-text">
                        <i className="fa fa-exclamation-triangle text-warning" />{" "}
                        {t("components.cancelled")}
                    </span>
                </NoWrap>
            )}
            {!isPublicViewer && transport.business_privacy && (
                <NoWrap>
                    <span className="shipment-list-progress-bar-text">
                        <i className="fa fa-eye-slash text-warning" />{" "}
                        {t("common.businessPrivacy")}
                    </span>
                </NoWrap>
            )}
        </div>
    );
}
