import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    BadgeColorVariant,
    Box,
    Button,
    Callout,
    DecoratedSection,
    Flex,
    NoWrap,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {Pricing, SimpleContact, formatDate, parseAndZoneDate} from "dashdoc-utils";
import differenceInDays from "date-fns/differenceInDays";
import React, {FunctionComponent, ReactNode} from "react";

import {OfferTooltip} from "app/features/transportation-plan/carrier-offer/components/OfferTooltip";
import {usePricingDetails} from "app/features/transportation-plan/hooks/usePricingDetails";
import {CarrierCard} from "app/features/transportation-plan/types";
import {Quotation} from "app/types/rfq";

type QuotationCardProps = {
    quotation: Quotation;
    expectedDeliveryDate: Date | null;
    severalQuotations: boolean;
    onClick: () => void;
};
export const QuotationCard: FunctionComponent<QuotationCardProps> = ({
    quotation,
    expectedDeliveryDate,
    severalQuotations,
    onClick,
}) => {
    const timezone = useTimezone();
    const {contact, status, carrier, pricing, comment, expected_delivery_date} = quotation;
    let daysDiff = false;
    const repliedDate = parseAndZoneDate(expected_delivery_date, timezone);
    if (
        expectedDeliveryDate &&
        repliedDate &&
        differenceInDays(expectedDeliveryDate, repliedDate) !== 0
    ) {
        daysDiff = true;
    }
    const card: CarrierCard = {
        id: carrier.pk,
        title: carrier.name,
        subTitle: <SubTitle contact={contact} />,
        carrierPk: carrier.pk,
    };

    let rightContent = <StatusBadge label={t("common.demandSent")} />;
    if (status === "REPLIED") {
        let severity: "warning" | undefined = daysDiff ? "warning" : undefined;
        let confirmationMessage: ReactNode = (
            <Box>
                {daysDiff ? (
                    <>
                        <Text>
                            {t("rfq.assign.confirm.message.explanation", {name: carrier.name})}
                        </Text>
                        <Callout variant="warning" iconDisabled mt={4}>
                            <Text>
                                {t("rfq.assign.confirm.message.dateMismatch", {
                                    date: formatDate(
                                        parseAndZoneDate(expected_delivery_date, timezone),
                                        "P"
                                    ),
                                })}
                            </Text>
                        </Callout>
                    </>
                ) : (
                    <Text>
                        {t("rfq.assign.confirm.message.dateMatch", {
                            name: carrier.name,
                            date: formatDate(
                                parseAndZoneDate(expected_delivery_date, timezone),
                                "P"
                            ),
                        })}
                    </Text>
                )}

                <Box mt={4}>
                    {severalQuotations && (
                        <>
                            <Text mb={4}>{t("rfq.assign.confirm.message.othersDeclined")}</Text>
                        </>
                    )}
                    <Text>{t("rfq.assign.confirm.message.lastCall")}</Text>
                </Box>
            </Box>
        );
        rightContent = (
            <Button
                variant="secondary"
                onClick={onClick}
                ml={2}
                data-testid="select-quotation-button"
                withConfirmation
                modalProps={{
                    title: t("common.assignOrder"),
                    mainButton: {
                        children: t("common.assign"),
                        severity,
                    },
                }}
                confirmationMessage={confirmationMessage}
            >
                {t("common.select")}
            </Button>
        );
    } else if (status === "ACCEPTED") {
        rightContent = <StatusBadge label={t("common.selected")} variant="success" />;
    } else if (status === "REJECTED") {
        rightContent = <StatusBadge label={t("common.unpositioned")} variant="error" />;
    }
    return (
        <Flex flexDirection="column" style={{gap: "16px"}} py={2}>
            <DecoratedSection {...card}>
                <Flex
                    style={{gap: "8px"}}
                    justifyContent="flex-end"
                    alignItems="center"
                    flexGrow={1}
                >
                    <Box width="380px">
                        <Flex style={{gap: "8px"}} justifyContent="flex-end" alignItems="center">
                            <Flex flexDirection="column">
                                {expected_delivery_date && (
                                    <Flex alignItems="center" justifyContent="space-between">
                                        <Text pr={2}>
                                            {t("common.deliveryDate")}
                                            {t("common.colon")}
                                        </Text>
                                        <Text fontWeight={600}>
                                            {formatDate(expected_delivery_date, "P")}
                                        </Text>
                                    </Flex>
                                )}
                                {pricing && (
                                    <Flex alignItems="center" justifyContent="end">
                                        <Text pr={2}>
                                            {t("common.price")}
                                            {t("common.colon")}
                                        </Text>
                                        <PricingDetails pricing={pricing} />
                                    </Flex>
                                )}
                            </Flex>
                            <Flex justifyContent="center" width="150px">
                                {rightContent}
                            </Flex>
                        </Flex>
                    </Box>
                </Flex>
            </DecoratedSection>
            {comment && (
                <Text variant="caption" color="grey.dark" ml="48px">
                    {comment}
                </Text>
            )}
        </Flex>
    );
};

const SubTitle: FunctionComponent<{contact: SimpleContact | null}> = ({contact}) => {
    if (contact === null) {
        return (
            <Text variant="caption" color="grey.dark">
                {t("transportsForm.noContact")}
            </Text>
        );
    }
    const {email, phone_number} = contact;
    if (email || phone_number) {
        return (
            <Flex data-testid={`quotation-${email}`}>
                {email && (
                    <TooltipWrapper content={email}>
                        <Text variant="caption" color="grey.dark">
                            <NoWrap>{email}</NoWrap>
                        </Text>
                    </TooltipWrapper>
                )}
                {email && phone_number && (
                    <Text variant="caption" color="grey.dark">
                        {"|"}
                    </Text>
                )}
                {phone_number && (
                    <TooltipWrapper content={phone_number}>
                        <Text variant="caption" color="grey.dark">
                            <NoWrap>{phone_number}</NoWrap>
                        </Text>
                    </TooltipWrapper>
                )}
            </Flex>
        );
    }
    return null;
};

const StatusBadge: FunctionComponent<{
    label: string;
    variant?: BadgeColorVariant;
}> = ({label, variant = "blue"}) => (
    <TooltipWrapper content={label}>
        <Badge
            ml={2}
            shape="squared"
            data-testid={`quotation-${variant}`}
            variant={variant}
            noWrap
        >
            {label}
        </Badge>
    </TooltipWrapper>
);

// TODO: to generalize with CarrierOfferRequested
const PricingDetails: FunctionComponent<{pricing: Pricing}> = ({pricing}) => {
    const pricingDetails = usePricingDetails(pricing);
    if (pricingDetails) {
        return (
            <Flex alignItems="center">
                <Text variant="h2" pr={2}>
                    {pricingDetails.value}
                </Text>
                <OfferTooltip rows={pricingDetails.rows} value={pricingDetails.value} />
            </Flex>
        );
    } else {
        return null;
    }
};
