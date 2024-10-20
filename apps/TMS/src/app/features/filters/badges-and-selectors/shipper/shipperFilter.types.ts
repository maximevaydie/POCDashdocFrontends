export type ShippersQuery = {
    shipper__in?: Array<string>;
};
export type DebtorsQuery = {
    debtor__in?: Array<string>;
    customer__in?: Array<string>;
};
