export type UpdatePricingTableColumn =
    | "invoiceItem"
    | "description"
    | "quantity"
    | "unitPrice"
    | "price"
    | "priceAndVat"
    | "gasIndex"
    | "delete";

export type ReadOnlyPricingTableColumn =
    | "invoiceItem"
    | "description"
    | "quantity"
    | "unitPrice"
    | "unit"
    | "price"
    | "priceAndVat"
    | "gasIndex";
