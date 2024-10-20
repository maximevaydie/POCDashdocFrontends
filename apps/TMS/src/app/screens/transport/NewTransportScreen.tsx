import {apiService, useFeatureFlag, type PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, LoadingWheel, Screen} from "@dashdoc/web-ui";
import React, {useEffect, useMemo, useRef, useState} from "react";
import Helmet from "react-helmet";
import {useLocation} from "react-router";

import {TransportForm} from "app/features/transport/transport-form/TransportForm";
import {useDispatch} from "app/redux/hooks";
import {usePartner} from "app/screens/address-book/hooks/usePartner";

import type {Address} from "dashdoc-utils";

export type NewTransportScreenProps = {
    submitType?: "new" | "edit";
    isCreatingTemplate?: boolean;
    isDuplicating?: boolean;
    transportType?: "order" | "transport";
};

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function NewTransportScreen(props: NewTransportScreenProps) {
    const queryParams = useQuery();
    const initialShipperPk = queryParams.get("shipperPk");
    const initialShipperAddressPk = queryParams.get("shipperAddressPk");
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    if (!hasBetterCompanyRolesEnabled) {
        return (
            <NewTransportScreenDeprecated
                {...props}
                initialShipperAddressPk={initialShipperAddressPk}
            />
        );
    }

    if (!initialShipperPk) {
        return <NewTransportScreenWithPartner {...props} />;
    }
    return (
        <NewTransportScreenWithPartnerLoader
            {...props}
            initialShipperPk={parseInt(initialShipperPk)}
        />
    );
}

function NewTransportScreenWithPartnerLoader({
    initialShipperPk,
    ...props
}: NewTransportScreenProps & {initialShipperPk: number}) {
    const {partner, loading} = usePartner(initialShipperPk);

    const getTitle = () => {
        if (props.isCreatingTemplate) {
            return t("transportTemplates.newTemplateTitle");
        }
        return t("common.newTransport");
    };

    if (loading) {
        return (
            <Screen>
                <Helmet>
                    <title>{getTitle()} · Dashdoc</title>
                </Helmet>
                <LoadingWheel />
            </Screen>
        );
    }

    return <NewTransportScreenWithPartner {...props} initialShipper={partner ?? undefined} />;
}

function NewTransportScreenWithPartner({
    submitType,
    isCreatingTemplate,
    isDuplicating = false,
    transportType = "transport",
    initialShipper,
}: NewTransportScreenProps & {initialShipper?: PartnerDetailOutput}) {
    const queryParams = useQuery();
    const isComplex = queryParams.get("complex") === "true";
    const isOrder = transportType == "order";

    const initialValues = useMemo(() => {
        return {
            initialShipper,
        };
    }, [initialShipper]);

    return (
        <Box height="100%" overflowY="hidden" data-testid="transport-from-screen">
            <Box height={"100%"} pt={5} overflowY={"hidden"}>
                <TransportForm
                    key={isComplex ? "complex" : "simple"} // To reset the form when switching between complex and simple modes
                    isComplex={isComplex}
                    isOrder={isOrder}
                    isCreatingTemplate={isCreatingTemplate}
                    isDuplicating={isDuplicating}
                    initialValues={initialValues}
                    submitType={submitType}
                />
            </Box>
        </Box>
    );
}

/**
 * @deprecated to remove with betterCompanyRoles FF
 */
export function NewTransportScreenDeprecated({
    submitType,
    isCreatingTemplate,
    isDuplicating = false,
    transportType = "transport",
    initialShipperAddressPk,
}: NewTransportScreenProps & {initialShipperAddressPk: string | null}) {
    const queryParams = useQuery();
    const isComplex = queryParams.get("complex") === "true";
    const [isLoading, setIsLoading] = useState(!!initialShipperAddressPk);

    const dispatch = useDispatch();

    const isOrder = transportType == "order";

    let initialValuesRef = useRef<{
        initialShipperAddress: Address | undefined;
    }>({initialShipperAddress: undefined});

    useEffect(() => {
        async function fetchData() {
            if (!initialShipperAddressPk) {
                initialValuesRef.current.initialShipperAddress = undefined;
                setIsLoading(false);
                return;
            }
            try {
                const retrievedAddress = await apiService.Addresses.get(initialShipperAddressPk);
                initialValuesRef.current.initialShipperAddress = retrievedAddress;
                setIsLoading(false);
            } catch (e) {
                initialValuesRef.current.initialShipperAddress = undefined;
                setIsLoading(false);
            }
        }
        fetchData();
    }, [dispatch, initialShipperAddressPk]);

    const getTitle = () => {
        if (isCreatingTemplate) {
            return t("transportTemplates.newTemplateTitle");
        }
        return t("common.newTransport");
    };

    if (isLoading) {
        return (
            <Screen>
                <Helmet>
                    <title>{getTitle()} · Dashdoc</title>
                </Helmet>
                <LoadingWheel />
            </Screen>
        );
    }

    return (
        <Box height="100%" overflowY="hidden" data-testid="transport-from-screen">
            <Box height={"100%"} pt={5} overflowY={"hidden"}>
                <TransportForm
                    key={isComplex ? "complex" : "simple"} // To reset the form when switching between complex and simple modes
                    isComplex={isComplex}
                    isOrder={isOrder}
                    isCreatingTemplate={isCreatingTemplate}
                    isDuplicating={isDuplicating}
                    initialValues={initialValuesRef.current}
                    submitType={submitType}
                />
            </Box>
        </Box>
    );
}
