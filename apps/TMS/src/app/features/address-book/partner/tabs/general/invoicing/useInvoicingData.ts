import {InvoicingAddress} from "dashdoc-utils";

import {useEntity} from "app/redux/hooks";
import {companyInvoicingDataSchema} from "app/redux/schemas";
import {CompanyInvoicingData} from "app/types/company";

export type InvoicingData = {
    invoiceable: boolean;
    invoicingAddress: InvoicingAddress | undefined;
    accountCode: string | undefined;
    sideAccountCode: string | undefined;
};

export function useInvoicingData(companyPk: number): InvoicingData & {loading: boolean} {
    const {entity, loading} = useEntity({
        id: companyPk,
        urlBase: "customer-invoicing-data",
        objName: "companiesInvoicingData",
        objSchema: companyInvoicingDataSchema,
        apiVersion: "web",
    });
    const companyInvoicingData = entity as CompanyInvoicingData | null;
    return {
        invoiceable: !!companyInvoicingData?.invoicing_address,
        invoicingAddress: companyInvoicingData?.invoicing_address,
        accountCode: companyInvoicingData?.account_code,
        sideAccountCode: companyInvoicingData?.side_account_code,
        loading,
    };
}
