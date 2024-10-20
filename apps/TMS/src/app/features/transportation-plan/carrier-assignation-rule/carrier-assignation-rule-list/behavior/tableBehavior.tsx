import {t} from "@dashdoc/web-core";
import {BaseRowProps} from "@dashdoc/web-ui";
import {CarrierAssignationRule} from "dashdoc-utils";
import React from "react";

import {Cells} from "./Cells";

import type {TableBehavior} from "app/features/core/entity-list/types";

export type RuleListColumnName = keyof CarrierAssignationRule;

const getI18n = (loadedItemsCount: number, totalCount: number) => ({
    allVisibleRowsSelectedMessage: t("components.relatedSelectedRules", {
        number: loadedItemsCount,
    }),
    selectAllRowsMessage: t("components.selectAllRelatedRules", {
        number: totalCount,
    }),
    allRowsSelectedMessage: t("components.allRulesSelectedCount", {
        count: totalCount,
    }),
    getDeleteConfirmationMessage: (itemNumber: number) =>
        t("components.confirmDeleteRule", {smart_count: itemNumber}),
});

const getColumns = () =>
    [
        {name: "name", label: t("common.name")},
        {name: "origin_area", label: t("shipper.assignationRule.origin")},
        {name: "destination_area", label: t("shipper.assignationRule.destination")},
        {name: "requested_vehicle", label: t("common.vehicleType")},
        {name: "active", label: t("common.state")},
    ] as {
        name: RuleListColumnName;
        label: string;
        width?: string;
        clickable?: boolean;
    }[];

const getRowCellContent = (row: BaseRowProps, columnName: string, currentQuery: any) => {
    return React.createElement(Cells, {
        rule: row as unknown as CarrierAssignationRule,
        columnName: columnName as RuleListColumnName,
        currentQuery,
    });
};

export const tableBehavior = {
    getColumns,
    getI18n,
    getRowCellContent,
} as TableBehavior;
