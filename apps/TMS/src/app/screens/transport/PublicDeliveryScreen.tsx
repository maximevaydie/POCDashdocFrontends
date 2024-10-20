import {SimpleNavbar, isAuthenticated} from "@dashdoc/web-common";
import {cookiesService, t} from "@dashdoc/web-core";
import {Flex, LoadingOverlay, Text} from "@dashdoc/web-ui";
import {PublicScreen, PublicScreenContent} from "@dashdoc/web-ui";
import React, {FunctionComponent, useEffect, useState} from "react";
import {RouteChildrenProps} from "react-router";
import {Link} from "react-router-dom";

import {TransportDetails} from "app/features/transport/transport-details/TransportDetails";
import {fetchRetrievePublicDelivery, fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTransport} from "app/redux/reducers";

import type {Transport} from "app/types/transport";

export const PublicDeliveryScreen: FunctionComponent<
    RouteChildrenProps<{deliveryUid: string}>
> = ({
    history,
    match: {
        // @ts-ignore
        params: {deliveryUid},
    },
}) => {
    const isAuth = useSelector(isAuthenticated);
    const [isLoading, setIsLoading] = useState(true);
    const [publicTransport, setPublicTransport] = useState<Transport>();

    const dispatch = useDispatch();

    // fetch public transport on mount
    useEffect(() => {
        const fetchPublicTransport = async () => {
            try {
                const {type, response} = await dispatch(fetchRetrievePublicDelivery(deliveryUid));
                if (type !== "RETRIEVE_ENTITIES_SUCCESS") {
                    setIsLoading(false);
                } else {
                    const {result: transportUid} = response;
                    const transport: Transport = getFullTransport(response, transportUid);
                    setPublicTransport(transport);

                    // if user is authenticated, try to fetch the private transport
                    if (isAuth) {
                        const {type} = await dispatch(fetchRetrieveTransport(transportUid));
                        // and redirect to transport details screen on success
                        if (type === "RETRIEVE_ENTITIES_SUCCESS") {
                            history.replace(`/app/transports/${transportUid}`);
                        } else {
                            // or display the public transport on failure
                            setIsLoading(false);
                        }
                    } else {
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                setIsLoading(false);
            }
        };

        fetchPublicTransport();
    }, []);

    if (isLoading) {
        return <LoadingOverlay />;
    }

    if (!publicTransport || publicTransport.business_privacy) {
        return (
            <Flex height="100%" flexDirection="column" justifyContent="center" alignItems="center">
                <Text variant="title" as="h4" mb={3}>
                    {t("publicDelivery.errors.transportNotFound")}
                </Text>
                <Link to="/app/">{t("app.back")}</Link>
            </Flex>
        );
    }

    return (
        <PublicScreen>
            <PublicScreenContent>
                <SimpleNavbar
                    logo={publicTransport?.created_by?.settings_logo}
                    showLanguageSelector
                    onLanguageChange={cookiesService.setLanguageCookieAndReload}
                />
                <TransportDetails transport={publicTransport} isDelivery={true} company={null} />
            </PublicScreenContent>
        </PublicScreen>
    );
};
