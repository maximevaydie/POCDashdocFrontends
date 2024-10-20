import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React, {useCallback, useState} from "react";

import {useIsReadOnly} from "app/hooks/useIsReadOnly";
import {useTransportViewer} from "app/hooks/useTransportViewer";

import type {Transport} from "app/types/transport";

export function RefreshCarbonFootprintButton({
    transport,
    refreshCarbonFootprint,
}: {
    transport: Transport;
    refreshCarbonFootprint?: () => Promise<void>;
}) {
    const [isRefreshing, setRefreshing] = useState(false);

    const refresh = useCallback(() => {
        setRefreshing(true);

        refreshCarbonFootprint &&
            refreshCarbonFootprint().finally(() => {
                setRefreshing(false);
            });
    }, [refreshCarbonFootprint]);

    const isReadOnlyUser = useIsReadOnly();
    const {
        isCreator,
        isCarrier,
        isShipper,
        isReadOnly: isReadOnlyTransport,
    } = useTransportViewer(transport);

    const canRefresh =
        !isReadOnlyTransport && (isCarrier || isShipper || isCreator) && !isReadOnlyUser;

    if (!canRefresh || !refreshCarbonFootprint) {
        return null;
    }
    return (
        <IconButton
            onClick={refresh}
            name="refresh"
            label={t("components.carbonFootprint.refresh")}
            color={"blue.default"}
            disabled={isRefreshing}
            flexShrink="0"
        />
    );
}
