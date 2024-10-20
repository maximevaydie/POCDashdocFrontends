import {PusherKey, addPusherEvent, apiService, storeService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {ConfirmationDocumentsCounts, Export} from "dashdoc-utils";
import Pusher, {Channel} from "pusher-js";

import {
    fetchCreditNoteCommunicationStatusUpdatedEvent,
    fetchCreditNoteFileUpdatedEvent,
    fetchCreditNoteUpdatedEvent,
} from "app/redux/actions/creditNotes";
import {
    fetchInvoiceCommunicationStatusUpdatedEvent,
    fetchInvoiceFileUpdatedEvent,
    fetchInvoiceUpdatedEvent,
} from "app/redux/actions/invoices";
import {addPusherEventLegacy} from "app/redux/actions/realtime";
import {fetchUpdateTransportDistances} from "app/redux/actions/transports";
import {
    ShipperFinalPriceUpdatedPayload,
    CreditNoteCommunicationStatusPayload,
    CreditNoteFileUpdatedPayload,
    CreditNotePayload,
    EstimatedDistanceUpdatedPayload,
    InvoiceCommunicationStatusPayload,
    InvoiceFileUpdatedPayload,
    InvoicePayload,
    PricingUpdatedPayload,
} from "app/redux/reducers/realtime";
import {QuotationUpdatedPayload} from "app/redux/reducers/realtime";

import type {RootState} from "app/redux/reducers";

// Enable pusher logging - don't include this in production
// @ts-ignore
Pusher.logToConsole = import.meta.env.DEV;

let pusherClient: Pusher | null = null;

let companyChannel: Channel | null = null;
let userChannel: Channel | null = null;

function getClient() {
    if (!pusherClient) {
        pusherClient = new Pusher(PusherKey, {
            cluster: "eu",
            userAuthentication: {
                transport: "ajax",
                // the customHandler function overrides the endpoint
                // (We leave it empty for the typescript validation)
                endpoint: "",
                /**
                 * @guidedtour[epic=auth] Pusher auth.
                 * To create a WS connection for the pusher third party, we need to get a credential from the server.
                 * The endpoint `/auth/realtime/authenticate/` returns this credential for us (there is a `auth` and `user_data` props).
                 *
                 * If the WS connection is lost, the pusher client will automatically try to reconnect with a new credential.
                 * We use the apiService to deal with the token refresh.
                 * (the apiService will try to refresh the expired token if it's necessary).
                 */
                customHandler: async (payload, callback) => {
                    try {
                        const {socketId} = payload;
                        const response = await apiService.post(
                            "/auth/realtime/authenticate/",
                            {
                                socket_id: socketId,
                            },
                            {basePath: null, apiVersion: null}
                        );
                        if ("auth" in response && "user_data" in response) {
                            callback(null, response);
                        } else {
                            const error = new Error(
                                "Error during the pusher authentication (missing auth or user_data)"
                            );
                            Logger.error(error.message, response);
                            callback(error, null);
                        }
                    } catch (e) {
                        const error = new Error(
                            "Error during the pusher authentication: " + e?.message
                        );
                        Logger.error(error.message, e);
                        callback(error, null);
                    }
                },
            },
        });
        pusherClient.signin();
    }
    return pusherClient;
}

async function setup(
    dispatch: (...args: any[]) => any,
    userPk: number | undefined,
    companyPk: number | undefined
) {
    if (!companyPk || !userPk) {
        return;
    }
    const pusher = getClient();
    if (!companyChannel) {
        companyChannel = pusher.subscribe(`company_${companyPk}`);

        companyChannel.unbind();

        companyChannel.bind("transport", (data: unknown) => {
            dispatch(addPusherEventLegacy({entities: "transports", data, timestamp: Date.now()}));
        });
        companyChannel.bind("trip", (data: unknown) => {
            dispatch(
                addPusherEventLegacy({entities: "schedulerTrips", data, timestamp: Date.now()})
            );
        });

        companyChannel.bind(
            "bulk-confirm-transports",
            (data: {success: boolean; confirmed: {count: number}}) => {
                dispatch(
                    addPusherEventLegacy({
                        entities: "bulkConfirmTransports",
                        data,
                        timestamp: Date.now(),
                    })
                );
            }
        );
        companyChannel.bind(
            "bulk-decline-transports",
            (data: {success: boolean; declined: {count: number}}) => {
                dispatch(
                    addPusherEventLegacy({
                        entities: "bulkDeclineTransports",
                        data,
                        timestamp: Date.now(),
                    })
                );
            }
        );

        companyChannel.bind("trucker", (data: unknown) => {
            dispatch(addPusherEventLegacy({entities: "truckers", data, timestamp: Date.now()}));
        });

        companyChannel.bind("QuotationUpdated", (data: QuotationUpdatedPayload) => {
            dispatch(
                addPusherEventLegacy({entities: "quotationUpdated", data, timestamp: Date.now()})
            );
        });
        companyChannel.bind("PricingUpdated", (data: PricingUpdatedPayload) => {
            dispatch(
                addPusherEventLegacy({entities: "pricingUpdated", data, timestamp: Date.now()})
            );
        });
        companyChannel.bind(
            "ShipperFinalPriceUpdated",
            (data: ShipperFinalPriceUpdatedPayload) => {
                dispatch(
                    addPusherEventLegacy({
                        entities: "shipperFinalPriceUpdated",
                        data,
                        timestamp: Date.now(),
                    })
                );
            }
        );
        companyChannel.bind(
            "EstimatedDistanceUpdated",
            (data: EstimatedDistanceUpdatedPayload) => {
                dispatch(
                    fetchUpdateTransportDistances(
                        data.transport_uid,
                        data.estimated_distance,
                        data.segment_distances
                    )
                );
            }
        );

        companyChannel.bind("InvoiceFileUpdated", (data: InvoiceFileUpdatedPayload) => {
            dispatch(fetchInvoiceFileUpdatedEvent(data));
        });

        companyChannel.bind(
            "InvoiceCommunicationStatusUpdated",
            (data: InvoiceCommunicationStatusPayload) => {
                dispatch(fetchInvoiceCommunicationStatusUpdatedEvent(data));
            }
        );
        companyChannel.bind("CreditNoteFileUpdated", (data: CreditNoteFileUpdatedPayload) => {
            dispatch(fetchCreditNoteFileUpdatedEvent(data));
        });

        companyChannel.bind(
            "CreditNoteCommunicationStatusUpdated",
            (data: CreditNoteCommunicationStatusPayload) => {
                dispatch(fetchCreditNoteCommunicationStatusUpdatedEvent(data));
            }
        );
        companyChannel.bind(
            "ConfirmationDocumentsCountsUpdated",
            (data: ConfirmationDocumentsCounts) => {
                dispatch({type: "CONFIRMATION_DOCUMENTS_COUNTS_UPDATED", response: data});
            }
        );
        companyChannel.bind("invoice", (data: InvoicePayload) => {
            dispatch(fetchInvoiceUpdatedEvent(data));
        });
        companyChannel.bind("creditNote", (data: CreditNotePayload) => {
            dispatch(fetchCreditNoteUpdatedEvent(data));
        });
    }
    if (!userChannel) {
        userChannel = pusher.subscribe(`user_${userPk}`);

        userChannel.unbind();

        userChannel.bind("switch-company", (data: any) => {
            if (
                !storeService.getState<RootState>().loading.switchCompany &&
                data.new_company_pk !== companyPk
            ) {
                // reload the current page to avoid issues when your manager has switched companies
                window.location.replace("/app/?reload_after_company_switch=true");
            }
        });

        userChannel.bind(
            "bulk-delete-transports",
            (data: {success: boolean; deleted: {count: number}; cancelled: {count: number}}) =>
                dispatch(
                    addPusherEventLegacy({
                        entities: "bulkDeleteTransports",
                        data,
                        timestamp: Date.now(),
                    })
                )
        );

        userChannel.bind(
            "invite-codes",
            (data: {
                success?: boolean;
                error?: boolean;
                trucker_pk: number;
                trucker_name: string;
                done?: boolean;
            }) =>
                dispatch(
                    addPusherEventLegacy({entities: "inviteCodes", data, timestamp: Date.now()})
                )
        );

        userChannel.bind(
            "exports",
            (data: {success: true; export: Export; task?: {id: string; status: string}}) => {
                dispatch(addPusherEventLegacy({entities: "exports", data, timestamp: Date.now()}));
                dispatch(addPusherEvent({entities: "exports", data, timestamp: Date.now()}));
            }
        );
    }
}

function cleanup() {
    companyChannel = null;
    userChannel = null;
    if (pusherClient) {
        pusherClient.unbind_all();
        pusherClient = null;
    }
}

function subscribeToExportChannel(channelSuffix: string, dispatch: (...args: any[]) => any) {
    const pusher = getClient();
    const exportChannel = pusher.subscribe(`export_${channelSuffix}`);
    exportChannel.bind("exports", (data: {success: boolean; export: Export}) =>
        dispatch(addPusherEventLegacy({entities: "exports", data, timestamp: Date.now()}))
    );
    return exportChannel;
}

export const realtimeService = {
    setup,
    subscribeToExportChannel,
    cleanup,
};
