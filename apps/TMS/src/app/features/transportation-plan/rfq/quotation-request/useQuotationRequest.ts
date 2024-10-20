import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {SlimQuotationRequest} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import {useCallback, useState} from "react";
import cloneDeep from "rfdc/default";

import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useEntity} from "app/redux/hooks";
import {quotationRequestSchema} from "app/redux/schemas";
import {QuotationRequest} from "app/types/rfq";

import {QuotationRequestPost} from "./types";

/**
 * @guidedtour[epic=rfq] Hook for quotation request.
 * Hook to manage the quotation request of a given quotation request pk.
 * When there is a quotation request, this hook will:
 * * load the entity;
 * * return the entity/entity loading state.
 */
export const useQuotationRequest = (quotationRequest: SlimQuotationRequest | null) => {
    const quotationRequestPk: number | null = quotationRequest?.pk ?? null;
    const entityHook = useEntity<QuotationRequest, QuotationRequestPost>({
        id: quotationRequestPk,
        urlBase: "quotation-request",
        objName: "quotationRequest",
        objSchema: quotationRequestSchema,
    });
    const transportListRefresher = useRefreshTransportLists();
    const {reloadEntity} = entityHook;

    /**
     * Reload the entity when the SlimQuotationRequest evolved.
     * Indeed, the SlimQuotationRequest is updated thanks to the websocket pusher mechanism.
     * Here, we take a snapshot of the SlimQuotationRequest and compare it to the current one.
     * When they are different, we reload the entity (we update the snapshot to avoid infinite loop 😵).
     */
    const [snapshot, updateSnapshot] = useState<SlimQuotationRequest | null>(
        cloneDeep(quotationRequest)
    );
    if (!isEqual(snapshot, quotationRequest)) {
        updateSnapshot(cloneDeep(quotationRequest));
        reloadEntity();
    }

    const selectQuotation = useCallback(
        async (quotationUid: string) => {
            if (quotationRequestPk !== null) {
                try {
                    await apiService.post(
                        `/quotation-request/${quotationRequestPk}/select-carrier-quotation/`,
                        {
                            selected_carrier_quotation_uid: quotationUid,
                        }
                    );
                    transportListRefresher();
                    await reloadEntity();
                } catch {
                    toast.error(t("common.error"));
                }
            } else {
                toast.error(t("common.error"));
            }
        },
        [quotationRequestPk, reloadEntity, transportListRefresher]
    );

    return {
        ...entityHook /* Add custom states/functions here */,
        selectQuotation,
    };
};

export const useDeleteQuotationRequest = (quotationRequestPk: number) => {
    const deleteQuotationRequest = useCallback(async () => {
        try {
            await apiService.delete(`/quotation-request/${quotationRequestPk}/`);
        } catch {
            toast.error(t("common.error"));
        }
    }, [quotationRequestPk]);
    return deleteQuotationRequest;
};
