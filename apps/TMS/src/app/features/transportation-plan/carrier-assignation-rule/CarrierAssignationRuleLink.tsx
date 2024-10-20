import {t} from "@dashdoc/web-core";
import {Icon, Link, TooltipWrapper} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export interface CarrierAssignationRuleLinkProps {
    rule: {name: string; deleted: string | null};
    onClick: () => unknown;
}
export const CarrierAssignationRuleLink: FunctionComponent<CarrierAssignationRuleLinkProps> = ({
    rule,
    onClick,
}) => {
    const {name, deleted} = rule;
    if (deleted) {
        return (
            <TooltipWrapper content={t("shipper.assignationRule.deleted")}>
                <Icon name="warning" color="yellow.dark" /> {name}
            </TooltipWrapper>
        );
    }
    return <Link onClick={onClick}>{name}</Link>;
};
