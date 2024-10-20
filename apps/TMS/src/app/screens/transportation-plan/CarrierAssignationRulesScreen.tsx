import {useBaseUrl} from "@dashdoc/web-common";
import {CommonAction} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {CommonScreen} from "@dashdoc/web-ui";
import React, {FunctionComponent, useMemo} from "react";
import {useLocation} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {CarrierAssignationRuleList} from "app/features/transportation-plan/carrier-assignation-rule/carrier-assignation-rule-list/CarrierAssignationRuleList";
import {CarrierAssignationRuleModal} from "app/features/transportation-plan/carrier-assignation-rule/carrier-assignation-rule-modal/CarrierAssignationRuleModal";
import {useAssignationRule} from "app/hooks/useAssignationRule";
import {useIsReadOnly} from "app/hooks/useIsReadOnly";
import {ORDERS_TO_ASSIGN_OR_DECLINED_TAB} from "app/types/businessStatus";
import {SidebarTabNames} from "app/types/constants";

type CarrierAssignationRulesScreenProps = {};

export const CarrierAssignationRulesScreen: FunctionComponent<
    CarrierAssignationRulesScreenProps
> = () => {
    const {createRule, updateRule, deleteRule, isRuleSubmitting, key} = useAssignationRule();
    const baseUrl = useBaseUrl();
    const location = useLocation();
    const isReadOnly = useIsReadOnly();
    let back = useMemo(() => {
        let result = `${baseUrl}/orders/?tab=${ORDERS_TO_ASSIGN_OR_DECLINED_TAB}`;
        if (location.state) {
            const from = (location.state as any).from;
            if (from) {
                result = from;
            }
        }
        return result;
        // We don't update this back-link, this is a component lifecycle related value.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const actions = isReadOnly ? null : (
        <CommonAction
            buttonLabel={t("shipper.assignationRule.create")}
            modalComponent={CarrierAssignationRuleModal}
            onAction={createRule}
            disabled={isRuleSubmitting}
            errorToastMessage={t("shipper.assignationRule.createError")}
        />
    );
    return (
        <CommonScreen
            title={getTabTranslations(SidebarTabNames.CARRIER_ASSIGNATION_RULES)}
            backTo={back}
            backToLabel={t("app.back")}
            actions={actions}
        >
            <CarrierAssignationRuleList
                onUpdate={updateRule}
                isReadOnly={isReadOnly}
                isSubmitting={isRuleSubmitting}
                deleteRule={deleteRule}
                key={key}
            />
        </CommonScreen>
    );
};
