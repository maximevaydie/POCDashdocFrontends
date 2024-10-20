import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, NoWrap, Text} from "@dashdoc/web-ui";
import {formatDate, formatNumber, parseAndZoneDate} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getTransportTotalInvoicedPrice} from "app/services/invoicing/pricing.service";
import {isTransportCancelled} from "app/services/transport";

import {InvoiceabilityTransport} from "../transports-invoiceability/transports-invoiceability";

import {ErrorMessage} from "./ErrorMessage";

import type {Site, Transport} from "app/types/transport";

export const InvoiceTransportResume: FunctionComponent<
    {
        priceError?: string | null;
        customerToInvoiceError?: string | null;
    } & (
        | {showDetails: false; transport: InvoiceabilityTransport}
        | {showDetails: true; transport: Transport}
    )
> = ({transport, priceError, customerToInvoiceError, showDetails}) => {
    let debtorName = null;
    if (!customerToInvoiceError) {
        if (!transport.customer_to_invoice) {
            customerToInvoiceError = t("invoicingFlow.customerToInvoiceMissing");
        } else if (!("invoicing_address" in transport.customer_to_invoice) && showDetails) {
            customerToInvoiceError = t("invoicingFlow.customerToInvoiceInvalid");
        } else {
            debtorName = transport.customer_to_invoice?.name;
        }
    }

    const transportPrice = getTransportTotalInvoicedPrice(transport);
    if (!priceError) {
        if (transportPrice === null) {
            priceError = t("invoicingFlow.priceMissing");
        } else if (transportPrice < 0) {
            priceError = t("invoicingFlow.negativePrice");
        }
    }

    return (
        <Flex flexDirection="column" flex={1} p={3}>
            <Flex flexDirection="row" justifyContent="space-between">
                {debtorName && !customerToInvoiceError ? (
                    <Text fontWeight={600}>
                        <NoWrap>{debtorName}</NoWrap>
                    </Text>
                ) : (
                    <ErrorMessage
                        message={customerToInvoiceError ?? t("common.customerToInvoice")}
                        data-testid="customer_to_invoice_error"
                    />
                )}

                {transportPrice !== null && !priceError ? (
                    <Text fontWeight={600} ml={1} whiteSpace="nowrap">
                        {t("common.priceWithoutTaxes", {
                            price: formatNumber(transportPrice, {
                                style: "currency",
                                currency: "EUR",
                            }),
                        })}
                    </Text>
                ) : (
                    <ErrorMessage
                        message={priceError ?? t("common.price")}
                        data-testid="price_error"
                    />
                )}
            </Flex>
            {showDetails ? (
                <TransportDetails transport={transport as Transport} />
            ) : (
                <Text variant="subcaption" color="grey.dark" mr={1}>
                    {t("transportDetails.transportNumber", {
                        number: transport.sequential_id,
                    })}
                </Text>
            )}
        </Flex>
    );
};

const TransportDetails: FunctionComponent<{transport: Transport}> = ({transport}) => {
    const originSites = new Array<Site>();
    const destinationSites = new Array<Site>();
    transport.deliveries.forEach((delivery) => {
        if (
            !originSites.find((existingOrigin) => existingOrigin.uid === delivery.origin.uid) &&
            delivery.origin?.address
        ) {
            originSites.push(delivery.origin);
        }
        if (
            !destinationSites.find(
                (existingDestination) => existingDestination.uid === delivery.destination.uid
            ) &&
            delivery.destination?.address
        ) {
            destinationSites.push(delivery.destination);
        }
    });
    const isCancelled = isTransportCancelled(transport);
    return (
        <Flex flexDirection="row">
            <Flex flex={1} flexDirection="column">
                <Flex flexDirection="row" mb={1}>
                    <Text variant="subcaption" color="grey.dark" mr={1}>
                        {t("transportDetails.transportNumber", {
                            number: transport.sequential_id,
                        })}
                    </Text>
                    {transport.deliveries[0].shipper_reference && (
                        <Text variant="subcaption" color="grey.dark">
                            - {transport.deliveries[0].shipper_reference}
                        </Text>
                    )}
                </Flex>
                <ActivityLabel activity={transport.segments[0].origin} />
                <Box
                    borderLeft="1px solid"
                    borderColor="grey.light"
                    my={-1}
                    py={1}
                    ml="5px"
                    pl={2}
                    minHeight="14px"
                >
                    {transport.segments.length > 1 && (
                        <Text color="grey.dark" variant="subcaption">
                            +{" "}
                            {t("trip.addSelectedActivitiesNumber", {
                                smart_count: transport.segments.length - 1,
                            })}
                        </Text>
                    )}
                </Box>
                <ActivityLabel
                    activity={transport.segments[transport.segments.length - 1].destination}
                />
            </Flex>
            {isCancelled && (
                <Box>
                    <Flex fontWeight="600" justifyContent="flex-end" alignItems="flex-end">
                        <ErrorMessage
                            withIcon={false}
                            message={t("components.cancelled")}
                            data-testid="transport_cancelled"
                        />
                    </Flex>
                </Box>
            )}
        </Flex>
    );
};

const ActivityLabel: FunctionComponent<{activity: Site}> = ({activity}) => {
    const timezone = useTimezone();
    const addressLabel = activity.address
        ? activity.address.postcode + " " + activity.address.city
        : null;
    const dateLabel = activity.real_start
        ? formatDate(parseAndZoneDate(activity.real_start, timezone), "P")
        : null;

    return (
        <Flex alignItems="center">
            <Box
                width="11px"
                height="11px"
                borderRadius="50%"
                border="2px solid"
                borderColor="grey.light"
                mr={1}
            />
            <Text variant="subcaption" key={activity.uid}>
                {[addressLabel, dateLabel].filter((v) => !!v).join(" - ")}
            </Text>
        </Flex>
    );
};
