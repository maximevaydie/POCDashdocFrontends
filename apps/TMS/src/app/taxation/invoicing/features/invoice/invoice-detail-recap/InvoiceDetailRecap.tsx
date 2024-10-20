import {PartnerLink, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Callout, Card, Flex, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useDispatch, useSelector} from "react-redux";

import {fetchUpdateInvoice, loadInvoicingConnectorAuthenticated} from "app/redux/actions/invoices";
import {RootState} from "app/redux/reducers/index";
import {connectorsService} from "app/services/invoicing/connectors.service";
import {InvoicePriceRecap} from "app/taxation/invoicing/features/invoice/invoice-detail-recap/InvoicePriceRecap";
import {DetailRecapContent} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/DetailRecapContent";
import {EditableNotes} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditableNotes";
import {EditInvoicingAndDueDatesModal} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditInvoicingDateModal";
import {EditNotesModal} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditNotesModal";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    invoice: Invoice;
    fromSharing: boolean;
};
export const InvoiceDetailRecap: React.FunctionComponent<Props> = ({invoice, fromSharing}) => {
    const [showEditDatesModal, openEditDatesModal, closeEditDatesModal] = useToggle(false);
    const [showEditNotesModal, openEditNotesModal, closeEditNotesModal] = useToggle(false);

    const dispatch = useDispatch();

    // aborted in the action if already loading/loaded
    dispatch(loadInvoicingConnectorAuthenticated());

    const invoicingConnector = useSelector((state: RootState) => state.invoicingConnector);

    const canUpdateInvoicingInfo = !fromSharing && invoice.status === "draft";

    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");
    const showNotes =
        (invoicingConnector && connectorsService.canShowNotes(invoicingConnector)) ||
        hasDashdocInvoicingEnabled ||
        fromSharing;
    const showDates =
        (invoicingConnector && connectorsService.canAccessInvoicingDate(invoicingConnector)) ||
        hasDashdocInvoicingEnabled ||
        fromSharing;

    return (
        <>
            <Card p={5}>
                {!fromSharing &&
                    !invoice.debtor.invoicing_remote_id &&
                    !hasDashdocInvoicingEnabled && (
                        <Callout variant="danger" mb={5} mt={-5} ml={-5} mr={-5} p={4}>
                            <Text>
                                {t(
                                    "invoice.details.customer.noInvoicingRemoteIdCustomerWillBeCreated"
                                )}
                            </Text>
                            <PartnerLink pk={invoice.debtor.pk}>
                                {t("invoice.details.customer.addInvoicingRemoteId")}
                                <Icon name="openInNewTab" ml={1} fontSize={9} />
                            </PartnerLink>
                        </Callout>
                    )}
                {!fromSharing && !invoice.debtor.vat_number && invoice.status === "draft" && (
                    <Callout variant="warning" mb={5} mt={-5} ml={-5} mr={-5} p={4}>
                        <Text>{t("invoice.details.customer.noVatNumber")}</Text>
                        <PartnerLink pk={invoice.debtor.pk}>
                            {t("invoice.details.customer.fillInVatNumber")}
                            <Icon name="openInNewTab" ml={1} fontSize={9} />
                        </PartnerLink>
                    </Callout>
                )}
                <Flex>
                    <DetailRecapContent
                        customer={invoice.debtor}
                        carrier={invoice.created_by}
                        dates={{
                            show: showDates,
                            value: {
                                invoicingDate: invoice.invoicing_date,
                                dueDate: invoice.due_date,
                            },
                            isLate: invoice.is_payment_late,
                            onUpdate: canUpdateInvoicingInfo ? openEditDatesModal : undefined,
                        }}
                        fromSharing={fromSharing}
                    />
                    <Flex flexDirection="column">
                        <Flex justifyContent="flex-end" alignItems="flex-end" mt={9}>
                            <InvoicePriceRecap invoice={invoice} />
                        </Flex>
                    </Flex>
                </Flex>
                {showNotes && (
                    <EditableNotes
                        value={invoice.debtor_reference}
                        onUpdate={canUpdateInvoicingInfo ? openEditNotesModal : undefined}
                    />
                )}
            </Card>
            {showEditDatesModal && invoice.uid && (
                <EditInvoicingAndDueDatesModal
                    itemUid={invoice.uid}
                    initialInvoicingDate={invoice.invoicing_date}
                    initialDueDate={invoice.due_date}
                    fetchUpdate={fetchUpdateInvoice}
                    onClose={closeEditDatesModal}
                />
            )}
            {showEditNotesModal && invoice.uid && (
                <EditNotesModal
                    itemUid={invoice.uid}
                    initialNotes={invoice.debtor_reference}
                    fetchUpdate={(invoiceUid, values) =>
                        fetchUpdateInvoice(invoiceUid, {debtor_reference: values.notes})
                    }
                    onClose={closeEditNotesModal}
                />
            )}
        </>
    );
};
