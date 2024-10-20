import {CommonAction, useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon, TooltipWrapper, toast} from "@dashdoc/web-ui";
import {CarrierAssignationRule} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {CarrierAssignationRuleModal} from "app/features/transportation-plan/carrier-assignation-rule/carrier-assignation-rule-modal/CarrierAssignationRuleModal";
import useIsShipper from "app/hooks/useIsShipper";
import {useAssignationRule} from "app/hooks/useAssignationRule";
import {useIsReadOnly} from "app/hooks/useIsReadOnly";

export function AssignationRuleSetup() {
    const history = useHistory();
    const baseUrl = useBaseUrl();
    const isReadOnly = useIsReadOnly();
    const isShipper = useIsShipper();
    const {createRule, isRuleSubmitting} = useAssignationRule();
    if (!isShipper) {
        return null;
    }
    return (
        <>
            {!isReadOnly && (
                <CommonAction
                    data-testid="transports-screen-create-assignation-rule"
                    buttonLabel={t("shipper.assignationRule.create")}
                    // @ts-ignore
                    modalComponent={CarrierAssignationRuleModal}
                    onAction={async (rule: CarrierAssignationRule) => {
                        await createRule(rule);
                        toast.success(t("shipper.assignationRuleSuccessfullyCreated"));
                    }}
                    variant="secondary"
                    style={{
                        borderTopRightRadius: "0px",
                        borderBottomRightRadius: "0px",
                    }}
                    ml={2}
                    errorToastMessage={t("shipper.assignationRule.createError")}
                    disabled={isRuleSubmitting}
                />
            )}
            <TooltipWrapper
                content={t("shipper.assignationRule.manageAndEdit")}
                placement="bottom"
            >
                <Button
                    style={
                        isReadOnly
                            ? {}
                            : {
                                  borderTopLeftRadius: "0px",
                                  borderBottomLeftRadius: "0px",
                                  borderLeft: "none",
                              }
                    }
                    data-testid="companies-screen-rules-button"
                    onClick={() => {
                        history.push(`${baseUrl}/assignation-rules/`, {
                            from: `${location.pathname}${location.search}`,
                        });
                    }}
                    variant="secondary"
                    about="shipper.assignationRule.manageAndEdit"
                >
                    <Icon name="cog" />
                    &nbsp;
                    {/* hack to display in the same way a button without text */}
                </Button>
            </TooltipWrapper>
        </>
    );
}
