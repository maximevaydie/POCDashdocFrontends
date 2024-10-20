import {ErrorBoundary} from "@dashdoc/web-common";
import {NotFoundScreen} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {Screen} from "@dashdoc/web-ui";
import {FleetItem} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Helmet from "react-helmet";
import {RouteComponentProps} from "react-router";

import FleetUnits from "app/features/fleet/fleet-details/FleetDetails";
import {fetchRetrieveTrailer} from "app/redux/actions/trailers";
import {fetchRetrieveVehicle} from "app/redux/actions/vehicles";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTrailer, getFullVehicle} from "app/redux/reducers";

type FleetUnitScreenProps = {
    itemPk?: number;
    itemType?: FleetItem["type"];
    updateScreenTitle?: boolean;
    onDelete?: () => void;
} & Partial<RouteComponentProps<{itemPk: string}>>;

export function FleetUnitScreen({
    itemPk: passedItemPk,
    itemType,
    updateScreenTitle,
    match,
    onDelete,
}: FleetUnitScreenProps) {
    // @ts-ignore
    const [fleetItemType, setFleetItemType] = useState<FleetItem["type"]>(null);
    const itemPk = useMemo(
        // @ts-ignore
        () => passedItemPk || parseInt(match?.params?.itemPk),
        [match?.params?.itemPk, passedItemPk]
    );
    const fleetItem = useSelector((state) => {
        return fleetItemType === "vehicle"
            ? getFullVehicle(state, itemPk.toString())
            : getFullTrailer(state, itemPk.toString());
    });

    const dispatch = useDispatch();

    const getItemTypeFromUrl = useCallback(() => {
        try {
            const urlType = location.pathname.split("/")[3];
            if (urlType === "vehicles") {
                return "vehicle";
            } else if (urlType === "trailers") {
                return "trailer";
            }
        } catch (e) {
            Logger.error("cannot get item type from url");
        }
        return null;
    }, []);

    const fetchFleetItem = useCallback(async () => {
        const type = itemType || getItemTypeFromUrl();
        if (!type) {
            Logger.error("Tried to access a fleet item details without a type");
            return;
        }
        setFleetItemType(type);
        try {
            if (type === "vehicle") {
                dispatch(fetchRetrieveVehicle(itemPk));
            } else {
                dispatch(fetchRetrieveTrailer(itemPk));
            }
        } catch (e) {
            Logger.error(`${type} item with pk ${itemPk} not found.`);
        }
    }, [dispatch, getItemTypeFromUrl, itemPk, itemType]);

    useEffect(() => {
        fetchFleetItem();
    }, [itemPk, itemType]);

    if (!itemPk) {
        return <NotFoundScreen />;
    } else if (!fleetItem) {
        return <LoadingWheel />;
    }

    return (
        <Screen>
            <Box className="container-fluid">
                {updateScreenTitle !== false && (
                    <Helmet>
                        <title>{fleetItem?.license_plate}</title>
                    </Helmet>
                )}
                <ErrorBoundary>
                    <FleetUnits
                        fleetItem={fleetItem}
                        fleetItemType={fleetItemType}
                        onFleetItemDelete={onDelete}
                    />
                </ErrorBoundary>
            </Box>
        </Screen>
    );
}
