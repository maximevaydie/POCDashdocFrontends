export type InvoiceTemplate = {
    uid?: string;
    name: string;
    template: string;
    shippers: {pk: number; name: string}[];
};
