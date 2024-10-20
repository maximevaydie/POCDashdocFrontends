import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {Trailer, Vehicle, useToggle} from "dashdoc-utils";
import React from "react";

import {fetchAssignTransports} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

import {PlanModal} from "./PlanModal";

type Props = {
    disabled: boolean;
    query: SearchQuery;
    onPlanned: () => void;
    onClose: () => void;
};

export function PlanBulkAction({disabled, query, onPlanned, onClose}: Props) {
    const dispatch = useDispatch();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [isPlanning, setIsPlanning, setIsPlanned] = useToggle();

    return (
        <>
            <Button
                variant="primary"
                disabled={disabled || isPlanning}
                onClick={openModal}
                data-testid="mass-plan-button"
            >
                {t("components.plan")}
            </Button>
            {isModalOpen && (
                <PlanModal
                    onClose={() => {
                        closeModal();
                        onClose();
                    }}
                    isLoading={isPlanning}
                    onSubmit={handleSubmit}
                />
            )}
        </>
    );

    function sendPlannedFromMeansAnalyticsEvent() {
        analyticsService.sendEvent(AnalyticsEvent.plannedFromMeans, {
            "is staff": manager?.user.is_staff,
            "company id": company?.pk,
            bulk: true,
        });
    }

    async function handleSubmit(
        selectedTruckerPk: number | null,
        selectedVehicle: Partial<Vehicle> | null,
        selectedTrailer: Partial<Trailer> | null,
        sendToTrucker: boolean
    ) {
        setIsPlanning();

        const payload = {
            trucker_id: selectedTruckerPk !== null ? {pk: selectedTruckerPk.toString()} : null,
            vehicle: selectedVehicle,
            trailers: selectedTrailer ? [selectedTrailer] : [],
            send_to_trucker: sendToTrucker,
        };

        try {
            await dispatch(fetchAssignTransports(query, payload));
            onPlanned();
            closeModal();
            sendPlannedFromMeansAnalyticsEvent();
        } finally {
            setIsPlanned();
        }
    }
}
