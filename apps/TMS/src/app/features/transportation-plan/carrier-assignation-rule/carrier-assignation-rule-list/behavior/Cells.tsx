import {t} from "@dashdoc/web-core";
import {Badge} from "@dashdoc/web-ui";
import {Area, CarrierAssignationRule} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import Highlighter from "react-highlight-words";

import {DefaultCell} from "app/features/core/entity-list/components/default-cell";

import {RuleListColumnName} from "./tableBehavior";

export type OthersCellProps = {
    rule: CarrierAssignationRule;
    columnName: RuleListColumnName;
    currentQuery: any;
};

export const Cells: FunctionComponent<OthersCellProps> = ({rule, ...props}) => {
    const {currentQuery, columnName} = props;
    const searchWords: string[] = currentQuery.query ?? [];
    if (columnName === "origin_area") {
        return <AreaCell area={rule.origin_area} searchWords={searchWords} />;
    } else if (columnName === "destination_area") {
        return <AreaCell area={rule.destination_area} searchWords={searchWords} />;
    } else if (columnName === "requested_vehicle") {
        return (
            <Highlighter
                autoEscape={true}
                textToHighlight={rule.requested_vehicle.label || ""}
                searchWords={searchWords}
            />
        );
    } else if (columnName === "active") {
        if (rule.active) {
            return (
                <Badge display="inline-block" mr={1} mb={1} variant="success">
                    {t("common.enabled.female")}
                </Badge>
            );
        } else {
            return (
                <Badge display="inline-block" mr={1} mb={1} variant="error">
                    {t("common.disabled.female")}
                </Badge>
            );
        }
    }
    return <DefaultCell item={rule} {...props} />;
};

type AreaCellProps = {
    area: Area;
    searchWords: string[];
};
const AreaCell: FunctionComponent<AreaCellProps> = ({area, ...others}) => {
    return <Highlighter autoEscape={true} textToHighlight={area.name || ""} {...others} />;
};
