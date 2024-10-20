import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, Text} from "@dashdoc/web-ui";
import {Pricing, isTransportInvoiced} from "dashdoc-utils";
import React from "react";

import {useTransportViewer} from "app/hooks/useTransportViewer";

import {ActivityList} from "./ActivityList";
import UpdatableGlobalInstructions from "./instructions/updatable-global-instructions";

import type {Transport, TransportActivitiesByMeans} from "app/types/transport";

type TransportDetailsActivitiesProps = {
    transport: Transport;
    pricing: Pricing | null;
    activitiesByMeans: TransportActivitiesByMeans;
    onClickOnActivityDistance: () => void;
};

export function TransportDetailsActivities({
    transport,
    pricing,
    activitiesByMeans,
    onClickOnActivityDistance,
}: TransportDetailsActivitiesProps) {
    const {isCreator, isReadOnly} = useTransportViewer(transport);
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    const canUpdateGlobalInstructions =
        isCreator && !isReadOnly && !(hasInvoiceEntityEnabled && isTransportInvoiced(transport));

    return (
        <Card p={3} pb={6} mb={3} data-testid="activity-grid">
            <Text variant="h1" mb={3}>
                {t("common.activities")}
            </Text>
            <UpdatableGlobalInstructions
                updateGlobalInstructionsAllowed={canUpdateGlobalInstructions}
                transport={transport}
            />
            <ActivityList
                activitiesByMeans={activitiesByMeans}
                transport={transport}
                pricing={pricing}
                onClickOnActivityDistance={onClickOnActivityDistance}
            />
        </Card>
    );
}
