import {t} from "@dashdoc/web-core";
import {ClickableUpdateRegion, Flex, Icon, Text} from "@dashdoc/web-ui";
import {ActivityTurnoverData, formatNumber} from "dashdoc-utils";
import React from "react";
import {FunctionComponent} from "react";

interface Props {
    priceWithoutPurchaseCosts: number | null;
    meanTurnover: ActivityTurnoverData;
    meanTurnoverIsOverridden: boolean;
    onClick: () => void;
}

export const MeanTurnoverRegion: FunctionComponent<Props> = ({
    priceWithoutPurchaseCosts,
    meanTurnover,
    meanTurnoverIsOverridden,
    onClick,
}) => {
    const weight = meanTurnoverIsOverridden
        ? meanTurnover.manual_weight
        : meanTurnover.automatic_data.weight;
    const price =
        priceWithoutPurchaseCosts !== null ? priceWithoutPurchaseCosts * parseFloat(weight) : null;

    return (
        <ClickableUpdateRegion clickable={true} onClick={onClick}>
            <Flex>
                <Icon name="turnover" />
                <Text ml={1}>
                    {t("splitMeansTurnover.shareOfRevenue")}{" "}
                    {formatNumber(price, {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 2,
                    })}{" "}
                    (
                    {formatNumber(weight, {
                        style: "percent",
                    })}
                    )
                </Text>
            </Flex>
        </ClickableUpdateRegion>
    );
};
