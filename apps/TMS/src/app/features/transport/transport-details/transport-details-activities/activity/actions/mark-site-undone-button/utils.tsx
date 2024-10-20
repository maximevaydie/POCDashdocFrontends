import {t} from "@dashdoc/web-core";

import {isTransportRental, transportStateService} from "app/services/transport";

import type {Site, Transport} from "app/types/transport";

type MarkUndoneSiteTranslations = {
    regenerateDeliveryDocumentCallout: string;
    warnings: string[];
    requirements: string[];
};

export const getMarkUndoneSiteTranslations = (
    siteCategory: Site["category"],
    transport: Transport
): MarkUndoneSiteTranslations => {
    const isRental = isTransportRental(transport);
    const isMultipleRounds = transportStateService.isMultipleRounds(transport);

    return {
        regenerateDeliveryDocumentCallout: getRegenerateDeliveryDocumentCallout(isRental),
        warnings: getWarnings(siteCategory, isRental, isMultipleRounds),
        requirements: getRequirements(siteCategory, isRental, isMultipleRounds),
    };
};

const getRegenerateDeliveryDocumentCallout = (isRental: boolean): string => {
    if (isRental) {
        return t("markActivityUndoneModal.warningInformationWillBeDeletedFromRentalNote");
    }

    return t("markActivityUndoneModal.warningInformationWillBeDeletedFromConsignmentNote");
};

const getWarnings = (
    siteCategory: Site["category"],
    isRental: boolean,
    isMultipleRounds: boolean
): string[] => {
    if (isRental) {
        if (siteCategory === "loading") {
            return [
                t("markActivityUndoneModal.collectedSignatures"),
                t("markActivityUndoneModal.breaksTakenByTrucker"),
                t("markActivityUndoneModal.dataRelatedToTelamatics"),
            ];
        }

        return [
            t("markActivityUndoneModal.collectedSignatures"),
            t("markActivityUndoneModal.dataRelatedToTelamatics"),
        ];
    }

    if (isMultipleRounds) {
        if (siteCategory === "loading") {
            return [
                t("markActivityUndoneModal.collectedSignatures"),
                t("markActivityUndoneModal.numberOfRoundsCompleted"),
                t("markActivityUndoneModal.dataRelatedToLoads"),
                t("markActivityUndoneModal.dataRelatedToTelamatics"),
            ];
        } else {
            return [
                t("markActivityUndoneModal.collectedSignatures"),
                t("markActivityUndoneModal.dataRelatedToTelamatics"),
            ];
        }
    }

    if (["loading", "unloading"].includes(siteCategory)) {
        return [
            t("markActivityUndoneModal.collectedSignatures"),
            t("markActivityUndoneModal.dataRelatedToLoads"),
            t("markActivityUndoneModal.dataRelatedToTelamatics"),
        ];
    }

    return [];
};

const getRequirements = (
    siteCategory: Site["category"],
    isRental: boolean,
    isMultipleRounds: boolean
): string[] => {
    if (isRental) {
        if (siteCategory === "loading") {
            return [
                t("markActivityUndoneModal.rentalNoteRenderedNull"),
                t("markActivityUndoneModal.rentalNoteReSignedByTruckerAndSender"),
                t("markActivityUndoneModal.rentalExecutionDataWillHaveToBeFilledAgain"),
            ];
        }

        if (siteCategory === "unloading") {
            return [
                t("markActivityUndoneModal.rentalNoteRenderedNull"),
                t("markActivityUndoneModal.rentalNoteReSignByTruckerAndRecipient"),
                t("markActivityUndoneModal.rentalExecutionDataWillHaveToBeFilledAgain"),
            ];
        }
    }

    if (isMultipleRounds) {
        if (siteCategory === "loading") {
            return [
                t("markActivityUndoneModal.consignmentNoteRenderedInvalid"),
                t("markActivityUndoneModal.consignmentNoteReSignedByTruckerAndSender"),
                t("markActivityUndoneModal.multipleRoundsExecutionDataWillHaveToBeFilledAgain"),
            ];
        }

        if (siteCategory === "unloading") {
            return [
                t("markActivityUndoneModal.consignmentNoteRenderedInvalid"),
                t("markActivityUndoneModal.consignmentNoteReSignedByTruckerAndRecipient"),
            ];
        }
    }

    if (siteCategory === "loading") {
        return [
            t("markActivityUndoneModal.consignmentNoteRenderedInvalid"),
            t("markActivityUndoneModal.consignmentNoteReSignedByTruckerAndSender"),
            t("markActivityUndoneModal.executionDataWillHaveToBeFilledAgain"),
        ];
    }

    if (siteCategory === "unloading") {
        return [
            t("markActivityUndoneModal.consignmentNoteRenderedInvalid"),
            t("markActivityUndoneModal.consignmentNoteReSignedByTruckerAndRecipient"),
            t("markActivityUndoneModal.executionDataWillHaveToBeFilledAgain"),
        ];
    }

    return [];
};
