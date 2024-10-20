import {guid} from "@dashdoc/core";
import {useTimezone} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {ConfirmationModal, Flex, FloatingPanel, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {useInvoiceOrFreeTransportEventHandle} from "app/features/pricing/invoices/invoice-transports-flow/transports-to-invoice/useInvoiceOrFreeTransportEventHandle";
import {MergeInfoDisabledModal} from "app/features/pricing/MergeInfoDisabledModal";
import {fetchBulkInvoiceTransports} from "app/redux/actions";
import {RootState} from "app/redux/reducers/index";
import {TransportScreen} from "app/screens/transport/TransportScreen";
import {BulkCreateInvoicesResponse} from "app/services/invoicing";
import {getTransportTotalInvoicedPrice} from "app/services/invoicing/pricing.service";
import {useRefreshInvoices} from "app/taxation/invoicing/hooks/useRefreshInvoices";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";
import {TransportsToInvoiceQuery} from "app/types/transport";

import TransportsInvoiceability from "./transports-invoiceability/transports-invoiceability";
import {TransportsToInvoice} from "./transports-to-invoice/TransportsToInvoice";

import type {Transport} from "app/types/transport";

type SelectTransportsStep = {step: "SELECT_TRANSPORTS"};
type CheckTransportsInvoiceabilityStep = {
    step: "CHECK_TRANSPORTS_INVOICEABILITY";
};

type InvoiceTransportsFlowStep = SelectTransportsStep | CheckTransportsInvoiceabilityStep;

type InvoiceTransportsFlowProps = {
    currentTransportsQuery: TransportsToInvoiceQuery;
    transports: Transport[];
    isLoadingTransports: boolean;
    totalTransportsCount: number;
    onPoolOfTransportsEndReached: () => void;
    updateTransportsQuery: (query: TransportsToInvoiceQuery) => void;
    resetTransportsQuery: () => void;
    reloadTransportsFetch: (reset?: boolean) => void;
    reloadInvoices: () => void;
    setPreviewInvoice: (invoiceUid: Invoice["uid"]) => void;
};

// @guidedtour[epic=invoicing, seq=2] The invoice transports flow panel
// Once controlled, a transport can be invoiced.
// It then appear in the _transport to invoice_ list, that displays in the
// `InvoiceTransportsFlow` component, a panel on the right of the _invoices_ screen
// that acts as an invoicing assistant.
//
// When the user clicks on the _invoice_ button, a draft invoice is created by copying
// all pricing lines into invoice lines.
// An invoice can be created from multiple transports, as long as the debtor is the same.
//
// From this screen, the user can edit a draft invoice, change the gas index, add some transports
// And then finalize the invoice, creating the final invoice in the third party.

export const InvoiceTransportsFlow: FunctionComponent<InvoiceTransportsFlowProps> = ({
    currentTransportsQuery,
    transports,
    isLoadingTransports,
    totalTransportsCount,
    onPoolOfTransportsEndReached,
    updateTransportsQuery,
    resetTransportsQuery,
    reloadTransportsFetch,
    reloadInvoices,
    setPreviewInvoice,
}) => {
    const [currentStep, setStep] = useState<InvoiceTransportsFlowStep>({
        step: "SELECT_TRANSPORTS",
    });
    const [transportsInvoiceabilityKey, setTransportsInvoiceabilityKey] = useState("_");

    const [mergingInfoDisabled, showMergingInfoDisabled, hideMergingInfoDisabled] = useToggle();
    const [transportsInvoiced, setTransportsInvoiced] = useState<BulkCreateInvoicesResponse>();

    const dispatch = useDispatch();
    const timezone = useTimezone();
    const refreshInvoices = useRefreshInvoices();

    const [selectedTransports, setSelectedTransports] = useState<Set<Transport["uid"]>>(
        new Set([])
    );
    const [selectedTransportsPriceCache, setSelectedTransportsPriceCache] = useState<
        Record<Transport["uid"], number | null>
    >({});
    /**Update the price cache only if it needs to */
    const updateSelectedTransportsPriceCache = (
        updatesInfo: {
            uid: Transport["uid"];
            price: number | null;
        }[]
    ): void => {
        const cacheDoesNotChange = updatesInfo.every(
            ({uid, price}) => selectedTransportsPriceCache[uid] === price
        );
        if (cacheDoesNotChange) {
            return;
        }
        const newCache = {...selectedTransportsPriceCache};
        updatesInfo.forEach(({uid, price}) => {
            newCache[uid] = price;
        });
        setSelectedTransportsPriceCache(newCache);
    };
    const [allTransportsSelected, selectAllTransports, unselectAllTransports] = useToggle();

    const [previewedTransportUid, setPreviewedTransportUid] = useState<Transport["uid"] | null>(
        null
    );

    const {cancelTransportsToInvoiceReload} = useInvoiceOrFreeTransportEventHandle(
        () => reloadTransportsFetch(false),
        currentStep.step === "SELECT_TRANSPORTS" &&
            selectedTransports.size == 0 &&
            !allTransportsSelected
    );

    const handleSelectTransport = (
        transportUid: Transport["uid"],
        transportPrice: number | null
    ) => {
        updateSelectedTransportsPriceCache([{uid: transportUid, price: transportPrice}]);
        setSelectedTransports(
            (previousSelectedTransports) => new Set([...previousSelectedTransports, transportUid])
        );
    };

    const handleUnselectTransport = (transportUid: Transport["uid"]) => {
        unselectAllTransports();
        setSelectedTransports(
            (previousSelectedTransports) =>
                new Set([...previousSelectedTransports].filter((uid) => uid !== transportUid))
        );
    };

    const handleSelectAllVisibleTransports = (selected: boolean) => {
        unselectAllTransports();
        // Cache all the transports prices
        if (selected) {
            updateSelectedTransportsPriceCache(
                transports.map((transport) => ({
                    uid: transport.uid,
                    price: getTransportTotalInvoicedPrice(transport),
                }))
            );
        }
        const selectedTransportsUids = selected
            ? transports.map((transport) => transport.uid)
            : [];
        setSelectedTransports(new Set(selectedTransportsUids));
    };

    const goToCheckTransportsInvoiceabilityStep = () => {
        setStep({
            step: "CHECK_TRANSPORTS_INVOICEABILITY",
        });
    };

    const handleInvoiceTransports = async (
        transportUids: Transport["uid"][],
        ungroupInvoicesForTransportsUids: Transport["uid"][],
        transportsToAddToInvoices: Record<Invoice["uid"], Transport["uid"][]>
    ) => {
        try {
            const query = allTransportsSelected
                ? getTransportsQueryParamsFromFiltersQuery(currentTransportsQuery, timezone, true)
                : {uid__in: transportUids};

            const bulkCreateAction = await fetchBulkInvoiceTransports(
                query,
                ungroupInvoicesForTransportsUids,
                transportsToAddToInvoices
            )(dispatch);

            const response: BulkCreateInvoicesResponse = bulkCreateAction.response;
            if (response.warnings.reset_merge_by_invoices_uid.length > 0) {
                showMergingInfoDisabled();
            }

            setStep({step: "SELECT_TRANSPORTS"});
            setSelectedTransports(new Set());
            unselectAllTransports();
            setTransportsInvoiced(response);
            reloadTransportsFetch();
            cancelTransportsToInvoiceReload();
            refreshInvoices();
        } catch (error) {
            Logger.error("Error! Couldn't invoice transports.", error);
            toast.error(t("common.error"));
        }
    };

    const handleRemoveTransportsToInvoice = (transportUids: Transport["uid"][]) => {
        setSelectedTransports(
            (previousSelectedTransports) =>
                new Set(
                    [...previousSelectedTransports].filter(
                        (selectedTransportUid) => !transportUids.includes(selectedTransportUid)
                    )
                )
        );
    };

    const getInvoicedTransportsConfirmationMessage = () => {
        const baseOptions: {[key: string]: number} = {
            // @ts-ignore
            totalDraftInvoicesCreatedCount: transportsInvoiced.invoices.length,
            totalTransportsAddedToExistingDraftsCount:
                // @ts-ignore
                transportsInvoiced.transports_added_to_draft_count,
        };

        if (
            // @ts-ignore
            transportsInvoiced.invoices.length > 0 &&
            // @ts-ignore
            transportsInvoiced.transports_added_to_draft_count > 0
        ) {
            return t("invoicingFlow.hasInvoicedTransportsToNewAndExistingDrafts", {
                ...baseOptions,
                smart_count: baseOptions.totalDraftInvoicesCreatedCount,
            });
            // @ts-ignore
        } else if (transportsInvoiced.invoices.length > 0) {
            return t("invoicingFlow.hasInvoicedTransportsToNewDrafts", {
                ...baseOptions,
                smart_count: baseOptions.totalDraftInvoicesCreatedCount,
            });
            // @ts-ignore
        } else if (transportsInvoiced.transports_added_to_draft_count > 0) {
            return t("invoicingFlow.hasInvoicedTransportsToExistingDrafts", {
                ...baseOptions,
                smart_count: baseOptions.totalTransportsAddedToExistingDraftsCount,
            });
        } else {
            return "";
        }
    };

    const onBack = useCallback(() => setStep({step: "SELECT_TRANSPORTS"}), []);

    const _renderCurrentStepContent = () => {
        if (currentStep.step === "SELECT_TRANSPORTS") {
            return (
                <TransportsToInvoice
                    transports={transports}
                    transportsCount={totalTransportsCount}
                    loadingTransports={isLoadingTransports}
                    selectedTransports={selectedTransports}
                    currentQuery={currentTransportsQuery}
                    allTransportsSelected={allTransportsSelected}
                    selectedTransportPriceCache={selectedTransportsPriceCache}
                    onSelectTransport={handleSelectTransport}
                    onUnselectTransport={handleUnselectTransport}
                    onShowTransportPreview={setPreviewedTransportUid}
                    onSubmit={goToCheckTransportsInvoiceabilityStep}
                    onUpdateQuery={updateTransportsQuery}
                    onResetQuery={resetTransportsQuery}
                    onPoolOfTransportsEndReached={onPoolOfTransportsEndReached}
                    onSelectAllVisibleTransports={handleSelectAllVisibleTransports}
                    onSelectAllTransports={selectAllTransports}
                    setPreviewInvoice={setPreviewInvoice}
                />
            );
        }

        if (currentStep.step === "CHECK_TRANSPORTS_INVOICEABILITY") {
            return (
                <TransportsInvoiceability
                    selectedTransportsUids={selectedTransports}
                    loadingTransports={isLoadingTransports}
                    allTransportsSelected={allTransportsSelected}
                    allTransportsCount={totalTransportsCount}
                    currentQuery={currentTransportsQuery}
                    onBack={onBack}
                    onSubmit={handleInvoiceTransports}
                    onShowTransportPreview={setPreviewedTransportUid}
                    onRemoveFromInvoicing={handleRemoveTransportsToInvoice}
                    key={transportsInvoiceabilityKey}
                />
            );
        }

        return null;
    };

    const reloadTransportData = (invoicesCreated = false) => {
        reloadTransportsFetch();
        cancelTransportsToInvoiceReload();
        if (currentStep.step === "CHECK_TRANSPORTS_INVOICEABILITY") {
            // Force to check again transport invoiceability has data has been updated
            setTransportsInvoiceabilityKey(guid());
        }
        if (invoicesCreated) {
            if (previewedTransportUid) {
                handleUnselectTransport(previewedTransportUid);
                setPreviewedTransportUid(null);
            }
            reloadInvoices();
        }
    };

    return (
        <>
            <Flex
                flex={1}
                flexDirection="column"
                id="invoice-transports-flow-side-panel"
                position="relative"
            >
                {_renderCurrentStepContent()}
            </Flex>

            {previewedTransportUid && (
                <FloatingPanel
                    width={0.6}
                    minWidth={600}
                    onClose={() => setPreviewedTransportUid(null)}
                >
                    <TransportScreen
                        transportUid={previewedTransportUid}
                        reloadTransportsToInvoice={reloadTransportData}
                    />
                </FloatingPanel>
            )}
            {mergingInfoDisabled && <MergeInfoDisabledModal onClose={hideMergingInfoDisabled} />}
            {!mergingInfoDisabled && transportsInvoiced && (
                <TransportFlowConfirmationModal
                    confirmationMessage={getInvoicedTransportsConfirmationMessage()}
                    onClick={() => {
                        setTransportsInvoiced(undefined);
                    }}
                />
            )}
        </>
    );
};

const TransportFlowConfirmationModal = (props: {
    confirmationMessage: string;
    onClick: () => unknown;
}) => {
    const isLoading = useSelector((state: RootState) => state.invoicingStatus.loading);
    return (
        <ConfirmationModal
            data-testid="draft-invoice-created-modal"
            title={t("components.draftInvoicesUpdated")}
            confirmationMessage={props.confirmationMessage}
            mainButton={{
                "data-testid": "draft-invoice-created-confirmation-button",
                children: t("common.confirmUnderstanding"),
                // @ts-ignore
                onClick: props.onClick,
                disabled: isLoading,
            }}
        />
    );
};
