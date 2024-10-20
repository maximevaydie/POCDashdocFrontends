import {getConnectedCompany} from "@dashdoc/web-common";
import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Modal, ButtonProps} from "@dashdoc/web-ui";
import {ActivityType} from "dashdoc-utils";
import {isEmpty} from "lodash";
import React, {useCallback, useEffect, useRef, useState} from "react";

import {useSelector} from "app/redux/hooks";

import {
    getFormLoad,
    getLoadDeliveryOptions,
    getLoadDataFromForm,
} from "../../transport-form/mappings";
import {
    getContextFromTransport,
    TransportFormContext,
} from "../../transport-form/transport-form-context";
import {updateLoadsSmartSuggestionsMap} from "../../transport-form/transport-form-smart-suggestions";
import {FormLoad, LoadPatch, LoadSmartSuggestion} from "../../transport-form/transport-form.types";

import TransportLoadForm from "./LoadForm";

import type {Transport, Delivery, Load} from "app/types/transport";

type LoadFormModalProps = {
    transport: Transport;
    deliveries: Delivery[];
    isEditing: boolean;
    initialLoadData?: Load;
    isModifyingFinalInfo: boolean;
    onChangeMultipleCompartments: (value: boolean) => void;
    onChangeMultipleRounds: (delivery: Delivery, value: boolean) => void;
    onChangeRequiresWashing: (value: boolean) => Promise<any>;
    onSubmit: (load: Load, delivery: Delivery) => Promise<any>;
    onClose: () => void;
    onDelete?: () => void;
    activityType?: ActivityType;
};

