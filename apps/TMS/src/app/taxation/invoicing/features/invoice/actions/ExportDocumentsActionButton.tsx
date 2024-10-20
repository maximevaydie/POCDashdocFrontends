import {t} from "@dashdoc/web-core";
import {Button, theme} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC} from "react";

import {ExportDocumentsModal} from "./ExportDocumentsModal";

export const ExportDocumentsActionButton: FC<{
    invoiceUid: string;
    fromSharing: boolean;
    onClose?: () => void;
}> = ({invoiceUid, fromSharing, onClose}) => {
    const [isOpenExportDocumentsModal, openExportDocumentsModal, closeExportDocumentsModal] =
        useToggle(false);
    return (
        <>
            <Button
                data-testid="export-invoice-documents-button"
                variant={fromSharing ? "primary" : "plain"}
                color={!fromSharing ? `${theme.colors.grey.ultradark} !important` : ""}
                onClick={openExportDocumentsModal}
                width={!fromSharing ? "100%" : undefined}
                justifyContent={!fromSharing ? "flex-start" : undefined}
            >
                {t("invoiceDetails.exportDocuments")}
            </Button>
            {isOpenExportDocumentsModal && (
                <ExportDocumentsModal
                    invoiceUid={invoiceUid}
                    fromSharing={fromSharing}
                    onClose={() => {
                        closeExportDocumentsModal();
                        onClose?.();
                    }}
                />
            )}
        </>
    );
};
