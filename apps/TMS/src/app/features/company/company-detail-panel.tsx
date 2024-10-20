import {getAdministrativeAddress, PartnerDetailOutput, useFeatureFlag} from "@dashdoc/web-common";
import {getReadableAddress, t} from "@dashdoc/web-core";
import {TooltipWrapper} from "@dashdoc/web-ui";
import {Company, companyGetFullTradeNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {CompanyInformationRow} from "./company-information-row";

export const CompanyDetail: FunctionComponent<{
    company: Company | PartnerDetailOutput;
    wordsToHighlight?: string[];
}> = ({company, wordsToHighlight}) => {
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const administrativeAddress = getAdministrativeAddress(company);

    return (
        <>
            <CompanyInformationRow
                data-testid="company-information-row-trade-number"
                label={t("components.tradeNumber")}
                icon="balance"
                value={companyGetFullTradeNumber(company)}
                wordsToHighlight={wordsToHighlight}
            />
            <CompanyInformationRow
                data-testid="company-information-row-vat-number"
                label={t("components.VATNumber")}
                icon="balance"
                value={company.vat_number}
                wordsToHighlight={wordsToHighlight}
            />
            <TooltipWrapper content={t("components.remoteIdTooltip")}>
                <CompanyInformationRow
                    data-testid="company-information-row-remote-id"
                    label={t("components.remoteId")}
                    icon="link"
                    value={company.remote_id}
                    wordsToHighlight={wordsToHighlight}
                />
            </TooltipWrapper>
            {hasInvoiceEntityEnabled && (
                <TooltipWrapper content={t("components.invoicingRemoteIdTooltip")}>
                    <CompanyInformationRow
                        data-testid="company-information-row-invoicing-remote-id"
                        label={t("components.invoicingRemoteId")}
                        icon="link"
                        value={company.invoicing_remote_id}
                        wordsToHighlight={wordsToHighlight}
                    />
                </TooltipWrapper>
            )}
            <CompanyInformationRow
                data-testid="company-information-row-email"
                label={t("common.email")}
                icon="envelope"
                value={company.email}
                wordsToHighlight={wordsToHighlight}
            />
            <CompanyInformationRow
                data-testid="company-information-row-phone-number"
                label={t("common.phoneNumber")}
                icon="phone"
                value={company.phone_number}
                wordsToHighlight={wordsToHighlight}
            />
            <TooltipWrapper
                content={
                    company.can_invite_to
                        ? ""
                        : t("common.administrativeAddress.tooltip", {companyName: company.name})
                }
            >
                <CompanyInformationRow
                    data-testid="company-information-row-primary-address"
                    label={t("common.administrativeAddress")}
                    icon="address"
                    value={getReadableAddress(administrativeAddress)}
                    wordsToHighlight={wordsToHighlight}
                />
            </TooltipWrapper>
            <CompanyInformationRow
                data-testid="company-information-row-country"
                label={t("common.country")}
                icon="flag"
                value={company.country}
                wordsToHighlight={wordsToHighlight}
            />
        </>
    );
};
