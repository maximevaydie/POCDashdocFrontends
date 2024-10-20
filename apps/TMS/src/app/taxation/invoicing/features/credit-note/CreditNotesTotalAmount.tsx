import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {useMemo} from "react";

import {
    getInvoicesOrCreditNotesQueryParamsFromFiltersQuery,
    InvoicesOrCreditNotesListQuery,
} from "app/features/filters/deprecated/utils";
import {SearchQuery} from "app/redux/reducers/searches";
import {useCreditNotesTotalAmount} from "app/screens/invoicing/hooks/useCreditNotesTotalAmount";

type Props = {
    currentQuery: InvoicesOrCreditNotesListQuery;
    selectedCreditNotesQuery: SearchQuery;
    allCreditNotesSelected: boolean;
};
export function CreditNotesTotalAmount({
    currentQuery,
    selectedCreditNotesQuery,
    allCreditNotesSelected,
}: Props) {
    const timezone = useTimezone();

    const filters = useMemo(() => {
        let result: SearchQuery = selectedCreditNotesQuery;
        if (allCreditNotesSelected) {
            result = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(currentQuery, timezone);

            // since we send the filters in a POST request, we need to transform them
            if (result.search && result.search.length > 0) {
                result.search = result.search[0];
            }
            for (const key of Object.keys(result)) {
                if (typeof result[key] === "object" && result[key].length === 0) {
                    delete result[key];
                }
            }
        }
        return result;
    }, [selectedCreditNotesQuery, currentQuery, timezone, allCreditNotesSelected]);

    const {total_price_ex_tax, total_price_incl_tax} = useCreditNotesTotalAmount(filters);

    return (
        <>
            <Flex alignItems="center">
                <Flex mr={2}>
                    <Text as="span" fontWeight="bold" mr={1}>
                        {t("invoices.totalExcludingTax")}
                    </Text>
                    <Text as="span">
                        {formatNumber(total_price_ex_tax, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                </Flex>
                <TooltipWrapper
                    boxProps={{display: "flex", alignItems: "center"}}
                    placement="left"
                    content={
                        <Flex flexDirection={"column"}>
                            <Flex>
                                <Text fontWeight="bold" mr={1}>
                                    {t("invoices.totalExcludingTax")}
                                </Text>
                                <Text fontWeight="bold">
                                    {formatNumber(total_price_ex_tax, {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </Text>
                            </Flex>
                            <Flex>
                                <Text fontWeight="bold" mr={1}>
                                    {t("invoices.totalIncludingTax")}
                                </Text>
                                <Text fontWeight="bold">
                                    {formatNumber(total_price_incl_tax, {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </Text>
                            </Flex>
                        </Flex>
                    }
                >
                    <Icon name="info" ml={1} />
                </TooltipWrapper>
            </Flex>
        </>
    );
}
