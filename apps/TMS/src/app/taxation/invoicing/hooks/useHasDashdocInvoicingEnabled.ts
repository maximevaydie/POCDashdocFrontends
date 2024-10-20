import {useFeatureFlag} from "@dashdoc/web-common";

/** Tells wether the current company has the in dashdoc invoicing feature. */
export const useHasDashdocInvoicingEnabled = () => {
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");
    return hasDashdocInvoicingEnabled;
};
