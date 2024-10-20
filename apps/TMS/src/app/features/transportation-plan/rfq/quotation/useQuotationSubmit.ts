import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {BROWSER_TIMEZONE} from "@dashdoc/web-core";
import {zoneDateToISO} from "dashdoc-utils";
import {useCallback, useState} from "react";

import {computePricingBeforeSubmit} from "app/services/invoicing/pricing.service";

import {QuotationRejectPost, QuotationReplyPost, QuotationFormData} from "./types";

export const useQuotationSubmit = (uid: string) => {
    const [{isSubmitting, error}, setState] = useState<{
        isSubmitting: boolean;
        error: string | null;
    }>({isSubmitting: false, error: null});

    const reject = useCallback(
        async (payload: QuotationRejectPost) => {
            await apiService.post(`/carrier-quotation/${uid}/reject/`, payload);
        },
        [uid]
    );

    const reply = useCallback(
        async (payload: QuotationReplyPost) => {
            await apiService.post(`/carrier-quotation/${uid}/reply/`, payload);
        },
        [uid]
    );

    const onSubmit = useCallback(
        async (values: QuotationFormData, action: "REJECTED" | "REPLIED") => {
            setState((prev) => ({...prev, isSubmitting: true, error: null}));
            try {
                if (action === "REJECTED") {
                    const payload: QuotationRejectPost = {
                        comment: values.comment,
                    };
                    await reject(payload);
                    window.location.reload();
                } else {
                    const isCarrier = false; // there is no selected carrier in this context
                    const pricing = computePricingBeforeSubmit(values.quotation, isCarrier);
                    const expected_delivery_date =
                        zoneDateToISO(values.expected_delivery_date || null, BROWSER_TIMEZONE) ||
                        ""; // we should never have null value nor an empty string
                    const payload: QuotationReplyPost = {
                        expected_delivery_date,
                        comment: values.comment,
                        pricing,
                    };
                    await reply(payload);
                    window.location.reload();
                }
            } catch {
                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    error: t("common.error"),
                }));
            }
        },
        [reply, reject]
    );

    return {isSubmitting, error, onSubmit};
};
