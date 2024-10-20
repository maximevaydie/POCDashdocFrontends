import {getConnectedCompany} from "@dashdoc/web-common";
import {AnalyticsEvent, analyticsService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {
    Company,
    FuelSurchargeAgreement,
    FuelSurchargeAgreementPayload,
    FuelSurchargeItem,
    InvoiceItem,
} from "dashdoc-utils";
import {useEffect, useState} from "react";

import {
    fetchFuelSurchargeAgreement,
    fetchUpdateFuelSurchargeAgreement,
} from "app/redux/actions/fuel-surcharge/fuel-surcharge-agreement";
import {useDispatch, useSelector} from "app/redux/hooks";

export type FuelSurchargeAgreementWithSurchargeItems = FuelSurchargeAgreement & {
    fuel_surcharge_items: FuelSurchargeItem[];
};

type FuelSurchargeAgreementHook = {
    isLoading: boolean;
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems | null;
    handleUpdate: (update: FuelSurchargeAgreementHookUpdate) => void;
    handleReload: () => void;
};

type FuelSurchargeAgreementHookUpdate = {
    invoiceItem?: InvoiceItem | null;
    clients?: {pk: number}[];
};

export function useFuelSurchargeAgreement(
    fuelSurchargeAgreementUid: string
): FuelSurchargeAgreementHook {
    const dispatch = useDispatch();
    const connectedCompany = useSelector(getConnectedCompany);

    const [isLoading, setLoading] = useState(true);
    const [fuelSurchargeAgreement, setFuelSurchargeAgreement] =
        useState<FuelSurchargeAgreementWithSurchargeItems | null>(null);

    useEffect(() => {
        fetchAgreement();
    }, [fuelSurchargeAgreementUid]);

    return {
        isLoading,
        fuelSurchargeAgreement,
        handleUpdate,
        handleReload: fetchAgreement,
    };

    async function fetchAgreement() {
        setLoading(true);
        try {
            const {fuel_surcharge_agreement} = await dispatch(
                fetchFuelSurchargeAgreement(fuelSurchargeAgreementUid)
            );
            setFuelSurchargeAgreement(fuel_surcharge_agreement);
        } catch (e) {
            Logger.error(e);
        }
        setLoading(false);
    }

    async function handleUpdate({invoiceItem, clients}: FuelSurchargeAgreementHookUpdate) {
        try {
            const payload: FuelSurchargeAgreementPayload = {
                clients: clients?.map((client) => client.pk),
                // ... undefined values will be filtered out by the API client
            };
            if (invoiceItem !== undefined) {
                payload.invoice_item_uid = invoiceItem ? invoiceItem.uid : null;
            }
            const result = await dispatch(
                fetchUpdateFuelSurchargeAgreement(fuelSurchargeAgreementUid, payload)
            );
            if (result.error) {
                throw await result.error.json();
            }
            handleAddClients(clients);
            await fetchAgreement();
        } catch (error) {
            Logger.error(error);
        }
    }

    function handleAddClients(clients: {pk: number}[] | undefined) {
        if (!clients || clients.length <= 0 || !fuelSurchargeAgreement) {
            return;
        }
        const initialClientIds = fuelSurchargeAgreement.clients.map(
            (client: Company) => client.pk
        );
        const newClientIds = clients
            .filter((client) => !initialClientIds.includes(client.pk))
            .map((client) => client.pk);

        if (newClientIds.length <= 0) {
            return;
        }

        analyticsService.sendEvent(AnalyticsEvent.fuelSurchargeAddClients, {
            "company id": connectedCompany?.pk,
            "fuel surcharge id": fuelSurchargeAgreementUid,
            "clients to fuel surcharge": newClientIds,
        });
    }
}
