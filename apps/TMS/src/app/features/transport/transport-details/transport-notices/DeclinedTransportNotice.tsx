import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";

import {useTransportViewer} from "app/hooks/useTransportViewer";
import {getLastStatusUpdateForCategory} from "app/services/transport";

import type {Transport} from "app/types/transport";

export function DeclinedTransportNotice({transport}: {transport: Transport}) {
    const {isShipper} = useTransportViewer(transport);

    const declinedStatusUpdate = getLastStatusUpdateForCategory("declined", transport);
    if (!declinedStatusUpdate?.content) {
        return (
            <Text color="inherit" data-testid="declined-transport-warning">
                {t("components.transportDeclinedNoReason")}
            </Text>
        );
    }

    return (
        <Text color="inherit" data-testid="declined-transport-warning">
            {t("components.transportDeclinedReason")}
            {declinedStatusUpdate.content}
            <br />
            {isShipper && t("components.editTransportNewSubmission")}
        </Text>
    );
}
