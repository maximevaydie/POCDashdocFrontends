import {t} from "@dashdoc/web-core";
import {Icon, ClickableFlex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import DocumentModal from "app/features/document/DocumentModal";

export const InvoicePreviewIcon: FunctionComponent<{url: string | null}> = ({url}) => {
    const [modalVisible, openModal, closeModal] = useToggle();
    if (!url) {
        return null;
    }
    return (
        <>
            <ClickableFlex
                onClick={openModal}
                hoverStyle={{bg: "white"}}
                justifyContent="center"
                alignItems="center"
            >
                <Icon color="blue.default" name="accountingInvoice" />
            </ClickableFlex>
            {modalVisible && (
                <DocumentModal
                    onClose={closeModal}
                    documents={[{url, label: t("components.invoice")}]}
                />
            )}
        </>
    );
};
