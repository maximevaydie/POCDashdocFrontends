import {t} from "@dashdoc/web-core";
import {Flex, Modal, toast, Text, Icon} from "@dashdoc/web-ui";
import {MeansCombination} from "dashdoc-utils";
import React, {useState} from "react";

import {fetchDeleteMeansCombination} from "app/redux/actions/means-combinations";

import MeansCombinationDetails from "./MeansCombinationDetails";

interface MeansCombinationDeletionModalProps {
    meansCombination: MeansCombination;
    onDelete: () => void;
    onClose: () => void;
}

export default function CombinationDeletionModal({
    meansCombination,
    onDelete,
    onClose,
}: MeansCombinationDeletionModalProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const deleteMeansCombination = async () => {
        setIsLoading(true);
        try {
            await fetchDeleteMeansCombination(meansCombination.pk!);
            onDelete();
            onClose();
            toast.success(t("fleet.meansCombinations.deletionModal.toast.success"));
        } catch {
            toast.error(t("fleet.meansCombinations.deletionModal.toast.failure"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title={t("fleet.meansCombinations.deletionModal.title")}
            onClose={onClose}
            mainButton={{
                children: t("common.delete"),
                onClick: deleteMeansCombination,
                variant: "destructive",
                loading: isLoading,
                "data-testid": "confirm-delete-means-combination-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                onClick: onClose,
            }}
        >
            <Flex flexDirection="column" justifyContent="center" alignItems="center">
                <Flex marginBottom={3}>
                    <Icon name="removeCircle" color="red.dark" />
                    <Text ml={2}>{t("fleet.meansCombinations.deletionModal.description")}</Text>
                </Flex>
                <MeansCombinationDetails meansCombination={meansCombination} />
            </Flex>
        </Modal>
    );
}
