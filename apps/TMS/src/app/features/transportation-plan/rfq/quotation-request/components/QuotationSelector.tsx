import {t} from "@dashdoc/web-core";
import {Header} from "@dashdoc/web-ui";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getFinalPrice} from "app/services/invoicing/pricing.service";
import {Quotation, QuotationRequest} from "app/types/rfq";

import {QuotationCard} from "./QuotationCard";

export type QuotationSelectorProps = {
    quotationRequest: QuotationRequest;
    expectedDeliveryDate: Date | null;
    onSelect: (quotation: Quotation) => void;
};

export const QuotationSelector: FunctionComponent<QuotationSelectorProps> = ({
    quotationRequest,
    expectedDeliveryDate,
    onSelect,
}) => {
    const {pricing, comment, carrier_quotations} = quotationRequest;
    const expectedPrice = getFinalPrice(pricing);
    return (
        <Box data-testid="rfq-selector">
            <Header title={t("rfq.header")} icon="requestForQuotations">
                {(expectedPrice || comment) && (
                    <Flex>
                        {expectedPrice && (
                            <>
                                <Text>
                                    {t("common.suggestedPrice")}
                                    {t("common.colon")}
                                    <Text as="span" data-testid="quotation-request-asked-price">
                                        {formatNumber(expectedPrice, {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </Text>
                                </Text>
                            </>
                        )}
                        {expectedPrice && comment && <Text mx={1}>{"|"}</Text>}
                        {comment && <Text data-testid="quotation-request-comment">{comment}</Text>}
                    </Flex>
                )}
            </Header>
            <Box borderTop="1px solid" borderColor="grey.light" mt={6}>
                {carrier_quotations.map((quotation, index) => (
                    <Box
                        key={quotation.uid}
                        borderBottom="1px solid"
                        borderColor="grey.light"
                        pt={1}
                        pb={1}
                        data-testid={`rfq-selector-${index}`}
                    >
                        <QuotationCard
                            quotation={quotation}
                            severalQuotations={carrier_quotations.length > 1}
                            expectedDeliveryDate={expectedDeliveryDate}
                            onClick={() => onSelect(quotation)}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