export function LoadFormModal({
    transport,
    deliveries,
    isEditing,
    initialLoadData,
    isModifyingFinalInfo,
    onChangeMultipleCompartments,
    onChangeMultipleRounds,
    onChangeRequiresWashing,
    onSubmit,
    onClose,
    onDelete,
    activityType,
}: LoadFormModalProps) {
    const formRef = useRef<{
        submitForm: (submitMode: "save" | "saveAndAdd") => void;
    }>();
    const [isLoading, setIsLoading] = useState(false);

    const formDeliveries = getLoadDeliveryOptions(deliveries);

    const company = useSelector(getConnectedCompany);

    const transportContext = getContextFromTransport({
        transport,
        companyPk: company!.pk,
        isCreatingTemplate: !isEmpty(transport.template_name),
        isComplexMode: transport.shape === "complex",
        isDuplicating: false,
    });

    // loads smart suggestions at address. addressPK -> LoadSmartSuggestion
    const [loadsSmartSuggestionsMap, setLoadsSmartSuggestionsMap] = useState<
        Map<number, LoadSmartSuggestion>
    >(new Map());

    const populateLoadsSmartSuggestions = useCallback(async () => {
        const activities = formDeliveries
            .map((delivery) => [delivery.loadingActivity, delivery.unloadingActivity])
            .flat();
        const updatedLoadsSmartSuggestionsMap = await updateLoadsSmartSuggestionsMap(
            activities,
            loadsSmartSuggestionsMap
        );
        if (updatedLoadsSmartSuggestionsMap?.size !== loadsSmartSuggestionsMap.size) {
            setLoadsSmartSuggestionsMap(updatedLoadsSmartSuggestionsMap);
        }
    }, []);

    useEffect(() => {
        populateLoadsSmartSuggestions().catch(Logger.error);
    }, [deliveries]);

    const onSubmitLoad = async (formLoad: FormLoad) => {
        setIsLoading(true);
        const delivery = deliveries.find(
            (delivery: Delivery) => delivery.uid === formLoad.delivery.uid
        );

        const load = getLoadDataFromForm(formLoad, transportContext, company);

        if (isEditing) {
            (load as LoadPatch).uid = initialLoadData!.uid;
        }

        try {
            if (!isModifyingFinalInfo) {
                onChangeMultipleCompartments(formLoad.isMultipleCompartments);
                // @ts-ignore
                onChangeMultipleRounds(delivery, formLoad.isMultipleRounds);
                if (transportContext.requiresWashing !== formLoad.requiresWashing) {
                    await onChangeRequiresWashing(formLoad.requiresWashing);
                }
            }
            // @ts-ignore
            return await onSubmit(load, delivery);
        } catch (error) {
            Logger.error(error);
            if (error.loadValidationError) {
                return Promise.reject(error.errors);
            }
            const errorMessage = await getErrorMessagesFromServerError(error);
            return Promise.reject(errorMessage);
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    const secondaryButton: ButtonProps =
        onDelete && !isModifyingFinalInfo
            ? {
                  variant: "primary",
                  severity: "danger",
                  onClick: (e) => {
                      e.preventDefault();
                      if (confirm(t("components.confirmDeleteLoad"))) {
                          onDelete();
                          onClose();
                      }
                  },
                  disabled: isLoading,
                  "data-testid": "load-form-delete-load",
                  children: t("common.delete"),
              }
            : {
                  variant: "secondary",
                  onClick: onClose,
                  disabled: isLoading,
                  "data-testid": "load-modal-close",
                  children: t("common.cancel"),
              };

    const getTitle = () => {
        if (!isEditing) {
            if (!isModifyingFinalInfo) {
                return t("components.addPlannedLoad");
            } else {
                switch (activityType) {
                    case "loading":
                        return t("components.addOriginLoad");
                    case "unloading":
                        return t("components.addDestinationLoad");
                    default:
                        return t("components.addLoad");
                }
            }
        } else {
            if (!isModifyingFinalInfo) {
                return t("components.editPlannedLoad");
            } else {
                switch (activityType) {
                    case "loading":
                        return t("components.editOriginLoad");
                    case "unloading":
                        return t("components.editDestinationLoad");
                    default:
                        return t("components.editLoad");
                }
            }
        }
    };

    let extractedWeight;
    // We match the extracted weight only with real weight
    if (isModifyingFinalInfo) {
        // We can match the extracted weight with a real weight only if there is only one delivery and one load
        if (deliveries?.length == 1) {
            const delivery = deliveries[0];
            if (activityType === "loading") {
                if (isEditing) {
                    if (delivery.origin_loads?.length == 1) {
                        extractedWeight = delivery.origin_extracted_weight;
                    }
                } else {
                    if (!delivery.origin_loads?.length) {
                        extractedWeight = delivery.origin_extracted_weight;
                    }
                }
            } else if (activityType === "unloading") {
                if (isEditing) {
                    if (delivery.destination_loads?.length == 1) {
                        extractedWeight = delivery.destination_extracted_weight;
                    }
                } else {
                    if (!delivery.destination_loads?.length) {
                        extractedWeight = delivery.destination_extracted_weight;
                    }
                }
            }
        }
    }

    return (
        <TransportFormContext.Provider value={transportContext}>
            <Modal
                title={getTitle()}
                mainButton={{
                    children: t("common.save"),
                    variant: "primary",
                    onClick: () => {
                        formRef.current?.submitForm("save");
                    },
                    disabled: isLoading,
                    "data-testid": "load-modal-save-load",
                }}
                secondaryButton={secondaryButton}
                onClose={onClose}
                data-testid="load-form-modal"
            >
                <TransportLoadForm
                    onSubmit={onSubmitLoad}
                    // @ts-ignore
                    initialLoadData={
                        initialLoadData
                            ? getFormLoad(initialLoadData, transportContext, formDeliveries[0])
                            : null
                    }
                    isEditing={isEditing}
                    onClose={onClose}
                    deliveries={formDeliveries}
                    showSelectedDelivery={transport.shape === "complex"}
                    // @ts-ignore
                    ref={formRef}
                    loadsSmartSuggestionsMap={loadsSmartSuggestionsMap}
                    rootId="react-app-modal-root"
                    // @ts-ignore
                    extractedWeight={extractedWeight}
                    isModifyingFinalInfo={isModifyingFinalInfo}
                />
            </Modal>
        </TransportFormContext.Provider>
    );
}
