import {PurchaseCostLine} from "dashdoc-utils";

export const getPurchaseCostsCurrency = (purchaseCostsLines?: PurchaseCostLine[]): string => {
    return purchaseCostsLines?.[0]?.currency ?? "EUR";
};
