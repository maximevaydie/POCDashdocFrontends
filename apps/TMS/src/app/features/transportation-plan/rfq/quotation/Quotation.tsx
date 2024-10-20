import {getConnectedGroupViews, useSelector} from "@dashdoc/web-common";
import {BROWSER_TIMEZONE, t} from "@dashdoc/web-core";
import {Box, Button, Callout, Flex, Icon, Text} from "@dashdoc/web-ui";
import {SlimCompany} from "dashdoc-utils";
import React, {FunctionComponent, useRef} from "react";

import {getExpectedDeliveryDate} from "app/services/transport/transport.service";
import {Author, Quotation as QuotationData, QuotationRequest} from "app/types/rfq";

import {QuotationForm} from "./quotation-form/QuotationForm";
import {QuotationRecap} from "./quotation-recap/QuotationRecap";
import {quotationService} from "./quotation.service";
import {TransportRecap} from "./transport-recap/TransportRecap";
import {useQuotationSubmit} from "./useQuotationSubmit";

import type {Transport} from "app/types/transport";

export type QuotationProps = {
    transport: Transport;
    author: Author;
    authorCompany: SlimCompany;
    quotation: QuotationData;
    quotationRequest: QuotationRequest;
    acceptedQuotationPercentage: string | null;
    surveyedCarriersCount: number;
};

export const Quotation: FunctionComponent<QuotationProps> = (props) => {
    // hack to store the button to trigger the form submission
    const submitAction = useRef<"PENDING" | "REJECTED" | "REPLIED">("PENDING");
    const {
        transport,
        authorCompany,
        author,
        quotation,
        quotationRequest,
        acceptedQuotationPercentage,
        surveyedCarriersCount,
    } = props;
    const {status, uid, pricing, comment} = quotation;
    const {isSubmitting, error, onSubmit} = useQuotationSubmit(uid);
    const expectedDeliveryDate = getExpectedDeliveryDate(transport, BROWSER_TIMEZONE);

    const groupViews = useSelector(getConnectedGroupViews);
    const authorCompanyGroupView = groupViews.find((groupView) =>
        groupView.companies.includes(authorCompany.pk)
    );

    let quotationPricing = null;
    if (pricing !== null) {
        quotationPricing = pricing;
    } else if (quotationRequest.pricing !== null) {
        quotationPricing = quotationRequest.pricing;
    }
    const initialValues = {
        quotation: quotationService.getPricingForm(quotationPricing, {
            pk: authorCompany.pk,
            group_view_id: authorCompanyGroupView?.pk,
        }),
        comment,
        expected_delivery_date: expectedDeliveryDate ?? new Date(),
    };
    return (
        <Flex flexDirection="column" justifyContent="space-between" height="100%">
            <Flex justifyContent="space-between" flexGrow={1} style={{gap: "16px"}}>
                {status === "PENDING" && transport.global_status === "ordered" ? (
                    <QuotationForm
                        initialValues={initialValues}
                        commandNumber={transport.sequential_id}
                        quotation={quotation}
                        authorCompany={authorCompany}
                        readOnly={isSubmitting}
                        onSubmit={(values) => {
                            if (submitAction.current !== "PENDING") {
                                onSubmit(values, submitAction.current);
                            }
                        }}
                        acceptedQuotationPercentage={acceptedQuotationPercentage}
                        surveyedCarriersCount={surveyedCarriersCount}
                    />
                ) : (
                    <QuotationRecap
                        quotation={quotation}
                        transportStatus={transport.global_status}
                    />
                )}
                <Flex bg="grey.white" boxShadow="large" p={5} minWidth="480px">
                    <TransportRecap
                        transport={transport}
                        author={author}
                        authorCompany={authorCompany}
                        quotationRequest={quotationRequest}
                    />
                </Flex>
            </Flex>
            {status === "PENDING" && transport.global_status === "ordered" && (
                <Flex
                    justifyContent="flex-end"
                    p={3}
                    position="sticky"
                    bottom={0}
                    bg="grey.white"
                    boxShadow="medium"
                >
                    {error ? (
                        <Callout variant="danger" mr={3} flexGrow={1}>
                            <Text>{error}</Text>
                        </Callout>
                    ) : (
                        <Box height="40px" />
                    )}
                    <Button
                        variant="secondary"
                        type="submit"
                        form="carrier-quotation-form"
                        mr={3}
                        onClick={() => (submitAction.current = "REJECTED")}
                        disabled={isSubmitting}
                    >
                        <Icon name="cancel" color="red.default" mr={2} />
                        {t("rfq.quotationForm.reject")}
                    </Button>

                    <Button
                        variant="primary"
                        type="submit"
                        form="carrier-quotation-form"
                        onClick={() => (submitAction.current = "REPLIED")}
                        disabled={isSubmitting}
                    >
                        <Icon name="check" mr={2} />
                        {t("rfq.quotationForm.reply")}
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};
