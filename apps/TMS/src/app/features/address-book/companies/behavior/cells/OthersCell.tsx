import {CompanyName, getConnectedCompany} from "@dashdoc/web-common";
import {Box, NoWrap, Text} from "@dashdoc/web-ui";
import {companyGetFullTradeNumber, formatNumber, type Company} from "dashdoc-utils";
import React from "react";
import Highlighter from "react-highlight-words";

import {
    PartnerListColumnName,
    PartnersScreenQuery,
} from "app/features/address-book/companies/types";
import {CompanySharingStatusBadge} from "app/features/company/company-sharing-status-badge";
import {useSelector} from "app/redux/hooks";

type Props = {
    company: Company & {transports_in_last_month: number};
    columnName: PartnerListColumnName;
    currentQuery: PartnersScreenQuery;
};

export function OthersCell({company, columnName, currentQuery}: Props) {
    const connectedCompanyIsInvited = useSelector(
        (state) => getConnectedCompany(state)?.account_type === "invited"
    );

    const searchedTexts: string[] = currentQuery.text ?? [];
    if (columnName === "name") {
        return (
            <NoWrap>
                <Text as="b" variant="captionBold" data-testid="company-name-cell">
                    <CompanyName company={company} highlight={searchedTexts} />
                </Text>
                <Box>
                    <CompanySharingStatusBadge company={company} />
                </Box>
            </NoWrap>
        );
    }

    if (columnName === "remote_id") {
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={company.remote_id ?? ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "invoicing_remote_id") {
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={company.invoicing_remote_id ?? ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "trade_number") {
        if (!company.is_verified && !connectedCompanyIsInvited) {
            return (
                <NoWrap>
                    <Highlighter
                        autoEscape={true}
                        searchWords={searchedTexts}
                        textToHighlight={companyGetFullTradeNumber(company) || ""}
                    />
                </NoWrap>
            );
        }
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={companyGetFullTradeNumber(company) || ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "vat_number") {
        if (!company.is_verified && !connectedCompanyIsInvited) {
            return (
                <NoWrap>
                    <Highlighter
                        autoEscape={true}
                        searchWords={searchedTexts}
                        textToHighlight={company.vat_number || ""}
                    />
                </NoWrap>
            );
        }
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={company.vat_number || ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "account_code") {
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={company.account_code ?? ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "side_account_code") {
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={company.side_account_code ?? ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "transports_in_last_month") {
        return <NoWrap>{formatNumber(company.transports_in_last_month)}</NoWrap>;
    }
    return null;
}
