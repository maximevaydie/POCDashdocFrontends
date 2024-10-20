import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";

type InvoicingConnectorErrorTextProps = {
    dataTestId?: string;
};
export function InvoicingMethodUnknownErrorText({dataTestId}: InvoicingConnectorErrorTextProps) {
    return (
        <Text variant="h1" textAlign="center" data-testid={dataTestId}>
            {t("common.error")}
        </Text>
    );
}
