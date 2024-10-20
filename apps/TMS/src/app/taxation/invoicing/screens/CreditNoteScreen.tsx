import {ErrorBoundary, NotFoundScreen, useFeatureFlag} from "@dashdoc/web-common";
import {Logger, SupportedLocale, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    CommonScreen,
    Flex,
    IconButton,
    LoadingWheel,
    SidePanelProvider,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect} from "react";
import {useHistory, useParams} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {CreditNoteContextProvider} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {loadInvoicingConnectorAuthenticated} from "app/redux/actions";
import {fetchRetrieveCreditNote, fetchUpdateCreditNote} from "app/redux/actions/creditNotes";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getCreditNote} from "app/redux/reducers";
import {CreditNoteActionsButtons} from "app/taxation/invoicing/features/credit-note/actions/CreditNoteActionsButtons";
import {CreditNoteInfo} from "app/taxation/invoicing/features/credit-note/credit-note-info/CreditNoteInfo";
import {CreditNoteContent} from "app/taxation/invoicing/features/credit-note/CreditNoteContent";
import {CreditNoteDetailRecap} from "app/taxation/invoicing/features/credit-note/CreditNoteDetailRecap";
import {CreditNoteFile} from "app/taxation/invoicing/features/credit-note/CreditNoteFile";
import {DraftCreditNoteSettings} from "app/taxation/invoicing/features/credit-note/DraftCreditNoteSettings";
import {LinkToInvoice} from "app/taxation/invoicing/features/credit-note/LinkToInvoice";
import {LinkToReInvoiceTransports} from "app/taxation/invoicing/features/credit-note/LinkToReInvoiceTransports";
import {InvoiceOrCreditNoteHeader} from "app/taxation/invoicing/features/invoice-or-credit-note/InvoiceOrCreditNoteHeader";
import {validateCreditNoteOrRaise} from "app/taxation/invoicing/types/creditNote.types";
import {SidebarTabNames} from "app/types/constants";

type CreditNoteDetailScreenProps = {
    creditNoteUid?: string;
    fromSharing?: boolean;
    fromFloatingPanel?: boolean;
    onEditInvoice?: (uid: string | null) => void;
    onReInvoiceTransports?: (creditNoteNumber: string) => void;
    afterDeleteCallback?: () => void;
    afterUpdateCallback?: () => void;
    displayBackToInvoice: boolean;
};

