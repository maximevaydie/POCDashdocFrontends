import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import React from "react";

import {NumberingForm} from "app/taxation/invoicing/features/invoice-settings/numbering-form/NumberingForm";
import {InvoiceNumberingPostData} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type EditInvoiceNumberingModalProps = {
    numberingData: InvoiceNumberingPostData;
    onNumberingEdit: (numberingData: InvoiceNumberingPostData) => void;
    onClose: () => void;
    onSubmit: () => void;
    readOnly?: boolean;
};

export function EditInvoiceNumberingModal({
    onClose,
    onSubmit,
    numberingData,
    onNumberingEdit,
    readOnly = false,
}: EditInvoiceNumberingModalProps) {
    const [loading, setLoading] = React.useState(false);
    const mainButtonProps = readOnly
        ? {
              onClick: onClose,
              type: "button" as const,
              "data-testid": "numbering-settings-close-button",
              children: t("common.close"),
          }
        : {
              form: "numbering-form",
              type: "submit" as const,
              loading: loading,
              "data-testid": "numbering-settings-save-button",
              children: t("common.save"),
          };

    return (
        <Modal
            onClose={onClose}
            title={t("invoiceNumberingSettings.title")}
            size={"large"}
            mainButton={mainButtonProps}
            secondaryButton={
                readOnly
                    ? null
                    : {
                          onClick: onClose,
                          "data-testid": "numbering-settings-cancel-button",
                      }
            }
        >
            <NumberingForm
                onSubmit={onSubmit}
                numberingData={numberingData}
                onNumberingEdit={onNumberingEdit}
                setLoading={setLoading}
                readOnly={readOnly}
            />
        </Modal>
    );
}
