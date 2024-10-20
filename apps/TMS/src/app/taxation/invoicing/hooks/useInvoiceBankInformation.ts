import useSimpleFetch from "app/hooks/useSimpleFetch";
import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type UseInvoiceBankInformationResponse = {
    bankInformationList: InvoiceBankInformation[];
};

export const useInvoiceBankInformation = (): UseInvoiceBankInformationResponse => {
    const url = `/invoicing-bank-information/`;

    const {data: bankInformationList} = useSimpleFetch<InvoiceBankInformation[]>(
        url,
        [],
        "web",
        []
    );

    return {bankInformationList};
};