export const CreditNoteScreen: FunctionComponent<CreditNoteDetailScreenProps> = ({
    creditNoteUid: creditNoteUidFromProps,
    fromSharing = false,
    fromFloatingPanel = false,
    onEditInvoice,
    onReInvoiceTransports,
    displayBackToInvoice,
    afterDeleteCallback,
    afterUpdateCallback,
}) => {
    const hasFuelSurchargeInFooterEnabled = useFeatureFlag("fuelSurchargeInInvoiceFooter");
    const match = useParams<{creditNoteUid?: string}>();
    const history = useHistory();
    const creditNoteUidFromUrl = match?.creditNoteUid;
    const creditNoteUid = creditNoteUidFromProps || creditNoteUidFromUrl;
    const dispatch = useDispatch();
    // aborted in the action if already loading/loaded
    dispatch(loadInvoicingConnectorAuthenticated());
    const creditNote = useSelector((state) => {
        try {
            return validateCreditNoteOrRaise(getCreditNote(state, creditNoteUid));
        } catch (e) {
            return null;
        }
    });
    const [isLoading, setIsLoading, setIsNotLoading] = useToggle(
        !creditNote || creditNote.is_list_element
    );

    const fetchCreditNote = useCallback(async () => {
        if (!creditNoteUid) {
            toast.error(t("common.error"));
            return;
        }

        try {
            await dispatch(fetchRetrieveCreditNote(creditNoteUid));
        } catch (e) {
            Logger.error(`Credit Note with uid "${creditNoteUid}" not found;`);
        }
        setIsNotLoading();
    }, [creditNoteUid, dispatch, setIsNotLoading]);

    async function setLanguage(language: SupportedLocale) {
        if (!creditNote) {
            return;
        }

        setIsLoading();
        try {
            await dispatch(fetchUpdateCreditNote(creditNote.uid, {language}));
        } catch (e) {
            toast.error(t("common.error"));
            Logger.error(`Failed to set credit note language to "${language}";`);
        }
        setIsNotLoading();
        fetchCreditNote();
    }

    useEffect(() => {
        fetchCreditNote();
    }, []);

    if (isLoading || (creditNote && creditNote.is_list_element)) {
        return <LoadingWheel />;
    } else if (!creditNote) {
        return <NotFoundScreen />;
    }

    const showReinvoiceLink =
        !fromSharing &&
        !!creditNote.document_number &&
        (creditNote.line_groups.length > 0 || creditNote.transports_groups_in_invoice.length > 0);

    const WrapperComponent = fromFloatingPanel ? Box : SidePanelProvider;

    function goToGeneratedFromInvoice() {
        if (!creditNote || !creditNote.generated_from) {
            return;
        }
        const invoiceUid = creditNote.generated_from.uid;
        if (onEditInvoice) {
            onEditInvoice(invoiceUid);
        } else {
            history.push(`/app/invoices/${invoiceUid}`);
        }
    }

    const handleAfterDelete = afterDeleteCallback ?? goToGeneratedFromInvoice;
    return (
        <WrapperComponent>
            <ErrorBoundary>
                <Flex justifyContent="center" width="100%">
                    <CommonScreen
                        data-testid="credit-note-screen"
                        title={getTabTranslations(SidebarTabNames.INVOICE)}
                        customTitle={
                            creditNote.document_number
                                ? t("creditNoteDetails.documentNumber", {
                                      number: creditNote.document_number,
                                  })
                                : t("common.creditNote")
                        }
                        getCustomTitleWrapper={(title) => (
                            <InvoiceOrCreditNoteHeader
                                item={creditNote}
                                fromSharing={fromSharing}
                                title={
                                    <Flex>
                                        {!fromSharing &&
                                            displayBackToInvoice &&
                                            creditNote.generated_from && (
                                                <IconButton
                                                    name="arrowLeft"
                                                    mr={1}
                                                    scale={[1.3, 1.3]}
                                                    color="grey.dark"
                                                    onClick={goToGeneratedFromInvoice}
                                                />
                                            )}
                                        {title}
                                    </Flex>
                                }
                                type="creditNote"
                                fromFloatingPanel={fromFloatingPanel}
                            />
                        )}
                        actions={
                            <CreditNoteActionsButtons
                                creditNote={creditNote}
                                fromSharing={fromSharing}
                                onDelete={handleAfterDelete}
                                setIsLoading={setIsLoading}
                                setIsNotLoading={setIsNotLoading}
                            />
                        }
                        shrinkScreen={fromFloatingPanel}
                    >
                        <Box className="container-fluid" p={0}>
                            {creditNote.generated_from && creditNote.status === "draft" ? (
                                <Callout variant="warning" mb={3}>
                                    {t("draftCreditNote.generatedFrom")}{" "}
                                    <LinkToInvoice
                                        generatedFromInvoice={creditNote.generated_from}
                                        onEditInvoice={onEditInvoice}
                                        fromSharing={fromSharing}
                                    />
                                    {". "}
                                    {t("draftCreditNote.consequences")}
                                </Callout>
                            ) : (
                                creditNote.generated_from && (
                                    <Callout variant="secondary" mb={3}>
                                        <Text as={showReinvoiceLink ? "li" : undefined}>
                                            {t("creditNote.appliedOnInvoice")}{" "}
                                            <LinkToInvoice
                                                generatedFromInvoice={creditNote.generated_from}
                                                onEditInvoice={onEditInvoice}
                                                fromSharing={fromSharing}
                                            />
                                            {"."}
                                        </Text>
                                        {showReinvoiceLink && (
                                            <Text as="li">
                                                {t("creditNote.reinvoiceTransports.explanations")}{" "}
                                                <LinkToReInvoiceTransports
                                                    creditNoteDocumentNumber={
                                                        creditNote.document_number as string
                                                    }
                                                    onReInvoiceTransports={onReInvoiceTransports}
                                                />
                                            </Text>
                                        )}
                                    </Callout>
                                )
                            )}

                            {creditNote.status === "draft" &&
                                !fromSharing &&
                                !hasFuelSurchargeInFooterEnabled && (
                                    <DraftCreditNoteSettings
                                        creditNote={creditNote}
                                        onSetLanguage={setLanguage}
                                    />
                                )}

                            <CreditNoteDetailRecap
                                creditNote={creditNote}
                                fromSharing={fromSharing}
                            />

                            <CreditNoteContextProvider
                                creditNote={creditNote}
                                fromSharing={fromSharing}
                            >
                                <CreditNoteContent afterUpdateCallback={afterUpdateCallback} />
                            </CreditNoteContextProvider>

                            <CreditNoteFile
                                creditNoteUid={creditNote.uid}
                                file={creditNote.file}
                            />
                        </Box>
                    </CommonScreen>
                    <CreditNoteInfo creditNote={creditNote} />
                </Flex>
            </ErrorBoundary>
        </WrapperComponent>
    );
};
