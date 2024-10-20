import {TrackedLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    dataTestId?: string;
};
export function NoInvoicingConnectorErrorText({dataTestId}: Props) {
    return (
        <Text variant="h1" textAlign="center" data-testid={dataTestId}>
            {t("invoiceTransportsModal.noConnector")}{" "}
            <TrackedLink to={"/app/settings/invoicing"}>
                {t("sidebar.settings").toLowerCase()}
            </TrackedLink>
            .
        </Text>
    );
}
