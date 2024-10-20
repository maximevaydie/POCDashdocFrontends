import {PartnerInListOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {SortCriteriaOption} from "@dashdoc/web-ui";
import React from "react";

import {CreatedByCell} from "app/features/address-book/partners/behavior/cells/CreatedByCell";

import {PartnerListColumnName, PartnersScreenQuery} from "../types";

import {AdministrativeAddressCell} from "./cells/AdministrativeAddressCell";
import {OthersCell} from "./cells/OthersCell";
import {TypeCell} from "./cells/TypeCell";

import type {TableBehavior} from "app/features/core/entity-list/types";

export type PartnerListColumn = {
    name: PartnerListColumnName;
    label: string;
    width: string;
};

const getI18n = (loadedItemsCount: number, totalCount: number) => ({
    allVisibleRowsSelectedMessage: t("components.relatedSelectedCompanies", {
        number: loadedItemsCount,
    }),
    selectAllRowsMessage: t("components.selectAllRelatedCompanies", {
        number: totalCount,
    }),
    allRowsSelectedMessage: t("components.allCompaniesSelectedCount", {
        count: totalCount,
    }),
});

const getColumns = () =>
    [
        {name: "name", label: t("common.name"), width: "15em"},
        {name: "address", label: t("common.address"), width: "15em"},
        {name: "type", label: t("common.type"), width: "14em"},
        {name: "trade_number", label: t("components.tradeNumber"), width: "8em"},
        {name: "vat_number", label: t("components.VATNumber"), width: "8em"},
        {name: "remote_id", label: t("components.remoteId"), width: "8em"},
        {name: "invoicing_remote_id", label: t("components.invoicingRemoteId"), width: "8em"},
        {name: "account_code", label: t("invoicing.accountCode"), width: "8em"},
        {name: "side_account_code", label: t("invoicing.sideAccountCode"), width: "8em"},
        {
            name: "transports_in_last_month",
            label: t("addressBook.transportsCount"),
            width: "7em",
        },
        {
            name: "created_by",
            label: t("addressFilter.creationMethod"),
            width: "12em",
        },
    ] as PartnerListColumn[];

const getSortableColumns = (): {
    [column in PartnerListColumnName]?: SortCriteriaOption<string>[];
} => {
    return {
        name: [{value: "name", label: t("common.name")}],
        remote_id: [{value: "remote_id", label: t("components.remoteId")}],
        invoicing_remote_id: [
            {value: "invoicing_remote_id", label: t("components.invoicingRemoteId")},
        ],
        trade_number: [{value: "trade_number", label: t("components.tradeNumber")}],
        vat_number: [{value: "vat_number", label: t("components.VATNumber")}],
        account_code: [{value: "account_code", label: t("invoicing.accountCode")}],
        side_account_code: [{value: "side_account_code", label: t("invoicing.sideAccountCode")}],
        transports_in_last_month: [
            {value: "transports_in_last_month", label: t("addressBook.transportsCount")},
        ],
        created_by: [
            {value: "created_by__company_name", label: t("addressBook.createdByCompany")},
            {value: "created", label: t("common.creationDate")},
        ],
    };
};

const getRowCellContent = (
    partner: PartnerInListOutput,
    columnName: string,
    currentQuery: PartnersScreenQuery
) => {
    if (columnName === "address") {
        return React.createElement(AdministrativeAddressCell, {
            partner: partner,
            currentQuery,
        });
    }
    if (columnName === "type") {
        return React.createElement(TypeCell, {
            partner,
        });
    }
    if (columnName === "created_by") {
        return React.createElement(CreatedByCell, {
            partner,
        });
    }
    return React.createElement(OthersCell, {
        partner: partner,
        columnName: columnName as PartnerListColumnName,
        currentQuery,
    });
};

export const tableBehavior = {
    getColumns,
    getSortableColumns,
    getI18n,
    getRowCellContent,
} as TableBehavior;
