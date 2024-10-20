import {
    ErrorBoundary,
    getConnectedCompany,
    getConnectedManager,
    PusherEvent,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Callout, LoadingWheel, Text} from "@dashdoc/web-ui";
import {Screen} from "@dashdoc/web-ui";
import {usePrevious} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React, {useEffect, useState} from "react";
import {Helmet} from "react-helmet";
import {useParams} from "react-router";

import {ActionableExtendedViewContext} from "app/common/ActionableExtendedViewContext";
import {TransportDetails} from "app/features/transport/transport-details/TransportDetails";
import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTransport} from "app/redux/reducers";
import {getLastTransportEventByUid} from "app/redux/selectors/realtime";
import {
    getTransportChildrenUIDs,
    isTransportOrder,
} from "app/services/transport/transport.service";

type Props = {
    transportUid?: string;
    isFullScreen?: boolean;
    onTransportDeleted?: () => void;
    reloadTransportsToInvoice?: (invoicesCreated?: boolean) => void;
};

export function TransportScreen({
    transportUid: transportUidProp,
    isFullScreen,
    onTransportDeleted,
    reloadTransportsToInvoice,
}: Props) {
    const {transportUid: transportUidParam} = useParams<{transportUid: string}>();
    const transportUid = transportUidProp || transportUidParam;
    if (isNil(transportUid)) {
        throw new Error("We need a pk to show the transport!");
    }
    const [error, setError] = useState<string | null>(null);

    const dispatch = useDispatch();

    const company = useSelector(getConnectedCompany);
    const connectedManager = useSelector(getConnectedManager);
    const transport = useSelector((state) => {
        return state.entities.transports ? getFullTransport(state, transportUid) : null;
    });
    const lastRealtimeEvents: Record<string, PusherEvent> | null = useSelector((state) => {
        let lastRealtimeEvents = null;
        if (state.entities.transports) {
            const transportChildrenUIDs = transport ? getTransportChildrenUIDs(transport) : [];
            lastRealtimeEvents = {
                [transportUid]: getLastTransportEventByUid(state, transportUid),
                ...transportChildrenUIDs.reduce(
                    (acc, uid) => ({
                        ...acc,
                        [uid]: getLastTransportEventByUid(state, uid),
                    }),
                    {}
                ),
            };
        }
        return lastRealtimeEvents;
    });
    const previousLastRealtimeEvent = usePrevious(lastRealtimeEvents);

    useEffect(() => {
        const init = async () => {
            try {
                await dispatch(fetchRetrieveTransport(transportUid));
            } catch (e) {
                setError(t("errors.notFound"));
            }
        };
        init();
    }, [dispatch, transportUid]);

    useEffect(() => {
        if (lastRealtimeEvents) {
            for (const [uid, event] of Object.entries(lastRealtimeEvents)) {
                if (event && event.timestamp !== previousLastRealtimeEvent?.[uid]?.timestamp) {
                    dispatch(fetchRetrieveTransport(uid));
                }
            }
        }
    }, [dispatch, lastRealtimeEvents]);

    function isOrder() {
        return company !== null && isTransportOrder(transport, company.pk);
    }

    if (error !== null) {
        return (
            <Screen>
                <Callout variant="danger" data-testid={`transport-not-found`} m={4}>
                    <Text variant="title">{error}</Text>
                </Callout>
            </Screen>
        );
    }
    if (!transport) {
        return <LoadingWheel />;
    }

    return (
        <Screen>
            <div className="container-fluid">
                {isFullScreen && (
                    <Helmet>
                        <title>
                            {isOrder()
                                ? t("transportDetails.newOrderNumber", {
                                      number: transport.sequential_id,
                                  })
                                : t("transportDetails.transportNumber", {
                                      number: transport.sequential_id,
                                  })}
                        </title>
                    </Helmet>
                )}
                <ErrorBoundary
                    manager={connectedManager}
                    moderationLink={`transports/${transport.uid}`}
                >
                    <ActionableExtendedViewContext.Provider value={true}>
                        <TransportDetails
                            transport={transport}
                            company={company}
                            onTransportDeleted={onTransportDeleted}
                            reloadTransportsToInvoice={reloadTransportsToInvoice}
                            isFullScreen={isFullScreen}
                        />
                    </ActionableExtendedViewContext.Provider>
                </ErrorBoundary>
            </div>
        </Screen>
    );
}
