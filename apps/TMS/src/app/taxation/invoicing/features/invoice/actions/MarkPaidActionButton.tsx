import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import React, {FC} from "react";

export const MarkPaidActionButton: FC<{onClick: () => void}> = ({onClick}) => {
    return (
        <Button data-testid="mark-invoice-paid-button" ml={2} onClick={onClick}>
            {t("invoiceDetails.markPaid")}
        </Button>
    );
};
