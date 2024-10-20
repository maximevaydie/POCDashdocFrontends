import {apiService, useTimezone} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Button, Flex, Icon, LoadingWheel, Text, toast} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import flatten from "lodash.flatten";
import React, {FunctionComponent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {DahsdocInvoicingNotReady} from "app/features/pricing/invoices/invoice-transports-flow/transports-invoiceability/dashdoc-invoicing-not-ready";
import {TransportsInvoiceabilityHeader} from "app/features/pricing/invoices/invoice-transports-flow/transports-invoiceability/transports-invoiceability-header";
import {RootState} from "app/redux/reducers/index";
import {fetchInvoicingStatus} from "app/redux/reducers/invoicing-status";
import {ExistingDraft} from "app/services/invoicing";
import {InvoiceError} from "app/services/invoicing/invoiceError.service";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";
import {TransportsToInvoiceQuery} from "app/types/transport";

import InvoiceableTransportsCard from "./invoiceable-transports-card";
import {NotInvoiceableTransportCard} from "./not-invoiceable-transport-card";

import type {Transport} from "app/types/transport";

export type InvoiceabilityTransport = {
    uid: Transport["uid"];
    sequential_id: Transport["sequential_id"];
    pricing_total_price: Transport["pricing_total_price"];
    customer_to_invoice: {
        name: Company["name"];
        id: Company["pk"];
    };
};

type TransportsInvoiceabilityByDebtor = {
    debtor: {
        name: Company["name"];
        id: Company["pk"];
    };
    existing_drafts: ExistingDraft[];
    transports_without_errors: InvoiceabilityTransport[];
};

type TransportsInvoiceability = {
    invoiceable_transports: Record<Company["pk"], TransportsInvoiceabilityByDebtor>;
    transports_errors: {
        [invoiceErrorCode in InvoiceError]: InvoiceabilityTransport[];
    };
};

type TransportsInvoiceabilityProps = {
    selectedTransportsUids: Set<Transport["uid"]>;
    loadingTransports: boolean;
    allTransportsSelected: boolean;
    allTransportsCount: number;
    currentQuery: TransportsToInvoiceQuery;
    onBack: () => void;
    onSubmit: (
        transportUids: Transport["uid"][],
        ungroupInvoicesForTransportsUids: Transport["uid"][],
        transportsToAddToInvoices: Record<Invoice["uid"], Transport["uid"][]>
    ) => void;
    onShowTransportPreview: (transportUid: Transport["uid"]) => void;
    onRemoveFromInvoicing: (transportUids: Transport["uid"][]) => void;
};

const TransportsInvoiceability: FunctionComponent<TransportsInvoiceabilityProps> = ({
    selectedTransportsUids,
    loadingTransports,
    allTransportsSelected,
    allTransportsCount,
    currentQuery,
    onBack,
    onSubmit,
    onShowTransportPreview,
    onRemoveFromInvoicing,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [transportsInvoiceability, setTransportsInvoiceability] = useState<
        TransportsInvoiceability | undefined
    >(undefined);
    const [ungroupInvoicesForTransportsUids, setUngroupInvoicesForTransportsUids] = useState<
        Transport["uid"][]
    >([]);
    const [transportsToAddToInvoices, setTransportsToAddToInvoices] = useState<
        Record<Invoice["uid"], Transport["uid"][]>
    >({});

    const transportUids = Array.from(selectedTransportsUids);
    const serializedTransportUids = transportUids.join(",");
    const timezone = useTimezone();
    useEffect(() => {
        const checkTransportInvoiceability = async (serializedTransportUids: string) => {
            setIsLoading(true);
            try {
                const response: TransportsInvoiceability = await apiService.post(
                    "/transports/check-invoiceability/",
                    {
                        filters: allTransportsSelected
                            ? queryService.toQueryString(
                                  getTransportsQueryParamsFromFiltersQuery(
                                      currentQuery,
                                      timezone,
                                      true
                                  )
                              )
                            : `uid__in=${serializedTransportUids}`,
                    }
                );

                setTransportsInvoiceability(response);
            } catch {
                toast.error(t("common.error"));
                onBack();
            }
            setIsLoading(false);
        };
        if (serializedTransportUids.length > 0) {
            checkTransportInvoiceability(serializedTransportUids);
        }
    }, [serializedTransportUids, allTransportsSelected, currentQuery, onBack]);

    useEffect(() => {
        // The transports list can be empty in two cases:
        // 1. The user manually removed them all
        // 2. The user updated a transport pricing and the transports information is reloading
        // Only redirect back to step 1 in the first case.

        if (!loadingTransports && selectedTransportsUids.size === 0 && !allTransportsSelected) {
            onBack();
        }
    }, [loadingTransports, selectedTransportsUids, allTransportsSelected, onBack]);

    const dispatch = useDispatch();
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const isDashdocInvoicingStatusFetchLoading = useSelector(
        (state: RootState) => state.invoicingStatus.loading
    );
    const invoicingStatus = useSelector((state: RootState) => state.invoicingStatus.data);
    const noPreviousFetch = invoicingStatus === null;
    const dashdocInvoicingNotReady =
        invoicingStatus?.invoicing_method === "dashdoc-invoicing" &&
        !invoicingStatus.is_ready_for_invoicing;

    useEffect(() => {
        if (hasDashdocInvoicingEnabled && (noPreviousFetch || dashdocInvoicingNotReady)) {
            dispatch(fetchInvoicingStatus());
        }
    }, [dispatch, hasDashdocInvoicingEnabled]);

    if (isLoading || loadingTransports || isDashdocInvoicingStatusFetchLoading) {
        return <LoadingWheel />;
    }

    if (hasDashdocInvoicingEnabled && dashdocInvoicingNotReady) {
        return <DahsdocInvoicingNotReady onBack={onBack} />;
    }

    const handleUngroupInvoicesPerTransport = (transportsUids: Transport["uid"][]) => {
        setUngroupInvoicesForTransportsUids((prevValue) => [...prevValue, ...transportsUids]);
    };

    const handleGroupInvoicesPerTransport = (transportsUids: Transport["uid"][]) => {
        setUngroupInvoicesForTransportsUids((prevValue) =>
            prevValue.filter((transportUid) => !transportsUids.includes(transportUid))
        );
    };

    const handleInvoiceClick = async () => {
        setIsLoading(true);

        const transportUidsToSubmit: Transport["uid"][] = Object.values(
            transportsInvoiceability?.invoiceable_transports ?? {}
        ).reduce((transportsToSubmitAcc, debtorTransports) => {
            return [
                ...transportsToSubmitAcc,
                ...debtorTransports.transports_without_errors.map(
                    (invoiceabilityTransport) => invoiceabilityTransport.uid
                ),
            ];
        }, []);

        await onSubmit(
            transportUidsToSubmit,
            ungroupInvoicesForTransportsUids,
            transportsToAddToInvoices
        );

        setIsLoading(false);
    };

    const getTransportsCardSelectedInvoice = (
        transportUids: Transport["uid"][],
        existingDrafts: ExistingDraft[]
    ): ExistingDraft | null => {
        for (const [invoiceUid, transportUidsToAddToInvoice] of Object.entries(
            transportsToAddToInvoices
        )) {
            if (
                transportUids.every((transportUid) =>
                    transportUidsToAddToInvoice.includes(transportUid)
                )
            ) {
                // @ts-ignore
                return existingDrafts.find((draft) => draft.uid === invoiceUid);
            }
        }

        return null;
    };

    const addedToInvoicesCount = Object.keys(transportsToAddToInvoices).length;
    let totalInvoiceableTransportsCount = 0;
    let totalDraftInvoicesCreatedCount = 0;

    for (const debtorTransports of Object.values(
        transportsInvoiceability?.invoiceable_transports ?? {}
    )) {
        totalInvoiceableTransportsCount += debtorTransports.transports_without_errors.length;

        // If the transports are added to an invoice do nothing
        // If we create one invoice by OT then we have to add the number of transports to totalDraftInvoicesCreatedCount
        // Otherwise only one invoice will be created
        const areTransportsAddedToADraft = !!getTransportsCardSelectedInvoice(
            debtorTransports.transports_without_errors.map(
                (invoiceableTransportWithoutError) => invoiceableTransportWithoutError.uid
            ),
            debtorTransports.existing_drafts
        );

        if (areTransportsAddedToADraft) {
            continue;
        }
        const areTransportsUngrouped = debtorTransports.transports_without_errors.every(
            (invoiceabilityTransport) =>
                ungroupInvoicesForTransportsUids.includes(invoiceabilityTransport.uid)
        );
        totalDraftInvoicesCreatedCount += areTransportsUngrouped
            ? debtorTransports.transports_without_errors.length
            : 1;
    }

    let totalTransportsErrorsCount = 0;
    if (transportsInvoiceability?.transports_errors) {
        totalTransportsErrorsCount = flatten(
            Object.values(transportsInvoiceability.transports_errors)
        ).length;
    }

    const getInvoicedTransportsConfirmationMessage = () => {
        const options: {[key: string]: number} = {
            totalInvoiceableTransportsCount,
            totalDraftInvoicesCreatedCount,
            totalDraftInvoicesUpdatedCount: addedToInvoicesCount,
            smart_count: totalInvoiceableTransportsCount,
        };

        if (totalDraftInvoicesCreatedCount > 0 && addedToInvoicesCount > 0) {
            return t("invoicingFlow.willInvoiceTransportsToNewAndExistingDrafts", options);
        } else if (totalDraftInvoicesCreatedCount > 0) {
            return t("invoicingFlow.willInvoiceTransportsToNewDrafts", options);
        } else if (addedToInvoicesCount > 0) {
            return t("invoicingFlow.willInvoiceTransportsToExistingDrafts", options);
        } else {
            return "";
        }
    };

    const _renderTransportsToBeInvoiced = () => {
        return Object.values(transportsInvoiceability?.invoiceable_transports ?? {}).map(
            (transportsInvoiceabilityPerDebtor, index) => {
                const invoiceableTransports =
                    transportsInvoiceabilityPerDebtor.transports_without_errors;
                const invoiceableTransportsUids = invoiceableTransports.map(
                    (invoiceableTransport) => invoiceableTransport.uid
                );
                const isUngrouped = ungroupInvoicesForTransportsUids.some((transportUid) =>
                    invoiceableTransportsUids.includes(transportUid)
                );
                const selectedDraftInvoice = getTransportsCardSelectedInvoice(
                    invoiceableTransportsUids,
                    transportsInvoiceabilityPerDebtor.existing_drafts
                );
                return (
                    <InvoiceableTransportsCard
                        key={transportsInvoiceabilityPerDebtor.debtor.id}
                        dataTestId={`transports-invoiceability-card-${index}`}
                        debtor={transportsInvoiceabilityPerDebtor.debtor}
                        existingDrafts={transportsInvoiceabilityPerDebtor.existing_drafts}
                        transports={invoiceableTransports}
                        isUngrouped={isUngrouped}
                        selectedDraftInvoice={selectedDraftInvoice}
                        onUngroupInvoicesPerTransport={() =>
                            handleUngroupInvoicesPerTransport(invoiceableTransportsUids)
                        }
                        onAddTransportsToExistingInvoice={(invoiceUid: Invoice["uid"]) =>
                            setTransportsToAddToInvoices((prevValue) => {
                                return {
                                    ...prevValue,
                                    [invoiceUid]: [...invoiceableTransportsUids],
                                };
                            })
                        }
                        onGroupInvoicesPerTransport={() =>
                            handleGroupInvoicesPerTransport(invoiceableTransportsUids)
                        }
                        onAddTransportsToOtherExistingInvoice={(invoiceUid) =>
                            setTransportsToAddToInvoices((prevValue) => {
                                let newValue = Object.assign({}, prevValue);
                                // @ts-ignore
                                delete newValue[selectedDraftInvoice.uid];
                                newValue[invoiceUid] = [...invoiceableTransportsUids];
                                return newValue;
                            })
                        }
                        onCreateNewInvoice={() => {
                            setTransportsToAddToInvoices((prevValue) => {
                                let newValue = Object.assign({}, prevValue);
                                // @ts-ignore
                                delete newValue[selectedDraftInvoice.uid];
                                return newValue;
                            });
                        }}
                        onRemoveTransportsFromInvoicing={
                            allTransportsSelected
                                ? undefined // FIXME : This is a quick fix because this doesn't work if allTransportsSelected is true
                                : () => onRemoveFromInvoicing(invoiceableTransportsUids)
                        }
                    />
                );
            }
        );
    };

    const _renderTransportsWithErrors = () => {
        const errorTypes: InvoiceError[] = [
            "already_invoiced_transport",
            "cannot_invoice_transport_without_price",
            "cannot_invoice_transport_with_negative_price",
            "cannot_invoice_unverified_transport",
            "cannot_invoice_transport_without_mandatory_invoice_item",
            "cannot_invoice_transport_without_customer_to_invoice",
            "cannot_invoice_transport_with_non_invoiceable_customer_to_invoice",
            "cannot_invoice_transport_with_line_unit_price_with_more_than_two_decimal_places",
        ];
        return errorTypes.map((errorType) => {
            return transportsInvoiceability?.transports_errors[errorType]?.map(
                (invoiceableTransport) => {
                    return (
                        <NotInvoiceableTransportCard
                            key={invoiceableTransport.uid}
                            transport={invoiceableTransport}
                            errorType={errorType}
                            onShowTransportPreview={() =>
                                onShowTransportPreview(invoiceableTransport.uid)
                            }
                        />
                    );
                }
            );
        });
    };

    return (
        <>
            <Flex flexDirection="column" flex={1} overflow="auto" pb={2}>
                <TransportsInvoiceabilityHeader onBack={onBack} label={t("invoicingFlow.recap")} />

                <Flex mx={4} flexDirection="column">
                    <Text variant="h1" mt={4}>
                        {t("components.countSelectedTransports", {
                            smart_count: allTransportsSelected
                                ? allTransportsCount
                                : selectedTransportsUids.size,
                        })}
                    </Text>
                    <Flex
                        flexDirection="row"
                        mt={1}
                        pb={4}
                        borderBottomColor="grey.light"
                        borderBottomStyle="solid"
                        borderBottomWidth="1px"
                        alignItems="center"
                    >
                        <Icon name="checkCircle" scale={[1.2, 1.2]} color="green.dark" mr={2} />
                        <Text data-testid="total-invoiceable-transports-count">
                            {totalInvoiceableTransportsCount}
                        </Text>
                        <Icon name="removeCircle" scale={[1.2, 1.2]} color="red.dark" mx={2} />
                        <Text data-testid="total-transports-errors-count">
                            {totalTransportsErrorsCount}
                        </Text>
                    </Flex>
                    {totalInvoiceableTransportsCount > 0 && (
                        <>
                            <Flex flexDirection="row" mt={4} alignItems="center">
                                <Icon
                                    name="checkCircle"
                                    scale={[1.2, 1.2]}
                                    color="green.dark"
                                    mr={2}
                                />
                                <Text fontWeight="600">{t("invoicingFlow.draftInvoices")}</Text>
                            </Flex>
                            <Text variant="caption" color="grey.dark" fontWeight="400">
                                {getInvoicedTransportsConfirmationMessage()}
                            </Text>
                            {_renderTransportsToBeInvoiced()}
                        </>
                    )}
                    {totalTransportsErrorsCount > 0 && (
                        <>
                            <Flex flexDirection="row" mt={4} alignItems="center">
                                <Icon
                                    name="removeCircle"
                                    scale={[1.2, 1.2]}
                                    color="red.dark"
                                    mr={2}
                                />
                                <Text fontWeight="600">{t("invoicingFlow.problemsToSolve")}</Text>
                            </Flex>
                            <Text variant="caption" color="grey.dark" fontWeight="400">
                                {t("invoicingFlow.problemsToSolveDescription")}
                            </Text>
                            {_renderTransportsWithErrors()}
                        </>
                    )}
                </Flex>
            </Flex>

            {totalInvoiceableTransportsCount > 0 && (
                <Flex
                    justifyContent="flex-end"
                    borderTopColor="grey.light"
                    borderTopStyle="solid"
                    borderTopWidth="1px"
                    p={2}
                >
                    <Button variant="plain" onClick={onBack} mr={4}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        data-testid="transports-invoiceability-submit-button"
                        variant="primary"
                        onClick={handleInvoiceClick}
                    >
                        {t("components.createDraftsOfInvoice")}
                    </Button>
                </Flex>
            )}
        </>
    );
};

export default TransportsInvoiceability;
