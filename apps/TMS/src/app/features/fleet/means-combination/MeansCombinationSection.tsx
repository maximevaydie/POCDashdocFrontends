import {t} from "@dashdoc/web-core";
import {Flex, IconButton, Text} from "@dashdoc/web-ui";
import {useToggle, type MeansCombination} from "dashdoc-utils";
import React from "react";

import {EmptyMeansCombinationSectionCallForAction} from "./EmptyMeansCombinationSectionCallForAction";
import {getInitialMeansCombinations} from "./means-combination.service";
import {InitialMeans} from "./means-combination.types";
import DeleteMeansCombinationModal from "./MeansCombinationDeletionModal";
import MeansCombinationDetails from "./MeansCombinationDetails";
import MeansCombinationEditionModal from "./MeansCombinationEditionModal";

type Props = {
    initialMeans: InitialMeans;
    onUpdate: () => void;
};

export function MeansCombinationSection({initialMeans, onUpdate}: Props) {
    return (
        <>
            <Text variant="h1" mb={3}>
                {t("fleet.meansCombinations.linkedMeans")}
            </Text>
            {initialMeans.means.means_combination ? (
                <UpdateMeansSection
                    meansCombination={initialMeans.means.means_combination}
                    initialMeansType={initialMeans.type}
                    onUpdate={onUpdate}
                />
            ) : (
                <InitialMeansSection initialMeans={initialMeans} onUpdate={onUpdate} />
            )}
        </>
    );
}

function UpdateMeansSection({
    meansCombination,
    initialMeansType,
    onUpdate,
}: {
    meansCombination: MeansCombination;
    initialMeansType: "trucker" | "vehicle" | "trailer";
    onUpdate: () => void;
}) {
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle();
    return (
        <>
            <Flex p={2} pl={3} justifyContent="space-between" backgroundColor="grey.ultralight">
                <MeansCombinationDetails meansCombination={meansCombination} />
                <Flex>
                    <IconButton
                        name="edit"
                        onClick={openEditModal}
                        data-testid="edit-means-combination-button"
                    />
                    <IconButton
                        name="delete"
                        onClick={openDeleteModal}
                        data-testid="delete-means-combination-button"
                    />
                </Flex>
            </Flex>
            {isEditModalOpen ? (
                <MeansCombinationEditionModal
                    initialMeansCombination={meansCombination}
                    initialMeansType={initialMeansType}
                    onUpdate={onUpdate}
                    onClose={closeEditModal}
                />
            ) : null}

            {isDeleteModalOpen ? (
                <DeleteMeansCombinationModal
                    meansCombination={meansCombination}
                    onDelete={onUpdate}
                    onClose={closeDeleteModal}
                />
            ) : null}
        </>
    );
}

function InitialMeansSection({
    initialMeans,
    onUpdate,
}: {
    initialMeans: InitialMeans;
    onUpdate: () => void;
}) {
    const meansCombination = getInitialMeansCombinations(initialMeans);
    return (
        <EmptyMeansCombinationSectionCallForAction
            initialMeansCombination={meansCombination}
            initialMeansType={initialMeans.type}
            onUpdate={onUpdate}
        />
    );
}
