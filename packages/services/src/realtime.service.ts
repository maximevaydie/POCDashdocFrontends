import {PusherKey, apiService, storeService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import Pusher from "pusher-js";
import {RootState} from "redux/reducers";
import {
    createSingleSlot,
    deleteSingleSlot,
    updateSingleSlot,
} from "redux/reducers/flow/slot.slice";
import {fetchSlotEvents} from "redux/reducers/flow/slotEvents.slice";
import {Slot} from "types";

// Enable pusher logging - don't include this in production
// @ts-ignore
Pusher.logToConsole = import.meta.env.DEV;

let pusherClient: Pusher | null = null;

let userChannel: any = null;

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
            channelAuthorization: {
                transport: "ajax",
                endpoint: "",
                customHandler: async (payload, callback) => {
                    try {
                        const {channelName, socketId} = payload;
                        const response = await apiService.post(
                            "/api/web/realtime/authorize/",
                            {channel_name: channelName, socket_id: socketId},
                            {basePath: null, apiVersion: null}
                        );
                        if ("auth" in response && "channel_data" in response) {
                            callback(null, response);
                        } else {
                            const error = new Error(
                                "Error during the pusher authorization (missing auth or user_data)"
                            );
                            Logger.error(error.message, response);
                            callback(error, null);
                        }
                    } catch (e) {
                        const error = new Error(
                            "Error during the pusher authorization: " + e?.message
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
    sitePk: number | undefined
) {
    if (!userPk || !sitePk) {
        return;
    }
    const pusher = getClient();

    if (!userChannel) {
        userChannel = pusher.subscribe(`user_${userPk}_${sitePk}`);
        userChannel.unbind();

        userChannel.bind("flow-slot-create", (data: Slot) => dispatch(createSingleSlot(data)));
        userChannel.bind("flow-slot-update", (data: Slot) => {
            dispatch(updateSingleSlot(data));
            //FIXME: this is a temporary fix to update the slot events when the slot is updated (a dedicated channel should be used instead)
            const state = storeService.getState<RootState>();
            if (state.flow.slotEvents.entities[data.id] !== undefined) {
                dispatch(fetchSlotEvents({slot: data.id, force: true}));
            }
        });
        userChannel.bind("flow-slot-delete", (data: {id: number}) =>
            dispatch(deleteSingleSlot(data.id))
        );
    }
}

function cleanup() {
    userChannel = null;
    if (pusherClient) {
        pusherClient.unbind_all();
        pusherClient = null;
    }
}

function subscribeOn(siteId: number) {
    const pusher = getClient();
    const sitePresenceChannel = pusher.subscribe(`presence-flowsite-${siteId}`);
    return sitePresenceChannel;
}

export const realtimeService = {
    setup,
    subscribeOn,
    cleanup,
};
