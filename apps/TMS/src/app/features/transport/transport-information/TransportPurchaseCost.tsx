import {t} from "@dashdoc/web-core";
import {EditableField} from "@dashdoc/web-ui";
import {PurchaseCostLine} from "dashdoc-utils";
import React from "react";

import {
    LineForPriceWithoutVATDetails,
    PriceWithoutVATDetails,
} from "app/features/pricing/prices/PriceWithoutVATDetails";
import {getPurchaseCostsCurrency} from "app/services/invoicing/purchaseCosts.service";

import type {Transport} from "app/types/transport";

export type InvoiceInfoForTransport = {
    uid: string;
    document_number: string | null;
};

export type TransportPurchaseCostProps = {
    transport: Transport;
    onClick: () => unknown;
};

const computePurchaseCostLines = (
    purchaseCostLines: PurchaseCostLine[]
): LineForPriceWithoutVATDetails[] => {
    if (!purchaseCostLines) {
        return [];
    }

    const lines: LineForPriceWithoutVATDetails[] = purchaseCostLines.map((line) => {
        return {
            description: line.description,
            metric: line.metric,
            quantity: line.quantity,
            unit_price: line.unit_price,
            price: line.total_without_tax,
        };
    });

    return lines;
};

export function TransportPurchaseCost({transport, onClick}: TransportPurchaseCostProps) {
    const currency = getPurchaseCostsCurrency(transport.purchase_costs?.lines);

    const lines: LineForPriceWithoutVATDetails[] = transport.purchase_costs
        ? computePurchaseCostLines(transport.purchase_costs.lines)
        : [];

    return (
        <EditableField
            clickable={true}
            label={null}
            value={
                <PriceWithoutVATDetails
                    lines={lines}
                    currency={currency}
                    dataTestId="purchase-cost-details"
                    emptyMessage={t("purchaseCosts.noPurchaseCostsIndicated")}
                />
            }
            onClick={onClick}
            data-testid="purchase-cost-field"
        />
    );
}
