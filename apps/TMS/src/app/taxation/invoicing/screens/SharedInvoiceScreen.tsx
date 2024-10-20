import {SimpleNavbar, isAuthenticated} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, LoadingOverlay, Text} from "@dashdoc/web-ui";
import {PublicScreen, PublicScreenContent} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useEffect} from "react";
import {RouteChildrenProps} from "react-router";

import {fetchRetrieveInvoice, fetchRetrieveSharedInvoice} from "app/redux/actions/invoices";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getInvoice} from "app/redux/reducers";
import {isFullInvoice} from "app/services/invoicing/invoice.service";
import {InvoiceScreen} from "app/taxation/invoicing/screens/InvoiceScreen";

export const SharedInvoiceScreen: FunctionComponent<RouteChildrenProps<{invoiceUid: string}>> = ({
    history,
    match: {
        // @ts-ignore
        params: {invoiceUid},
    },
}) => {
    const isAuth = useSelector(isAuthenticated);
    const [isLoading, , setIsNotLoading] = useToggle(true);
    const sharedInvoice = useSelector((state) => getInvoice(state, invoiceUid));
    const dispatch = useDispatch();

    const retrieveSharedInvoice = async () => {
        try {
            await dispatch(fetchRetrieveSharedInvoice(invoiceUid));

            // If the user is authenticated, try to fetch the private invoice
            if (isAuth) {
                await dispatch(fetchRetrieveInvoice(invoiceUid));

                // Redirect to invoice detail screen on success
                return history.replace(`/app/invoices/${invoiceUid}`);
            }
            setIsNotLoading();
        } catch (error) {
            setIsNotLoading();
        }
    };

    // Fetch shared invoice on mount
    useEffect(() => {
        if (!sharedInvoice || !isFullInvoice(sharedInvoice)) {
            retrieveSharedInvoice();
        } else {
            setIsNotLoading();
        }
    }, []);

    if (
        isLoading ||
        // Once loading is complete, the invoice should never be partial
        // but adding this here provides type narrowing for the rest of the function,
        // so `sharedInvoice` will be of type `Invoice` instead of `Invoice | PartialInvoice`.
        (sharedInvoice && !isFullInvoice(sharedInvoice))
    ) {
        return <LoadingOverlay />;
    }

    if (!sharedInvoice) {
        return (
            <Flex height="100%" flexDirection="column" justifyContent="center" alignItems="center">
                <Text variant="title" as="h4" mb={3}>
                    {t("sharedInvoice.errors.invoiceNotFound")}
                </Text>
            </Flex>
        );
    }

    return (
        <PublicScreen>
            <PublicScreenContent>
                <SimpleNavbar logo={sharedInvoice.created_by.settings_logo} />
                <InvoiceScreen fromSharing />
            </PublicScreenContent>
        </PublicScreen>
    );
};
