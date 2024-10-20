import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    BadgeColorVariant,
    Flex,
    Icon,
    IconNames,
    NoWrap,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {SlimQuotationRequest, parseAndZoneDate} from "dashdoc-utils";
import differenceInHours from "date-fns/differenceInHours";
import React, {FunctionComponent, ReactNode} from "react";

type QuotationRequestTableCellProps = {
    quotationRequest: SlimQuotationRequest | null;
};

export const QuotationRequestTableCell: FunctionComponent<QuotationRequestTableCellProps> = ({
    quotationRequest,
}) => {
    if (quotationRequest) {
        return (
            <Flex height="100%" alignItems="center">
                <QuotationStatus quotationRequest={quotationRequest} />
            </Flex>
        );
    }
    return null;
};

type QuotationStatusProps = {
    quotationRequest: SlimQuotationRequest;
};

const QuotationStatus: FunctionComponent<QuotationStatusProps> = ({quotationRequest}) => {
    const timezone = useTimezone();
    const {counts, created} = quotationRequest;
    const now = new Date();
    const createdDate = parseAndZoneDate(created, timezone);
    const moreThan4hours = createdDate !== null && differenceInHours(now, createdDate) >= 4;
    const {replied, sent} = counts;
    let result = <StatusBadge icon="send" label={t("rfq.status.sent")} variant="neutral" />;
    if (replied > 0) {
        result = (
            <StatusBadge
                label={t("rfq.status.sentStats", {smart_count: replied, sent})}
                icon="requestForQuotations"
            />
        );
    } else if (moreThan4hours) {
        const label = t("rfq.status.sentStats", {smart_count: 0});
        result = <StatusBadge label={label} variant="warning" icon="clock" />;
    }

    return result;
};

const StatusBadge: FunctionComponent<{
    label: ReactNode;
    icon: IconNames;
    variant?: BadgeColorVariant;
}> = ({label, icon, variant = "blue"}) => (
    <TooltipWrapper content={label} boxProps={{display: "flex"}}>
        <Badge
            ml={2}
            shape="squared"
            data-testid={`quotation-${variant}`}
            variant={variant}
            noWrap
        >
            <Flex style={{gap: "4px"}} overflow="hidden">
                <Icon name={icon} />
                <NoWrap>{label}</NoWrap>
            </Flex>
        </Badge>
    </TooltipWrapper>
);
