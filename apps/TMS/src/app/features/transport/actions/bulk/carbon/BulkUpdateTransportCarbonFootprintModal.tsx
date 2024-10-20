import {apiService} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {LoadingWheel, Modal, Text, toast} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {SelectedTransportsCountCallout} from "app/features/transport/actions/bulk/SelectedTransportsCountCallout";
import {SearchQuery} from "app/redux/reducers/searches";

type BulkUpdateTransportOperationCategoryStatus = "pending" | "loading" | "done";

type Props = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
};

export const BulkUpdateTransportCarbonFootprintModal: FunctionComponent<Props> = ({
    selectedTransportsCount,
    selectedTransportsQuery,
    onClose,
}) => {
    const [status, setStatus] = useState<BulkUpdateTransportOperationCategoryStatus>("pending");

    async function handleSubmit() {
        setStatus("loading");
        try {
            await apiService.post(
                "/transports/bulk-refresh-carbon-footprint/",
                {
                    filters: queryService.toQueryString(selectedTransportsQuery),
                },
                {apiVersion: "web"}
            );
            setStatus("done");
        } catch (error) {
            toast.error(t("common.error"));
            setStatus("pending");
        }
    }

    return (
        <Modal
            title={t("bulkAction.updateTransportCarbonFootprint.title")}
            id="bulk-update-transport-carbon-footprint-modal"
            onClose={onClose}
            mainButton={
                status === "done"
                    ? {
                          type: "button",
                          onClick: onClose,
                          children: t("common.understood"),
                      }
                    : {
                          children: t("common.updateAndReplace"),
                          disabled: status !== "pending",
                          onClick: () => handleSubmit(),
                      }
            }
            secondaryButton={status !== "done" ? {type: "button", onClick: onClose} : undefined}
        >
            {status === "pending" && (
                <>
                    <SelectedTransportsCountCallout
                        selectedTransportsCount={selectedTransportsCount}
                    />

                    <Text my={4}>
                        {t("bulkAction.updateTransportCarbonFootprint.mostRecentRate")}
                    </Text>
                    <Text my={4}>
                        {t("bulkAction.updateTransportCarbonFootprint.fromAdemeToIso")}
                    </Text>
                </>
            )}
            {status === "loading" && <LoadingWheel noMargin />}
            {status === "done" && (
                <>
                    <Text variant="h1">{t("common.processing")}</Text>
                    <Text mt={5} mb={3}>
                        {t("bulkAction.updateTransportCarbonFootprint.mayTakeSeveralMinutes")}
                    </Text>
                </>
            )}
        </Modal>
    );
};
