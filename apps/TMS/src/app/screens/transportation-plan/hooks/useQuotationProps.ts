import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {BuildConstants} from "@dashdoc/web-core";
import {setupI18n, t} from "@dashdoc/web-core";
import {BROWSER_TIMEZONE} from "@dashdoc/web-core";
import {SlimCompany} from "dashdoc-utils";
import {useEffect, useState} from "react";

import {Author, Quotation, QuotationRequest} from "app/types/rfq";

import type {QuotationProps} from "app/features/transportation-plan/rfq/quotation/Quotation";
import type {Transport} from "app/types/transport";

interface QuotationRequestContext extends QuotationRequest {
    author: Author;
    author_company: SlimCompany;
    surveyed_carriers_count: number;
}

/**
 * @guidedtour[epic=rfq] quotation context
 * The quotation screen does not involve a connected user.
 * To secure the data fetching, we use a dedicated endpoint with the strict minimum of data.
 * To fetch a quotation request context, you need to provide a valid quotation uid.
 * We get all useful data in a dedicated endpoint.
 * We use `QuotationContext` to type the returned data payload.
 */
interface QuotationContext {
    accepted_quotation_percentage: string | null;
    quotation: Quotation;
    quotation_request: QuotationRequestContext;
    transport: Transport;
}

/**
 * @guidedtour[epic=rfq] Hook for carrier quotation.
 * This hook return props for the Quotation component and used a dedicated endpoint.
 */
export const useQuotationProps = (uid: string) => {
    const [{quotationProps, isLoading, error}, setState] = useState<{
        quotationProps: QuotationProps | null;
        isLoading: boolean;
        error: string | null;
    }>({quotationProps: null, isLoading: true, error: null});

    useEffect(() => {
        const getPublicData = async () => {
            setState({
                quotationProps: null,
                error: null,
                isLoading: true,
            });
            try {
                const aQuotationPublicData: QuotationContext = await apiService.get(
                    `/carrier-quotation/${uid}/get-public-data/`
                );
                // Use `BuildConstants.language` that deal with the current session language
                await setupI18n(BuildConstants.language, BROWSER_TIMEZONE);
                // Internationalization is ready, we can use the `t` function! 🎉

                const {transport, quotation, quotation_request, accepted_quotation_percentage} =
                    aQuotationPublicData;
                setState({
                    quotationProps: {
                        transport,
                        quotation: {
                            ...quotation,
                        },
                        author: quotation_request.author,
                        authorCompany: quotation_request.author_company,
                        quotationRequest: quotation_request,
                        acceptedQuotationPercentage: accepted_quotation_percentage,
                        surveyedCarriersCount: quotation_request.surveyed_carriers_count,
                    },
                    error: null,
                    isLoading: false,
                });
            } catch (e) {
                Logger.error(e);
                setState({
                    quotationProps: null,
                    error: t("rfq.quotationForm.invalid"),
                    isLoading: false,
                });
            }
        };
        getPublicData();
    }, [uid]);

    return {
        quotationProps,
        isLoading,
        error,
    };
};
