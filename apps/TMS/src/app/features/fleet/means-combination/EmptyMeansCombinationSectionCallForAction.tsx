import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import MeansCombinationEditionModal from "./MeansCombinationEditionModal";

import type {InitialMeansCombination} from "app/features/fleet/types";

interface EmptyMeansCombinationSectionCallForActionProps {
    initialMeansCombination: InitialMeansCombination;
    initialMeansType: "trucker" | "vehicle" | "trailer";
    onUpdate: () => void;
}

export function EmptyMeansCombinationSectionCallForAction({
    initialMeansCombination,
    initialMeansType,
    onUpdate,
}: EmptyMeansCombinationSectionCallForActionProps) {
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();

    return (
        <>
            <Flex
                flexDirection="column"
                alignItems="center"
                data-testid="empty-means-combination-section"
            >
                <Flex alignItems="center" justifyContent="center" width="5em" height="4em" mb={1}>
                    <Icon name="schedulerFlash" scale={4} color="grey.dark" />
                </Flex>
                <Text my={4} maxWidth="50%" textAlign="center" color="grey.dark">
                    {t("fleet.meansCombinations.description")}
                </Text>

                <Button
                    key="edit"
                    name="edit"
                    variant="secondary"
                    onClick={openEditModal}
                    data-testid="add-means-combination-button"
                >
                    {t("fleet.meansCombinations.addButtonLabel")}
                </Button>
            </Flex>

            {isEditModalOpen && (
                <MeansCombinationEditionModal
                    initialMeansCombination={initialMeansCombination}
                    initialMeansType={initialMeansType}
                    onUpdate={onUpdate}
                    onClose={closeEditModal}
                />
            )}
        </>
    );
}
