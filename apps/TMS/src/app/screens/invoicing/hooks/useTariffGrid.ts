import {
    AnalyticsEvent,
    analyticsService,
    apiService,
    getConnectedCompany,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import {useEffect, useState} from "react";

import {TariffGrid} from "app/features/pricing/tariff-grids/types";
import {getTariffGridUpdatePayload} from "app/features/pricing/tariff-grids/upsert.service";
import {useSelector} from "app/redux/hooks";

export function useTariffGrid(tariffGridUid: string): {
    saving: boolean;
    tariffGrid: TariffGrid | undefined;
    hasUnsavedChanges: boolean;
    update: (newTariffGrid: TariffGrid) => void;
    fetch: () => void;
    save: () => void;
} {
    const connectedCompany = useSelector(getConnectedCompany);

    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [tariffGrid, setTariffGrid] = useState<TariffGrid | undefined>();
    const [savedTariffGrid, setSavedTariffGrid] = useState<TariffGrid | undefined>();
    const [initialClientIds, setInitialClientIds] = useState<number[] | null>(null);

    useEffect(() => {
        fetch();
    }, [tariffGridUid]); // eslint-disable-line react-hooks/exhaustive-deps

    async function fetch() {
        try {
            const grid = (await apiService.get(`tariff-grids/${tariffGridUid}/`, {
                apiVersion: "web",
            })) as TariffGrid;

            setTariffGrid(grid);
            setSavedTariffGrid(grid);
            setHasUnsavedChanges(false);
            setSaving(false);

            if (!initialClientIds) {
                setInitialClientIds(grid.customers.map((client: Company) => client.pk));
            }
        } catch (e) {
            toast.error(t("common.error"));
        }
    }

    function update(newTariffGrid: TariffGrid) {
        setTariffGrid(newTariffGrid);
        setHasUnsavedChanges(true);
    }

    async function save() {
        if (!tariffGrid || !savedTariffGrid) {
            return;
        }

        setSaving(true);

        try {
            const payload = getTariffGridUpdatePayload(tariffGrid, savedTariffGrid);
            const newTariffGrid = (await apiService.patch(
                `tariff-grids/${tariffGrid.uid}/`,
                payload,
                {apiVersion: "web"}
            )) as TariffGrid;

            setTariffGrid(newTariffGrid);
            setSavedTariffGrid(newTariffGrid);
            setHasUnsavedChanges(false);

            if (tariffGrid?.customers && tariffGrid.customers.length > 0) {
                const newClients = tariffGrid.customers.filter(
                    ({pk: clientId}) => !(initialClientIds ?? []).includes(clientId)
                );
                if (newClients.length > 0) {
                    sendEventOnAddClient(newClients.map((client) => client.pk));
                }
                setInitialClientIds(tariffGrid.customers.map((client) => client.pk));
            }

            toast.success(t("tariffGrids.SuccessfullySaved"), {
                toastId: "tariff-grid-successful-save-toast",
            });
        } catch (error) {
            Logger.error(error);
            toast.error(t("tariffGrids.ErrorWhileSaving"));
        }

        setSaving(false);
    }

    function sendEventOnAddClient(clientIds: number[]) {
        analyticsService.sendEvent(AnalyticsEvent.tariffGridAddClients, {
            "company id": connectedCompany?.pk,
            "original uid of tariff grid": tariffGrid?.uid,
            "clients id to tariff grid": clientIds,
        });
    }

    return {saving, tariffGrid, hasUnsavedChanges, update, fetch, save};
}
