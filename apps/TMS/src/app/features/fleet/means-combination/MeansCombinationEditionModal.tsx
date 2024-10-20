import {useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Modal, Text, toast} from "@dashdoc/web-ui";
import {MeansCombination, Trailer, Trucker, Vehicle} from "dashdoc-utils";
import React, {useState} from "react";

import MeansCombinationReplacementWarning from "app/features/fleet/means-combination/MeansCombinationReplacementWarning";
import {TruckerCreatableSelect} from "app/features/fleet/trucker/TruckerSelect";
import {TrailerPlateSelect, VehiclePlateSelect} from "app/features/fleet/vehicle/plate-select";
import {fetchAddTrailer, fetchAddVehicle} from "app/redux/actions";
import {
    fetchAddMeansCombination,
    fetchUpdateMeansCombination,
} from "app/redux/actions/means-combinations";

import type {InitialMeansCombination} from "app/features/fleet/types";

interface MeansCombinationEditionModalProps {
    initialMeansCombination: MeansCombination | InitialMeansCombination;
    initialMeansType: "trucker" | "vehicle" | "trailer";
    onUpdate: () => void;
    onClose: () => void;
}

export default function MeansCombinationEditionModal({
    initialMeansCombination,
    initialMeansType,
    onUpdate,
    onClose,
}: MeansCombinationEditionModalProps) {
    const mode = initialMeansCombination.pk ? "edit" : "create";
    const dispatch = useDispatch();

    const [trucker, setTrucker] = useState<Trucker | Partial<Trucker> | null>(
        initialMeansCombination.trucker
    );
    const [vehicle, setVehicle] = useState<Vehicle | Partial<Vehicle> | null>(
        initialMeansCombination.vehicle
    );
    const [trailer, setTrailer] = useState<Trailer | Partial<Trailer> | null>(
        initialMeansCombination.trailer
    );

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [hasValidationError, setHasValidationError] = useState<boolean>(false);

    const saveMeansCombination = async () => {
        if (!isValid()) {
            setHasValidationError(true);
            return;
        }

        // Nothing changed, close modal
        if (!isDirty()) {
            onClose();
            return;
        }

        const saveFunc = mode === "edit" ? fetchUpdateMeansCombination : fetchAddMeansCombination;
        setIsLoading(true);
        try {
            await saveFunc({
                ...initialMeansCombination,
                trucker: trucker,
                vehicle: vehicle,
                trailer: trailer,
            } as MeansCombination);
            onUpdate();
            onClose();
            toast.success(t("fleet.meansCombinations.editionModal.toast.success"));
        } catch {
            toast.error(t("fleet.meansCombinations.editionModal.toast.failure"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title={
                mode === "edit"
                    ? t("fleet.meansCombinations.editionModal.EditTitle")
                    : t("fleet.meansCombinations.editionModal.addTitle")
            }
            onClose={onClose}
            mainButton={{
                children: showWarning() ? t("common.saveAndReplace") : t("common.save"),
                severity: showWarning() ? "warning" : undefined,
                onClick: saveMeansCombination,
                loading: isLoading,
                "data-testid": "save-means-combination-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                onClick: onClose,
            }}
        >
            <Callout padding={4} mb={3}>
                <Text>{t("fleet.meansCombinations.editionModal.description")}</Text>
            </Callout>

            <Flex flexDirection="column" css={{gap: "24px"}}>
                <Box>
                    <Text variant="h1" marginBottom={2}>
                        {t("common.trucker")}
                    </Text>
                    <TruckerCreatableSelect
                        label={t("common.trucker")}
                        value={trucker ? {value: trucker} : null}
                        onChange={(truckerOption) => {
                            setHasValidationError(false);
                            setTrucker((truckerOption?.value as Trucker) ?? null);
                        }}
                        data-testid="trucker-select"
                        isDisabled={initialMeansType === "trucker"}
                        iconName={isTruckerInAnotherCombination() ? "warning" : undefined}
                        iconColor="yellow.dark"
                        error={
                            hasValidationError && initialMeansType !== "trucker"
                                ? t("fleet.meansCombinations.editionModal.validationError")
                                : undefined
                        }
                        hideExtendedViewOptions
                    />
                </Box>
                <Box>
                    <Text variant="h1" marginBottom={2}>
                        {t("common.vehiclePlate")}
                    </Text>
                    <VehiclePlateSelect
                        label={t("common.vehiclePlate")}
                        value={vehicle ? {value: vehicle} : null}
                        onChange={async (vehicleOption) => {
                            let vehicle = vehicleOption?.value as Vehicle;
                            if (vehicleOption?.__isNew__) {
                                const response = await dispatch(
                                    fetchAddVehicle({
                                        license_plate: vehicleOption.value,
                                    })
                                );
                                vehicle = response.vehicle;
                            }
                            setHasValidationError(false);
                            setVehicle(vehicle ?? null);
                        }}
                        data-testid="vehicle-select"
                        isDisabled={initialMeansType === "vehicle"}
                        iconName={isVehicleInAnotherCombination() ? "warning" : undefined}
                        iconColor="yellow.dark"
                        error={
                            hasValidationError && initialMeansType !== "vehicle"
                                ? t("fleet.meansCombinations.editionModal.validationError")
                                : undefined
                        }
                        hideExtendedViewOptions
                    />
                </Box>
                <Box>
                    <Text variant="h1" marginBottom={2}>
                        {t("common.trailerPlate")}
                    </Text>
                    <TrailerPlateSelect
                        label={t("common.trailerPlate")}
                        value={trailer ? {value: trailer} : null}
                        onChange={async (trailerOption) => {
                            let trailer = trailerOption?.value as Trailer;
                            if (trailerOption?.__isNew__) {
                                const response = await dispatch(
                                    fetchAddTrailer({
                                        license_plate: trailerOption.value,
                                    })
                                );
                                trailer = response.trailer;
                            }
                            setHasValidationError(false);
                            setTrailer(trailer ?? null);
                        }}
                        data-testid="trailer-select"
                        isDisabled={initialMeansType === "trailer"}
                        iconName={isTrailerInAnotherCombination() ? "warning" : undefined}
                        iconColor="yellow.dark"
                        error={
                            hasValidationError && initialMeansType !== "trailer"
                                ? t("fleet.meansCombinations.editionModal.validationError")
                                : undefined
                        }
                        hideNoTrailerOption
                        hideExtendedViewOptions
                    />
                </Box>
            </Flex>

            {showWarning() ? (
                <MeansCombinationReplacementWarning
                    truckerExistingCombination={
                        isTruckerInAnotherCombination()
                            ? (trucker as Trucker).means_combination
                            : null
                    }
                    vehicleExistingCombination={
                        isVehicleInAnotherCombination()
                            ? (vehicle as Vehicle).means_combination
                            : null
                    }
                    trailerExistingCombination={
                        isTrailerInAnotherCombination()
                            ? (trailer as Trailer).means_combination
                            : null
                    }
                />
            ) : null}
        </Modal>
    );

    function isTruckerInAnotherCombination() {
        return (
            trucker &&
            "means_combination" in trucker &&
            trucker.means_combination &&
            trucker.means_combination.pk !== initialMeansCombination.pk
        );
    }

    function isVehicleInAnotherCombination() {
        return (
            vehicle &&
            "means_combination" in vehicle &&
            vehicle.means_combination &&
            vehicle.means_combination.pk !== initialMeansCombination.pk
        );
    }

    function isTrailerInAnotherCombination() {
        return (
            trailer &&
            "means_combination" in trailer &&
            trailer.means_combination &&
            trailer.means_combination.pk !== initialMeansCombination.pk
        );
    }

    function showWarning() {
        return (
            isTruckerInAnotherCombination() ||
            isVehicleInAnotherCombination() ||
            isTrailerInAnotherCombination()
        );
    }

    function isValid() {
        if ([trucker, vehicle, trailer].filter((means) => means != null).length > 1) {
            return true;
        }
        return false;
    }

    function isDirty() {
        return (
            initialMeansCombination.trucker?.pk != trucker?.pk ||
            initialMeansCombination.vehicle?.pk != vehicle?.pk ||
            initialMeansCombination.trailer?.pk != trailer?.pk
        );
    }
}
