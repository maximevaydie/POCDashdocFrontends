import useSimpleFetch from "app/hooks/useSimpleFetch";

interface InvoicingDateData {
    last_invoicing_date: string;
}

export const useLastInvoicingDate = () => {
    const url = `/invoices/get-last-invoicing-date/`;

    const {isLoading, data} = useSimpleFetch<InvoicingDateData>(url, [], "web");

    return {isLoading, data};
};
