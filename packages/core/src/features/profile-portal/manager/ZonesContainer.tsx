import {t} from "@dashdoc/web-core";
import {LoadingOverlay, LoadingWheel, Text} from "@dashdoc/web-ui";
import {EmptyZones} from "features/profile-portal/manager/zone/empty-zone/EmptyZones";
import {Zones} from "features/profile-portal/manager/zone/Zones";
import React from "react";
import {useSelector} from "redux/hooks";
import {loadingFlow} from "redux/reducers/flow";
import {selectZones} from "redux/reducers/flow/zone.slice";

export function ZonesContainer() {
    const loading = useSelector(loadingFlow);
    const zones = useSelector(selectZones);

    if (loading === "idle" || loading === "pending") {
        return <LoadingWheel />;
    }
    if (loading === "failed") {
        return <Text>{t("common.error")}</Text>;
    }
    if (loading !== "reloading" && zones.length === 0) {
        return <EmptyZones />;
    }

    return (
        <>
            {loading === "reloading" && <LoadingOverlay />}
            <Zones />
        </>
    );
}
