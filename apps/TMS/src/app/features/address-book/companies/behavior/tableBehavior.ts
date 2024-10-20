import {t} from "@dashdoc/web-core";
import {BaseRowProps} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

import {PartnerListColumnName, PartnersScreenQuery} from "../types";

import {AddressCell} from "./cells/AddressCell";
import {CreationMethodCell} from "./cells/CreationMethodCell";
import {OthersCell} from "./cells/OthersCell";
import {TypeCell} from "./cells/TypeCell";

import type {TableBehavior} from "app/features/core/entity-list/types";

export type PartnerListColumn = {
    name: PartnerListColumnName;
    label: string;
    width: string;
    clickable?: boolean;
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
        {name: "remote_id", label: t("components.remoteId"), width: "8em"},
        {name: "invoicing_remote_id", label: t("components.invoicingRemoteId"), width: "8em"},
        {name: "trade_number", label: t("components.tradeNumber"), width: "8em"},
        {name: "vat_number", label: t("components.VATNumber"), width: "8em"},
        {name: "account_code", label: t("invoicing.accountCode"), width: "8em"},
        {name: "side_account_code", label: t("invoicing.sideAccountCode"), width: "8em"},
        {
            name: "transports_in_last_month",
            label: t("addressBook.transportsCount"),
            width: "7em",
        },
        {name: "addresses", label: t("common.address"), width: "20em", clickable: false},
        {name: "type", label: t("common.type"), width: "14em"},
        {
            name: "creation_method",
            label: t("addressFilter.creationMethod"),
            width: "12em",
        },
    ] as PartnerListColumn[];

const getRowCellContent = (
    row: BaseRowProps,
    columnName: string,
    currentQuery: PartnersScreenQuery
) => {
    const company = row as unknown as Company & {transports_in_last_month: number};
    if (columnName === "addresses") {
        return company.addresses?.map((address) =>
            React.createElement(AddressCell, {
                company: row as unknown as Company,
                address,
                currentQuery,
            })
        );
    }
    if (columnName === "type") {
        return company.addresses?.map((address) =>
            React.createElement(TypeCell, {
                address,
            })
        );
    }
    if (columnName === "creation_method") {
        return company.addresses?.map((address) =>
            React.createElement(CreationMethodCell, {
                address,
            })
        );
    }
    return React.createElement(OthersCell, {
        company: row as unknown as Company & {transports_in_last_month: number},
        columnName: columnName as PartnerListColumnName,
        currentQuery,
    });
};

export const tableBehavior = {
    getColumns,
    getI18n,
    getRowCellContent,
} as TableBehavior;
