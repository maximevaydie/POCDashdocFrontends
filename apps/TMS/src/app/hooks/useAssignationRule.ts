import {guid} from "@dashdoc/core";
import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {
    CarrierAssignationRule,
    type CarrierAssignationRulePatch,
    type CarrierAssignationRulePost,
} from "dashdoc-utils";
import pick from "lodash.pick";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";

import type {Transport} from "app/types/transport";

export function useAssignationRule(transport?: Transport) {
    const [key, setKey] = useState("_");
    const [{isLoading, rule}, setRuleState] = useState<{
        isLoading: boolean;
        rule: CarrierAssignationRule | null;
    }>({isLoading: true, rule: null});
    const [isRuleSubmitting, setIsRuleSubmitting] = useState<boolean>(false);

    const ruleUid = transport?.carrier_assignation_rule?.id;
    const deleted = transport?.carrier_assignation_rule?.deleted;
    useEffect(() => {
        if (deleted) {
            setRuleState({isLoading: false, rule: null});
        } else if (ruleUid) {
            const fetch = async () => {
                setRuleState({isLoading: true, rule: null});
                try {
                    const aRule = await apiService.CarrierAssignationRules.get(ruleUid);
                    setRuleState({isLoading: false, rule: aRule});
                } catch (e) {
                    Logger.error(e);
                    toast.error(t("common.error"));
                    setRuleState({isLoading: false, rule: null});
                }
            };
            fetch();
        } else {
            setRuleState({isLoading: false, rule: null});
        }
    }, [ruleUid, deleted]);

    const createRule = async (rule: CarrierAssignationRule) => {
        setIsRuleSubmitting(true);
        try {
            const {carrier, ...otherFields} = rule;
            /**
             * Avoid the following endpoint error, provide only the carrier pk.
             * \"pk\" and \"remote_id\" are mutually exclusive. Only send one of them.
             */
            const data: CarrierAssignationRulePost = {
                ...otherFields,
                carrier: pick(carrier, ["pk"]),
                requested_vehicle: otherFields.requested_vehicle.label,
            };
            const newRule = await apiService.CarrierAssignationRules.post({data});
            setKey(guid());
            return newRule;
        } catch (e) {
            Logger.error(e);
            toast.error(t("common.error"));
        } finally {
            setIsRuleSubmitting(false);
        }
        return null;
    };

    const updateRule = async (rule: CarrierAssignationRule) => {
        setIsRuleSubmitting(true);
        try {
            const {carrier, ...otherFields} = rule;
            setRuleState((prev) => {
                let result = prev;
                if (prev.rule?.id === rule.id) {
                    result = {...prev, isLoading: true};
                }
                return result;
            });
            /**
             * Avoid the following endpoint error, provide only the carrier pk.
             * \"pk\" and \"remote_id\" are mutually exclusive. Only send one of them.
             */
            const data: CarrierAssignationRulePatch = {
                ...otherFields,
                carrier: pick(carrier, ["pk"]),
                requested_vehicle: otherFields.requested_vehicle.label,
            };
            const newRule = await apiService.CarrierAssignationRules.patch(rule.id, {data});
            setKey(guid());
            setRuleState((prev) => {
                let result = prev;
                if (prev.rule?.id === rule.id) {
                    result = {rule: newRule, isLoading: false};
                }
                return result;
            });
            return newRule;
        } catch (e) {
            Logger.error(e);
            toast.error(t("common.error"));
            setRuleState((prev) => ({...prev, isLoading: false}));
        } finally {
            setIsRuleSubmitting(false);
        }
        return null;
    };

    const deleteRule = async (ruleUid: number) => {
        setIsRuleSubmitting(true);
        try {
            await apiService.CarrierAssignationRules.delete(ruleUid);
            setKey(guid());
        } catch (e) {
            Logger.error(e);
            toast.error(t("common.error"));
        } finally {
            setIsRuleSubmitting(false);
        }
    };

    return {
        createRule,
        updateRule,
        deleteRule,
        isRuleSubmitting,
        isLoading,
        rule,
        key,
    };
}
