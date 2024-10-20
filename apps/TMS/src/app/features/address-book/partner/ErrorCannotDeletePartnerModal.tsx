import {t} from "@dashdoc/web-core";
import {Callout, Link, Modal} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

export const ErrorCannotDeletePartnerModal = ({
    companyPk,
    onClose,
}: {
    companyPk: number;
    onClose: () => void;
}) => {
    const history = useHistory();
    const link = `/app/invoices/?customer__in=${companyPk}&status__in=draft`;
    return (
        <Modal
            title={t("errors.cannot_delete_company_debtor_of_draft_invoice.modalTitle")}
            data-testid="cannot_delete_company_debtor_of_draft_invoice"
            onClose={onClose}
            mainButton={{
                onClick: onClose,
                "data-testid": "cannot_delete_company_debtor_of_draft_invoice-modal-save",
                children: t("common.close"),
            }}
            secondaryButton={null}
        >
            <Callout variant="danger">
                {t("errors.cannot_delete_company_debtor_of_draft_invoice")}
            </Callout>
            <Link mt={3} onClick={() => history.push(link)} width="fit-content">
                {t("company.invoicing.draftInvoiceLink")}
            </Link>
        </Modal>
    );
};
