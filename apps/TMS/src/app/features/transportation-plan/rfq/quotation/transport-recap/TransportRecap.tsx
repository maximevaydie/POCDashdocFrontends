import {t} from "@dashdoc/web-core";
import {Badge, Box, Text} from "@dashdoc/web-ui";
import {SlimCompany, formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getFinalPrice} from "app/services/invoicing/pricing.service";
import {activityService} from "app/services/transport/activity.service";
import {Author, QuotationRequest} from "app/types/rfq";

import {ActivityRecap} from "./ActivityRecap";

import type {Transport} from "app/types/transport";

type TransportRecapProps = {
    transport: Transport;
    author: Author;
    authorCompany: SlimCompany;
    quotationRequest: QuotationRequest;
};

export const TransportRecap: FunctionComponent<TransportRecapProps> = ({
    transport,
    author,
    authorCompany,
    quotationRequest,
}) => {
    const activities = activityService.getTransportActivities(transport);
    const {pricing} = quotationRequest;
    const expectedPrice = getFinalPrice(pricing);
    return (
        <Box flexGrow={1}>
            <Text variant="title" color="grey.dark" fontWeight={600}>
                {t("rfq.quotationRecap.orderSummary", {smart_count: transport.sequential_id})}
            </Text>

            <Box mt={6}>
                <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                    {t("invoiceTemplates.Shippers")}
                </Text>
                <Text>
                    <strong>{authorCompany.name}</strong>
                    <br />
                    <Text as="span">
                        {author.first_name} {author.last_name}
                    </Text>
                    <br />
                    <Text as="span">
                        {author.email}
                        {author.email && author.phone_number && " - "}
                        {author.phone_number}
                    </Text>
                </Text>
            </Box>

            {expectedPrice && (
                <Box borderTopColor="grey.light" borderTopWidth={1} borderTopStyle="solid" mt={4}>
                    <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                        {t("rfq.quotationRecap.suggestedPrice")}
                    </Text>
                    <Badge shape="squared">
                        <Text variant="title" color="blue.dark" fontWeight={600}>
                            {formatNumber(expectedPrice, {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 2,
                            })}
                        </Text>
                    </Badge>
                </Box>
            )}

            {quotationRequest.comment && (
                <Box borderTopColor="grey.light" borderTopWidth={1} borderTopStyle="solid" mt={6}>
                    <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                        {t("common.comment")}
                    </Text>
                    <Text>{quotationRequest.comment}</Text>
                </Box>
            )}

            {activities.map((activity, index) => (
                <Box
                    borderTopColor="grey.light"
                    key={activity.index}
                    borderTopWidth={1}
                    borderTopStyle="solid"
                    mt={index > 0 ? 1 : 4}
                >
                    <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                        {t(activity.type === "loading" ? "common.pickup" : "common.delivery")}
                    </Text>
                    <ActivityRecap activity={activity} />
                </Box>
            ))}

            {transport.requested_vehicle && (
                <Box borderTopColor="grey.light" borderTopWidth={1} borderTopStyle="solid" mt={6}>
                    <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                        {t("components.requestedVehicle")}
                    </Text>
                    <Text>
                        {transport.requested_vehicle.label}
                        {transport.requested_vehicle.complementary_information &&
                            `, ${transport.requested_vehicle.complementary_information}`}
                    </Text>
                </Box>
            )}
        </Box>
    );
};
