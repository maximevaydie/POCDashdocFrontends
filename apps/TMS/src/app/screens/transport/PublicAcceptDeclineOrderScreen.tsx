import {ErrorBoundary, authService, getConnectedManager} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Flex, LoadingOverlay, Text} from "@dashdoc/web-ui";
import {PublicScreen, PublicScreenContent} from "@dashdoc/web-ui";
import React, {FunctionComponent, useEffect, useState} from "react";
import {RouteChildrenProps} from "react-router";
import {Link} from "react-router-dom";

import {ActionableExtendedViewContext} from "app/common/ActionableExtendedViewContext";
import {TransportDetails} from "app/features/transport/transport-details/TransportDetails";
import {fetchRetrievePublicTransport, fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTransport} from "app/redux/reducers";

import type {Transport} from "app/types/transport";

export const PublicAcceptDeclineOrderScreen: FunctionComponent<
    RouteChildrenProps<{transportUid: string}>
> = ({
    history,
    match: {
        // @ts-ignore
        params: {transportUid},
    },
}) => {
    type LoadingState = "loading" | "idle" | "error";
    const manager = useSelector(getConnectedManager);
    const [hasRefreshed, setHasRefreshed] = useState(false);
    const [loadingState, setLoadingState] = useState<LoadingState>("loading");
    const [publicTransport, setPublicTransport] = useState<null | Transport>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        let unmounting = false;

        const guardedSetLoadingState = (value: LoadingState) => {
            if (!unmounting) {
                setLoadingState(value);
            }
        };

        const guardedSetPublicTransport = (transport: Transport) => {
            if (!unmounting) {
                setPublicTransport(transport);
            }
        };

        const asyncGuardedFetchAuthenticatedTransport = async (uidTransport: string) => {
            if (!unmounting) {
                // if user is authenticated, try to fetch the private transport
                const {type} = await dispatch(fetchRetrieveTransport(uidTransport));
                // and redirect to transport details screen on success
                if (type === "RETRIEVE_ENTITIES_SUCCESS") {
                    unmounting = true;
                    history.replace(`/app/transports/${uidTransport}`);
                }
            }
        };

        const asyncGuardedGetFullPublicTransport = async (uidTransport: string) => {
            if (!unmounting) {
                const {type, response} = await dispatch(
                    fetchRetrievePublicTransport(uidTransport)
                );
                if (type !== "RETRIEVE_ENTITIES_SUCCESS") {
                    return null;
                } else {
                    const {result: uidTransport} = response;
                    return getFullTransport(response, uidTransport);
                }
            }
        };

        const asyncEffectMain = async () => {
            try {
                await asyncGuardedFetchAuthenticatedTransport(transportUid);
            } catch {
                guardedSetLoadingState("loading");
            }

            const publicToken = queryService.getQueryParameterByName("public_token");
            if (publicToken) {
                authService.setPublicTokenForRestrictedDashdocAPIAccess(publicToken);
            }

            // if we're here we couldn't get access to the transport as a logged in user.
            // or else we would have been redirected to the transport's detail page.
            try {
                const transport = await asyncGuardedGetFullPublicTransport(transportUid);
                guardedSetPublicTransport(transport);
                guardedSetLoadingState("idle");
            } catch {
                guardedSetLoadingState("error");
                return;
            }
        };

        asyncEffectMain();

        return () => {
            unmounting = true;
        };
    }, [transportUid, hasRefreshed]);

    if (loadingState == "loading") {
        return <LoadingOverlay />;
    } else if (loadingState == "error" || publicTransport === null) {
        return (
            <Flex height="100%" flexDirection="column" justifyContent="center" alignItems="center">
                <Text variant="title" as="h4" mb={3}>
                    {t("publicDelivery.errors.transportNotFound")}
                </Text>
                <Link to="/app/">{t("app.back")}</Link>
            </Flex>
        );
    } else {
        return (
            <PublicScreen>
                <PublicScreenContent>
                    <ErrorBoundary manager={manager} moderationLink={`transports/${transportUid}`}>
                        <ActionableExtendedViewContext.Provider value={true}>
                            <TransportDetails
                                transport={publicTransport}
                                company={null}
                                refetchTransports={() => {
                                    setHasRefreshed(true);
                                }}
                            />
                        </ActionableExtendedViewContext.Provider>
                    </ErrorBoundary>
                </PublicScreenContent>
            </PublicScreen>
        );
    }
};
