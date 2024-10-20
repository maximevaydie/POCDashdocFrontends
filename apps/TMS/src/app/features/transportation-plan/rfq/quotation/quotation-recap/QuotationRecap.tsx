import {t} from "@dashdoc/web-core";
import {BROWSER_TIMEZONE} from "@dashdoc/web-core";
import {Badge, Box, Flex, Icon, RejectedSVG, RepliedSVG, Text} from "@dashdoc/web-ui";
import {TransportGlobalStatus, formatDate, formatNumber, parseAndZoneDate} from "dashdoc-utils";
import React, {FunctionComponent, ReactNode} from "react";

import {Quotation} from "app/types/rfq";

type QuotationRecapProps = {
    quotation: Quotation;
    transportStatus: TransportGlobalStatus;
};

export const QuotationRecap: FunctionComponent<QuotationRecapProps> = ({
    quotation,
    transportStatus,
}) => {
    const {status} = quotation;
    return (
        <Flex mt={4} flexGrow={1} flexDirection="column">
            <Header transportStatus={transportStatus} quotation={quotation} />
            {(status === "REPLIED" || status === "ACCEPTED") && (
                <Box mt={7}>
                    <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                        {t("rfq.quotationRecap.quotationSummary")}
                        <Flex flexWrap="wrap" style={{gap: "16px"}} mt={5}>
                            <Badge shape="squared">
                                <Icon name="euro" />
                                <Text ml={2}>
                                    {t("common.price")}
                                    {t("common.colon")}
                                    {formatNumber(
                                        quotation.pricing?.final_price_with_gas_indexed,
                                        {
                                            style: "currency",
                                            currency: "EUR",
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </Text>
                            </Badge>
                            <Badge shape="squared">
                                <Icon name="calendar" />
                                <Text ml={2}>
                                    {t("common.deliveryDate")}
                                    {t("common.colon")}
                                    {formatDate(
                                        parseAndZoneDate(
                                            quotation.expected_delivery_date,
                                            BROWSER_TIMEZONE
                                        ),
                                        "PPPp"
                                    )}
                                </Text>
                            </Badge>
                            {quotation.comment && (
                                <Badge shape="squared">
                                    <Icon name="bubble" mr={2} />
                                    <Text>
                                        {t("common.comment")}
                                        {t("common.colon")}
                                        {quotation.comment}
                                    </Text>
                                </Badge>
                            )}
                        </Flex>
                    </Text>
                </Box>
            )}
        </Flex>
    );
};

const Header: FunctionComponent<QuotationRecapProps> = ({quotation, transportStatus}) => {
    let svgContent: ReactNode;
    let title: ReactNode;
    if (transportStatus === "ordered") {
        // RFQ is pending
        if (quotation.status === "REJECTED") {
            svgContent = <RejectedSVG />;
            title = t("rfq.quotationRecap.youDeclined");
        } else {
            svgContent = <RepliedSVG />;
            title = t("rfq.quotationRecap.youSent");
        }
    } else {
        // RFQ closed
        svgContent = <RejectedSVG />;
        if (quotation.status === "ACCEPTED") {
            // you win
            svgContent = <RepliedSVG />;
            title = (
                <>
                    <Text variant="title" as="span" color="grey.dark">
                        {t("rfq.quotationRecap.accepted")}
                    </Text>
                    <br />
                    <Text as="span" color="grey.dark">
                        {t("rfq.quotationRecap.acceptedExplanation")}
                    </Text>
                </>
            );
        } else if (quotation.status === "PENDING") {
            title = t("rfq.quotationRecap.noLongerAvailable");
        } else if (quotation.status === "REJECTED") {
            title = t("rfq.quotationRecap.youDeclined");
        } else {
            title = t("rfq.quotationRecap.notAccepted");
        }
    }
    return (
        <Box mt={4} flexDirection="column">
            <Flex justifyContent="center" mt={10}>
                {svgContent}
            </Flex>
            <Flex justifyContent="center" mt={7}>
                <Text variant="title" color="grey.dark" fontWeight={600} textAlign="center">
                    {title}
                </Text>
            </Flex>
        </Box>
    );
};
