import {SimpleNavbar, isAuthenticated} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, LoadingOverlay, Text} from "@dashdoc/web-ui";
import {PublicScreen, PublicScreenContent} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useEffect} from "react";
import {RouteChildrenProps} from "react-router";

import {
    fetchRetrieveCreditNote,
    fetchRetrieveSharedCreditNote,
} from "app/redux/actions/creditNotes";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getCreditNote} from "app/redux/reducers";
import {CreditNoteScreen} from "app/taxation/invoicing/screens/CreditNoteScreen";
import {validateCreditNoteOrRaise} from "app/taxation/invoicing/types/creditNote.types";

export const SharedCreditNoteScreen: FunctionComponent<
    RouteChildrenProps<{creditNoteUid: string}>
> = ({
    history,
    match: {
        // @ts-ignore
        params: {creditNoteUid},
    },
}) => {
    const isAuth = useSelector(isAuthenticated);
    const [isLoading, , setIsNotLoading] = useToggle(true);
    const sharedCreditNote = useSelector((state) => {
        try {
            return validateCreditNoteOrRaise(getCreditNote(state, creditNoteUid));
        } catch (e) {
            return null;
        }
    });
    const dispatch = useDispatch();

    const retrieveSharedCreditNote = async () => {
        try {
            await dispatch(fetchRetrieveSharedCreditNote(creditNoteUid));
            // If the user is authenticated, try to fetch the private invoice
            if (isAuth) {
                await dispatch(fetchRetrieveCreditNote(creditNoteUid));

                // Redirect to invoice detail screen on success
                return history.replace(`/app/credit-notes/${creditNoteUid}`);
            }
            setIsNotLoading();
        } catch (error) {
            setIsNotLoading();
        }
    };

    // Fetch shared invoice on mount
    useEffect(() => {
        if (!sharedCreditNote) {
            retrieveSharedCreditNote();
        } else {
            setIsNotLoading();
        }
    }, []);

    if (isLoading) {
        return <LoadingOverlay />;
    }

    if (!sharedCreditNote) {
        return (
            <Flex height="100%" flexDirection="column" justifyContent="center" alignItems="center">
                <Text variant="title" as="h4" mb={3}>
                    {t("sharedCreditNote.errors.creditNoteNotFound")}
                </Text>
            </Flex>
        );
    }

    return (
        <PublicScreen>
            <PublicScreenContent>
                <SimpleNavbar logo={sharedCreditNote.created_by.settings_logo} />
                <CreditNoteScreen fromSharing displayBackToInvoice={false} />
            </PublicScreenContent>
        </PublicScreen>
    );
};
