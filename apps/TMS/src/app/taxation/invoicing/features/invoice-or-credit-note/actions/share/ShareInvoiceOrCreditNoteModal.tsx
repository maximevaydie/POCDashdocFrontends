import {t} from "@dashdoc/web-core";
import {Flex, Modal} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {ShareCreditNoteByEmailForm} from "app/taxation/invoicing/features/credit-note/actions/ShareCreditNoteByEmailForm";

import {ShareInvoiceByEmailForm} from "../../../invoice/actions/ShareInvoiceByEmailForm";

import {ButtonCard} from "./ButtonCard";
import {ShareByLink} from "./ShareByLink";

import type {CreditNoteStatus} from "app/taxation/invoicing/types/creditNote.types";
import type {InvoiceAttachment, InvoiceStatus} from "app/taxation/invoicing/types/invoice.types";

type Props =
    | {
          type: "invoice";
          itemUid: string;
          parentItemUid?: undefined;
          status: InvoiceStatus | CreditNoteStatus;
          isDashdoc: boolean;
          debtorCompanyId: number;
          onClose: () => void;
          attachments: InvoiceAttachment[];
      }
    | {
          type: "creditNote";
          itemUid: string;
          parentItemUid: string | null;
          status: InvoiceStatus | CreditNoteStatus;
          isDashdoc: boolean;
          debtorCompanyId: number;
          onClose: () => void;
          attachments: InvoiceAttachment[];
      };

type SelectedSharingOption = "email" | "link";

export function ShareInvoiceOrCreditNoteModal({
    type,
    itemUid,
    parentItemUid,
    status,
    isDashdoc,
    debtorCompanyId,
    onClose,
    attachments,
}: Props) {
    const [selectedSharingOption, setSelectedSharingOption] =
        useState<SelectedSharingOption>("email");

    return (
        <Modal
            title={type === "invoice" ? t("shareInvoice.title") : t("shareCreditNote.title")}
            id="share-shipment-modal"
            onClose={onClose}
            mainButton={null}
            secondaryButton={null}
        >
            <Flex style={{gap: "12px"}} mb={5}>
                <ButtonCard
                    label={t("common.sendViaEmail")}
                    data-testid="share-by-email-button"
                    icon="envelope"
                    selected={selectedSharingOption === "email"}
                    onClick={() => setSelectedSharingOption("email")}
                />
                <ButtonCard
                    label={t("common.shareByLink")}
                    data-testid="share-by-link-button"
                    icon="link"
                    selected={selectedSharingOption === "link"}
                    onClick={() => setSelectedSharingOption("link")}
                />
            </Flex>

            {selectedSharingOption === "email" &&
                (type === "invoice" ? (
                    <ShareInvoiceByEmailForm
                        itemUid={itemUid}
                        status={status as InvoiceStatus}
                        isDashdoc={isDashdoc}
                        debtorCompanyId={debtorCompanyId}
                        onClose={onClose}
                        attachments={attachments}
                    />
                ) : (
                    <ShareCreditNoteByEmailForm
                        itemUid={itemUid}
                        parentItemUid={parentItemUid}
                        status={status as CreditNoteStatus}
                        isDashdoc={isDashdoc}
                        debtorCompanyId={debtorCompanyId}
                        onClose={onClose}
                    />
                ))}

            {selectedSharingOption === "link" && (
                <ShareByLink
                    type={type}
                    itemUid={itemUid}
                    status={status}
                    isDashdoc={isDashdoc}
                    parentItemUid={parentItemUid}
                />
            )}
        </Modal>
    );
}
