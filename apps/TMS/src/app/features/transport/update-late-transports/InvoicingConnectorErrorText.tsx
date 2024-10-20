import {TrackedLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";

type InvoicingConnectorErrorTextProps = {
    dataTestId?: string;
};
export function InvoicingConnectorErrorText({dataTestId}: InvoicingConnectorErrorTextProps) {
    return (
        <Text variant="h1" textAlign="center" data-testid={dataTestId}>
            {t("invoiceTransportsModal.connectorError")}{" "}
            <TrackedLink to={`/app/settings/invoicing`}>
                {t("sidebar.settings").toLowerCase()}
            </TrackedLink>
            .
        </Text>
    );
}
