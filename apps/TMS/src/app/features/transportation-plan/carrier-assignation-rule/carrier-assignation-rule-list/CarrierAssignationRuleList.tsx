import {TableProps} from "@dashdoc/web-ui";
import {CarrierAssignationRule} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";
import {useLocation} from "react-router";

import {EntityList} from "app/features/core/entity-list/entity-list";
import {entityService} from "app/features/core/entity-list/entity.service";

import {CarrierAssignationRuleModal} from "../carrier-assignation-rule-modal/CarrierAssignationRuleModal";

import dataBehavior from "./behavior/dataBehavior";
import {tableBehavior} from "./behavior/tableBehavior";
import {rulesParseQuery} from "./utils";

import type {EntityItem} from "app/features/core/entity-list/types";

type CarrierAssignationRuleListProps = {
    onUpdate: (rule: CarrierAssignationRule) => void;
    deleteRule: (ruleUid: number) => Promise<unknown>;
    isReadOnly: boolean;
    isSubmitting: boolean;
} & Partial<TableProps>;

export const CarrierAssignationRuleList: FunctionComponent<CarrierAssignationRuleListProps> = ({
    onUpdate,
    deleteRule,
    isReadOnly,
    isSubmitting,
    ...props
}) => {
    const [rule, setRule] = useState<CarrierAssignationRule | null>(null);
    const location = useLocation();
    const currentQuery = rulesParseQuery(location.search);
    const onClick = (aRule: CarrierAssignationRule) => {
        setRule(aRule);
    };

    const onDelete = async (items: EntityItem[]) => {
        const promises = items.map(entityService.getIdentifier).map(deleteRule);
        await Promise.all(promises);
    };
    return (
        <>
            <EntityList
                tableBehavior={tableBehavior}
                dataBehavior={dataBehavior}
                currentQuery={currentQuery}
                onClick={onClick}
                onDelete={isReadOnly ? undefined : onDelete}
                data-testid="carrier-assignation-rules-list"
                {...props}
            />
            {rule && (
                <CarrierAssignationRuleModal
                    onSubmit={onUpdate}
                    isSubmitting={isSubmitting}
                    isReadOnly={isReadOnly}
                    onClose={() => setRule(null)}
                    entity={rule}
                />
            )}
        </>
    );
};
