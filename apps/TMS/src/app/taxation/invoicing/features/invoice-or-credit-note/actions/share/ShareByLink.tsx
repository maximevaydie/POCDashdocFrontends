import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {AnalyticsEvent, analyticsService, urlService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Text, TextInput, toast} from "@dashdoc/web-ui";
import {copyToClipboard} from "dashdoc-utils";
import React from "react";

import {useSelector} from "app/redux/hooks";

import type {CreditNoteStatus} from "app/taxation/invoicing/types/creditNote.types";
import type {InvoiceStatus} from "app/taxation/invoicing/types/invoice.types";

type ShareInvoiceByLinkProps = {
    type: "invoice" | "creditNote";
    itemUid: string;
    parentItemUid?: string | null;
    status: InvoiceStatus | CreditNoteStatus;
    isDashdoc: boolean;
};

export function ShareByLink({
    type,
    itemUid,
    parentItemUid,
    status,
    isDashdoc,
}: ShareInvoiceByLinkProps) {
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);
    const link =
        type === "invoice"
            ? `${urlService.getBaseUrl()}/shared-invoices/${itemUid}/`
            : `${urlService.getBaseUrl()}/shared-credit-notes/${itemUid}/`;

    const copySharedLink = () => {
        copyToClipboard(
            link,
            () => {
                toast.success(t("common.linkCopied"));
                if (type === "invoice") {
                    analyticsService.sendEvent(AnalyticsEvent.invoiceShared, {
                        "is staff": connectedManager?.user.is_staff,
                        "company id": connectedCompany?.pk,
                        "invoice uid": itemUid,
                        "is dashdoc invoicing": isDashdoc,
                        "sharing method": "link",
                        "invoice status": status,
                        "added documents": undefined,
                        "is reminder": false,
                    });
                } else {
                    analyticsService.sendEvent(AnalyticsEvent.creditNoteShared, {
                        "is staff": connectedManager?.user.is_staff,
                        "company id": connectedCompany?.pk,
                        "credit note uid": itemUid,
                        "invoice uid": parentItemUid,
                        "is dashdoc invoicing": isDashdoc,
                        "sharing method": "link",
                        "credit note status": status,
                    });
                }
            },
            () => toast.error(t("common.linkCopyFailed"))
        );
    };

    return (
        <>
            <Text mb={2}>
                {type === "invoice"
                    ? t("shareInvoice.withDocs.linkText")
                    : t("shareCreditNote.withDocs.linkText")}
            </Text>
            <Flex flex={1}>
                <TextInput
                    data-testid="shared-link"
                    disabled
                    containerProps={{flex: 1}}
                    value={link}
                    onChange={() => {}}
                    onFocus={(event) => event.target.select()}
                ></TextInput>
                <Button
                    ml={2}
                    type="button"
                    data-testid="copy-shared-link"
                    onClick={copySharedLink}
                >
                    {t("common.copyLink")}
                </Button>
            </Flex>
        </>
    );
}
