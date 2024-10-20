import {t} from "@dashdoc/web-core";
import {Badge, Flex, Text, themeAwareCss, TooltipWrapper} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatDate, formatNumber} from "dashdoc-utils";
import React, {ReactNode} from "react";

import {TransportAssignationHistory} from "../types";

import {AssignedTransportHistoryDetailedCard} from "./AssignedTransportHistoryDetailedCard";

const Container = styled(Flex)(
    themeAwareCss({
        justifyContent: "space-between",
        mt: 4,
        p: 3,
        borderWidth: 1,
        borderColor: "grey.light",
        borderStyle: "solid",
        borderRadius: 2,
        cursor: "pointer",

        "&:hover": {
            backgroundColor: "grey.ultralight",
            borderColor: "grey.dark",
        },
    })
);

interface Props {
    "data-testid": string;
    transportAssignationHistory: TransportAssignationHistory;
    onClick: () => void;
}

export function AssignedTransportHistoryCard({
    "data-testid": dataTestId,
    transportAssignationHistory,
    onClick,
}: Props) {
    const {quotation} = transportAssignationHistory;

    let quotationContent: ReactNode = <Text color="red.default">{t("components.noPrice")}</Text>;
    if (quotation !== null) {
        quotationContent = (
            <Badge shape="squared" height="fit-content">
                <Text flexGrow={1} color="blue.dark" variant="h1">
                    {formatNumber(quotation.final_price_with_gas_indexed, {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            </Badge>
        );
    }

    return (
        <TooltipWrapper
            content={
                <AssignedTransportHistoryDetailedCard
                    transportAssignationHistory={transportAssignationHistory}
                />
            }
            placement="left"
            delayShow={400}
        >
            <Container onClick={onClick} data-testid={dataTestId}>
                <Flex flexDirection="column">
                    <Text variant="h2">{transportAssignationHistory.carrier.name}</Text>
                    <Text>
                        {formatDate(transportAssignationHistory.first_loading_datetime, "P")}
                    </Text>
                </Flex>
                {quotationContent}
            </Container>
        </TooltipWrapper>
    );
}
