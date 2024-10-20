import {CompanyName, getConnectedCompany, PartnerInListOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Box, NoWrap, Text} from "@dashdoc/web-ui";
import {companyGetFullTradeNumber, formatNumber} from "dashdoc-utils";
import React from "react";
import Highlighter from "react-highlight-words";

import {
    PartnerListColumnName,
    PartnersScreenQuery,
} from "app/features/address-book/partners/types";
import {useSelector} from "app/redux/hooks";

type Props = {
    partner: PartnerInListOutput;
    columnName: PartnerListColumnName;
    currentQuery: PartnersScreenQuery;
};

export function OthersCell({partner, columnName, currentQuery}: Props) {
    const connectedCompanyIsInvited = useSelector(
        (state) => getConnectedCompany(state)?.account_type === "invited"
    );

    const searchedTexts: string[] = currentQuery.text ?? [];
    if (columnName === "name") {
        return (
            <NoWrap>
                <Text as="b" variant="captionBold" data-testid="company-name-cell">
                    <CompanyName company={partner} highlight={searchedTexts} />
                </Text>
                <Box>
                    {partner.invitation_status === "registered" && (
                        <Badge variant="success" shape="squared" mt={1}>
                            {t("addressFilter.invitationSignedUp")}
                        </Badge>
                    )}
                    {partner.invitation_status === "invited" && (
                        <Badge variant="blue" shape="squared" mt={1}>
                            {t("addressFilter.invitationPending")}
                        </Badge>
                    )}
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
                    textToHighlight={partner.remote_id ?? ""}
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
                    textToHighlight={partner.invoicing_remote_id ?? ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "trade_number") {
        if (!partner.is_verified && !connectedCompanyIsInvited) {
            return (
                <NoWrap>
                    <Highlighter
                        autoEscape={true}
                        searchWords={searchedTexts}
                        textToHighlight={companyGetFullTradeNumber(partner) || ""}
                    />
                </NoWrap>
            );
        }
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={companyGetFullTradeNumber(partner) || ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "vat_number") {
        if (!partner.is_verified && !connectedCompanyIsInvited) {
            return (
                <NoWrap>
                    <Highlighter
                        autoEscape={true}
                        searchWords={searchedTexts}
                        textToHighlight={partner.vat_number || ""}
                    />
                </NoWrap>
            );
        }
        return (
            <NoWrap>
                <Highlighter
                    autoEscape={true}
                    searchWords={searchedTexts}
                    textToHighlight={partner.vat_number || ""}
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
                    textToHighlight={partner.account_code ?? ""}
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
                    textToHighlight={partner.side_account_code ?? ""}
                />
            </NoWrap>
        );
    }

    if (columnName === "transports_in_last_month") {
        return <NoWrap>{formatNumber(partner.transports_in_last_month)}</NoWrap>;
    }
    return null;
}
