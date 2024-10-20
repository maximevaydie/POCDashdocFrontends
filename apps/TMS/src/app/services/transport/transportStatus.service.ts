import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {
    CleaningRegime,
    formatDate,
    formatDateRelative,
    formatNumber,
    getCompanyNameAndProfileFromTransport,
    LastTruckPositionTrace,
} from "dashdoc-utils";
import {utcToZonedTime} from "date-fns-tz";
import flatMap from "lodash.flatmap";
import isNil from "lodash.isnil";
import omit from "lodash.omit";

import {getTransportProfileLabel} from "./transport.service";

import type {Site, Transport, TransportStatus} from "app/types/transport";
import type {TransportListWeb, TransportManagedThrough} from "app/types/transport_list_web";

type TransportStage =
    | "created"
    | "updated"
    | "cancelled"
    | "ongoing"
    | "done"
    | "invoiced"
    | "paid";

type OrderStage = TransportStage | "confirmed" | "declined";

export function getDiffLabel(label: string) {
    if (label.startsWith("ref__")) {
        const text = label
            .replace("ref__carrier", "transporteur")
            .replace("ref__shipper", "donneur d'ordre")
            .replace("ref__origin", "enlèvement")
            .replace("ref__destination", "livraison");
        return `Référence ${text}`;
    }

    const diffNames: Record<string, string> = {
        vehicle_license_plate: t("transportUpdateDetail.vehicle_license_plate"),
        trailer_license_plate: t("transportUpdateDetail.trailer_license_plate"),
        shipper_reference: t("transportUpdateDetail.shipper_reference"),
        carrier_reference: t("transportUpdateDetail.carrier_reference"),
        origin_reference: t("transportUpdateDetail.origin_reference"),
        origin__reference: t("transportUpdateDetail.origin_reference"),
        destination_reference: t("transportUpdateDetail.destination_reference"),
        destination__reference: t("transportUpdateDetail.destination__reference"),
        carrier_address: t("transportUpdateDetail.carrier_address"),
        carrier: t("common.carrier"),
        draft_carrier_address: t("transportUpdateDetail.draft_carrier_address"),
        assigned_carrier: t("transportUpdateDetail.assigned_carrier"),
        sent_to_carrier: t("transportUpdateDetail.sentToCarrier"),
        shipper_address: t("transportUpdateDetail.shipper_address"),
        shipper: t("common.shipper"),
        origin_address: t("transportUpdateDetail.origin_address"),
        destination_address: t("transportUpdateDetail.destination_address"),
        origin_date: t("transportUpdateDetail.origin_date"),
        origin_min_time: t("transportUpdateDetail.origin_min_time"),
        origin_max_time: t("transportUpdateDetail.origin_max_time"),
        destination_date: t("transportUpdateDetail.destination_date"),
        destination_min_time: t("transportUpdateDetail.destination_min_time"),
        destination_max_time: t("transportUpdateDetail.destination_max_time"),
        price: t("transportUpdateDetail.price"),
        planned_loads: t("transportUpdateDetail.planned_loads"),
        origin_loads: t("transportUpdateDetail.origin_loads"),
        destination_loads: t("transportUpdateDetail.destination_loads"),
        origin__arrival_date: t("transportUpdateDetail.origin__arrival_date"),
        origin__arrival_time_min: t("transportUpdateDetail.origin__arrival_time_min"),
        origin__arrival_time_max: t("transportUpdateDetail.origin__arrival_time_max"),
        destination__arrival_date: t("transportUpdateDetail.destination__arrival_date"),
        destination__arrival_time_min: t("transportUpdateDetail.destination__arrival_time_min"),
        destination__arrival_time_max: t("transportUpdateDetail.destination__arrival_time_max"),
        origin__address: t("transportUpdateDetail.origin__address"),
        destination__address: t("transportUpdateDetail.destination__address"),
        vehicle: t("transportUpdateDetail.vehicle_license_plate"),
        trailers: t("transportUpdateDetail.trailer_license_plate"),
        trucker: t("transportUpdateDetail.theTrucker"),
        invoiced_price: t("transportUpdateDetail.invoiced_price"),
        customer_to_invoice: t("common.customerToInvoice"),
        invoice_number: t("transportUpdateDetail.invoice_number"),
        address: t("common.address"),
        slots: t("common.slots"),
        reference: t("common.reference"),
        requested_vehicle: t("components.requestedVehicle"),
        origin__slots: t("transportUpdateDetail.originSlots"),
        destination__slots: t("transportUpdateDetail.destinationSlots"),
        real_start: t("transportUpdateDetail.real_start"),
        real_end: t("transportUpdateDetail.real_end"),
        loading_deleted: t("transportUpdateDetail.loadingDeleted"),
        loading_updated: t("transportUpdateDetail.loadingUpdated"),
        loading_added: t("transportUpdateDetail.loadingAdded"),
        unloading_deleted: t("transportUpdateDetail.unloadingDeleted"),
        unloading_updated: t("transportUpdateDetail.unloadingUpdated"),
        unloading_added: t("transportUpdateDetail.unloadingAdded"),
    };

    return diffNames[label] || label;
}
// @ts-ignore
export function getListDiff(details: any, detailsKey: string | null = null) {
    let listDiff: Record<string, string>[] = [];
    const KEYS_TO_OMIT = [
        // we hide price information until we have a good permission / visibility system
        "price",
        "invoiced_price",
        // we hide technical information
        "vehicle_pk",
        "trailer_pks",
    ];

    if (Array.isArray(details)) {
        listDiff = listDiff.concat(flatMap(details, (value) => getListDiff(value, detailsKey)));
    } else if (detailsKey && (!isNil(details.old) || !isNil(details.new))) {
        if (
            typeof details.old === "string" ||
            typeof details.new === "string" ||
            typeof details.old === "number" ||
            typeof details.new === "number"
        ) {
            if (detailsKey === "requested_vehicle") {
                listDiff.push({
                    ...details,
                    old: details.old,
                    new: details.new,
                    label: getDiffLabel(detailsKey),
                });
            } else {
                listDiff.push({...details, label: getDiffLabel(detailsKey)});
            }
        }
        // don't render malformed diffs
        return listDiff;
    } else if (typeof details === "object") {
        // Omitting delivery.loads because it comes from v2, is obsolete in v3, and is a copy of delivery.planned_loads
        const cleanedDetails = omit(
            details,
            details?.planned_loads || details?.origin_loads || details?.destination_loads
                ? ["loads", ...KEYS_TO_OMIT]
                : KEYS_TO_OMIT
        );
        listDiff = listDiff.concat(
            flatMap(cleanedDetails, (value, key) => getListDiff(value, key))
        );
    }

    return listDiff;
}

export function getLastTruckPositionText(lastTruckPosition: LastTruckPositionTrace): string {
    const formatDate = formatDateRelative(lastTruckPosition.time);
    return t("transportMap.lastPosition", {time: formatDate});
}

export function getStatusUpdateText(
    update: TransportStatus,
    isOrder = false,
    additionalInfo?: {
        transport?: Transport;
        companyName?: string;
        postCode?: string;
        timezone: string;
        siteCategory?: Site["category"];
        siteIndex?: number;
    }
): string {
    const documentName = isOrder ? t("common.order") : t("common.consignmentNote");
    const authorName = update.author?.display_name || update.author_email || "";
    const transport = additionalInfo?.transport;
    const isMultipleRound = transport?.deliveries.some((d) => d.multiple_rounds);
    let text = "";

    switch (update.category) {
        case "created":
            if (isOrder) {
                text = t("components.placedTheOrder", {author: authorName});
            } else {
                text = t("components.createdTheTransport", {author: authorName});
            }
            break;
        case "updated":
            if (update.creation_method === "trucker") {
                text = t("status.editionByTrucker");
            } else {
                text = t("components.updatedTheDocument", {
                    author: authorName,
                    documentType: documentName,
                });
            }
            break;
        case "confirmed":
            text = t("components.acceptedTheTransportQuery", {author: authorName});
            break;
        case "declined":
            text =
                t("components.declinedTransportQuery", {author: authorName}) +
                ` ` +
                t("components.refusalReason", {reason: update.content});
            break;
        case "cancelled": {
            const cancelReason = update.content || t("components.noCancelReason");

            if (!authorName) {
                text = t("components.cancelledTransportWithoutAuthor", {cancelReason});
                break;
            }

            const authorCompanyPk = update.author_company;
            const authorCompany =
                transport &&
                authorCompanyPk &&
                // TODO: compatibility with DD-utils
                getCompanyNameAndProfileFromTransport(transport as any, authorCompanyPk);

            if (authorCompany) {
                text = t("components.cancelledTransportWithAuthorCompanyAndRole", {
                    profile: getTransportProfileLabel(authorCompany.profile).toLowerCase(),
                    author: authorName,
                    company: authorCompany.name,
                    cancelReason,
                });
                break;
            }

            text = t("components.cancelledTransportWithoutAuthorCompany", {
                author: authorName,
                cancelReason,
            });
            break;
        }
        case "assigned":
            if (update.author === update.target) {
                text = t("components.plannedHimself", {
                    author: authorName,
                    documentType: documentName,
                });
            } else {
                text = t("components.plannedTo", {
                    author: authorName,
                    assigned: update.target ? update.target.display_name : "",
                });
            }
            break;
        case "unassigned":
            text = t("components.unplannedTo", {
                author: authorName,
                assigned: update.target ? update.target.display_name : "",
            });
            break;
        case "sent_to_trucker":
            text = t("components.sentTo", {
                author: authorName,
                documentType: documentName,
                target: update.target ? update.target.display_name : "",
            });
            break;
        case "acknowledged":
            text = t("components.receivedTheTransport", {author: authorName});
            break;
        case "on_loading_site":
            if (update.creation_method === "trucker") {
                text = t("components.arrivedAtPickupAddress", {
                    author: authorName,
                });
            } else if (update.creation_method === "telematic") {
                text = t("status.telematicDetectedOnLoadingSite");
            } else {
                text = t("transportStatus.managerMarkedOnLoadingSite", {
                    author: authorName,
                });
            }
            break;
        case "loading_complete":
            if (update.creation_method === "trucker") {
                text = t("components.finishedPickup", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            } else {
                text = t("transportStatus.managerMarkedLoadingComplete", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            }
            break;
        case "departed":
            if (update.creation_method === "telematic") {
                text = t("status.telematicDetectedDeparted");
            } else {
                text = t("components.vehicleDeparted");
            }
            break;
        case "on_unloading_site":
            if (update.creation_method === "trucker") {
                text = t("components.arrivedAtDeliveryAddress", {
                    author: authorName,
                });
            } else if (update.creation_method === "telematic") {
                text = t("status.telematicDetectedOnUnLoadingSite");
            } else {
                text = t("transportStatus.managerMarkedOnUnloadingSite", {
                    author: authorName,
                });
            }
            break;
        case "unloading_complete":
            if (update.creation_method === "trucker") {
                text = t("components.finishedDelivery", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            } else {
                text = t("transportStatus.managerMarkedUnloadingComplete", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            }
            break;
        case "truck_wash": {
            const washedInStation = !!update.update_details.truck_wash.stationName;
            switch (update.update_details.truck_wash.method) {
                case CleaningRegime.A:
                    text = washedInStation
                        ? t("components.addedWashSweepStation", {
                              name: authorName,
                          })
                        : t("components.addedWashSweepTrucker", {
                              name: authorName,
                          });
                    break;
                case CleaningRegime.B:
                    text = washedInStation
                        ? t("components.addedWashWaterStation", {
                              name: authorName,
                          })
                        : t("components.addedWashWaterTrucker", {
                              name: authorName,
                          });
                    break;
                case CleaningRegime.C:
                    text = washedInStation
                        ? t("components.addedWashDetergentStation", {
                              name: authorName,
                              chemical: update.update_details.truck_wash.detergent,
                          })
                        : t("components.addedWashDetergentTrucker", {
                              name: authorName,
                              chemical: update.update_details.truck_wash.detergent,
                          });
                    break;
                case CleaningRegime.D:
                    text = washedInStation
                        ? t("components.addedWashDisinfectantStation", {
                              name: authorName,
                              chemical: update.update_details.truck_wash.disinfectant,
                          })
                        : t("components.addedWashDisinfectantTrucker", {
                              name: authorName,
                              chemical: update.update_details.truck_wash.disinfectant,
                          });
                    break;
                case CleaningRegime.NONE:
                    text = t("components.addedWashNone", {
                        name: authorName,
                    });
                    break;
                case "station":
                    return t("components.addedWashStation", {
                        name: authorName,
                    });
                case "sweep":
                    return t("components.addedWashSweep", {
                        name: authorName,
                    });
                case "water":
                    return t("components.addedWashWater", {
                        name: authorName,
                    });
                default:
                    text = "";
                    break;
            }
            break;
        }
        case "done":
            text = t("transportStatusText.done");
            break;
        case "verified":
            text = t("components.markedAsVerified", {author: authorName});
            break;
        case "unverified":
            text = t("components.markedAsNotVerified", {author: authorName});
            break;
        case "invoiced":
            text = t("components.markedAsBilled", {author: authorName});
            break;
        case "uninvoiced":
            text = t("statusUpdate.hasMarkAsNotInvoiced", {author: authorName});
            break;
        case "invoice_number_added":
            text = t("statusUpdate.hasAddedInvoiceNumber", {author: authorName});
            break;
        case "invoice_number_removed":
            text = t("statusUpdate.hasRemoveInvoiceNumber", {author: authorName});
            break;
        case "paid":
            text = t("components.markedAsPayed", {author: authorName});
            break;
        case "credited":
            text = t("transportStatusText.credited", {author: authorName});
            break;
        case "rounds_started":
            if (update.creation_method === "telematic") {
                text = t("status.telematicDetectedRoundsStarted");
            } else {
                text = t("components.startedTheRounds", {author: authorName});
            }
            break;
        case "round_added_v2":
            text = t("components.addedARoundN", {
                author: authorName,
                round_id: update.update_details.round_id,
            });
            break;
        case "round_edited":
            text = t("components.editedRoundN", {
                author: authorName,
                round_id: update.update_details.round_id,
            });
            break;
        case "round_deleted":
            text = t("components.deletedRoundN", {
                author: authorName,
                round_id: update.update_details.round_id,
            });
            break;
        case "round_added":
            text = t("components.addedARound", {author: authorName});
            break;
        case "rounds_complete":
            text = t("components.completedTheRounds", {author: authorName});
            break;
        case "checklist_filled":
            text = t("components.checklistFilled", {author: authorName});
            break;
        case "on_the_way":
            text = t("components.onTheWayStatus", {
                author: authorName,
                // @ts-ignore
                company: additionalInfo.companyName,
                // @ts-ignore
                postCode: additionalInfo.postCode,
            });
            break;
        case "handling_started":
            text = t("components.handlingStarted", {truckerName: authorName});
            break;
        case "bulking_break_started":
            text = t("status.bulkingBreakStarted", {author: authorName});
            break;
        case "bulking_break_complete":
            text = t("status.bulkingBreakComplete", {author: authorName});
            break;
        case "deleted":
            text = t("status.deleted", {author: authorName});
            break;
        case "restored":
            text = t("status.restored", {author: authorName});
            break;
        case "break_time": {
            const {start, end} = update.update_details?.break_time ?? {};
            if (start && end) {
                text = t("status.breakTime", {
                    author: authorName,
                    // @ts-ignore
                    start: formatDate(utcToZonedTime(start, additionalInfo.timezone), "p"),
                    // @ts-ignore
                    end: formatDate(utcToZonedTime(end, additionalInfo.timezone), "p"),
                });
            }
            break;
        }
        case "event":
            if (update.creation_method === "telematic") {
                const modifiedUpdate = {
                    ...update,
                    category: update.update_details.status,
                };
                // @ts-ignore
                text = getStatusUpdateText(modifiedUpdate, isOrder, additionalInfo);
            } else {
                text = "";
            }
            break;
        case "amended": {
            const [update_detail] = getListDiff(update.update_details, null);
            const i18nKey = update_detail?.old ? "status.amendedModify" : "status.amendedAdd";
            text = t(i18nKey, {
                author: authorName,
                update_detail: update_detail?.label ?? "",
            });
            break;
        }

        case "activity.amended": {
            const realStart = update.update_details?.real_start;
            const realEnd = update.update_details?.real_end;

            const [update_detail] = getListDiff(update.update_details, null);
            const isBothDateChanged = realStart && realEnd;
            text = t("status.amendedModify", {
                author: authorName,
                update_detail: isBothDateChanged
                    ? t("transportUpdateDetail.realDate")
                    : update_detail?.label,
            });
            break;
        }
        case "delivery_load.amended": {
            const type = update.update_details?.type as "PLANNED" | "LOADED" | "UNLOADED";
            // If formatted_old_load is null or empty, it means that the load was added
            const isUpdatedEvent = !!update.update_details?.formatted_old_load;
            const i18nKey = (() => {
                if (isMultipleRound) {
                    return isUpdatedEvent ? "status.amendedModifyRound" : "status.amendedAddRound";
                }
                return isUpdatedEvent ? "status.amendedModify" : "status.amendedAdd";
            })();

            const label = type
                ? {
                      PLANNED: t("transportUpdateDetail.planned_loads"),
                      LOADED: t("transportUpdateDetail.origin_loads"),
                      UNLOADED: t("transportUpdateDetail.destination_loads"),
                  }[type]
                : "";

            return t(i18nKey, {
                author: authorName,
                update_detail: label,
                round_id: update.update_details?.round_id,
            });
        }
        case "rest.amended": {
            const i18nKey = (() => {
                if (!update.update_details?.old) {
                    return "status.amendedAddRest";
                }
                if (!update.update_details?.new) {
                    return "status.amendedDeleteRest";
                }
                return "status.amendedModifyRest";
            })();

            text = t(i18nKey, {
                author: authorName,
            });
            break;
        }
        case "activity.undone":
            if (additionalInfo?.siteCategory === "loading") {
                text = t("status.loadingUndone", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            } else if (additionalInfo?.siteCategory === "unloading") {
                text = t("status.unloadingUndone", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            } else if (additionalInfo?.siteCategory === "breaking") {
                text = t("status.breakingUndone", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            } else if (additionalInfo?.siteCategory === "resuming") {
                text = t("status.resumingUndone", {
                    author: authorName,
                    index: additionalInfo?.siteIndex,
                });
            }
            break;
        case "carbon_footprint.manual_added":
            text = t("status.carbonFootprintAdded", {
                author: authorName,
                carbon_footprint: formatNumber(
                    update.update_details?.manual_carbon_footprint?.new,
                    {maximumFractionDigits: 2}
                ),
            });
            break;
        case "carbon_footprint.manual_deleted":
            text = t("status.carbonFootprintDeleted", {
                author: authorName,
            });
            break;
        case "supports_exchange.amended":
            return t("status.supports_exchange.amended", {
                author: authorName,
                index: additionalInfo?.siteIndex,
            });
        case "delivery.added":
            return t("status.addedAPickupAndDelivery", {
                author: authorName,
            });
        default:
            text = "";
    }

    return text;
}

export function getStatusUpdateRelatedObjectInfo(
    update: TransportStatus,
    companyPk: number | null
): {prefix: string | null; text: string; target: string | null} | undefined {
    let prefix: string | null = null;
    let text: string;
    let target: string | null = null;
    switch (update.category) {
        case "credited": {
            if (!update.credit_note) {
                return undefined;
            }
            const isViewedByOwner = update.credit_note.created_by === companyPk;
            const baseUrl = isViewedByOwner ? "app/credit-notes" : "shared-credit-notes";

            prefix = t("creditNote.documentNumberPrefix");
            text = update.credit_note.document_number;
            target = `/${baseUrl}/${update.credit_note.uid}/`;
            break;
        }
        case "invoiced":
        case "paid": {
            if (!update.invoice) {
                return undefined;
            }
            const isViewedByOwner = update.invoice.created_by === companyPk;
            if (!isViewedByOwner && !update.invoice.document_number) {
                return undefined; // No details to non-owner if not finalized
            }

            if (update.invoice.document_number) {
                prefix = t("invoice.documentNumberPrefix");
                text = update.invoice.document_number;
            } else {
                prefix = t("components.invoice") + " ";
                text = t("invoice.status.draft");
            }

            const baseUrl = isViewedByOwner ? "app/invoices" : "shared-invoices";
            target = `/${baseUrl}/${update.invoice.uid}/`;
            break;
        }
        default:
            return undefined;
    }
    return {prefix, target, text};
}

function getTransportStatusDisplayMap(isOrder: boolean): Record<
    Transport["status"] | TransportStage | OrderStage,
    | {
          text: string;
          width: number;
          backgroundColor: string;
      }
    | undefined
> {
    return {
        created: {
            text: isOrder ? t("components.awaitingAcceptance") : t("common.created"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        updated: {
            text: t("components.updated"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        unassigned: {
            text: t("components.updated"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        assigned: {
            text: t("components.planned"),
            width: 20,
            backgroundColor: theme.colors.green.default,
        },
        sent_to_trucker: {
            text: t("components.sentToTrucker"),
            width: 20,
            backgroundColor: theme.colors.green.default,
        },
        acknowledged: {
            text: t("components.receivedByTrucker"),
            width: 20,
            backgroundColor: theme.colors.green.default,
        },
        on_loading_site: {
            text: t("common.pickup"),
            width: 35,
            backgroundColor: theme.colors.green.default,
        },
        loading_complete: {
            text: t("components.onTheWay"),
            width: 55,
            backgroundColor: theme.colors.green.default,
        },
        departed: {
            text: t("components.vehicleDeparted"),
            width: 55,
            backgroundColor: theme.colors.green.default,
        },
        rounds_started: {
            text: t("components.roundsStarted"),
            width: 55,
            backgroundColor: theme.colors.green.default,
        },
        on_unloading_site: {
            text: t("common.delivery"),
            width: 75,
            backgroundColor: theme.colors.green.default,
        },
        ongoing: {
            text: t("sidebar.ongoing"),
            width: 50,
            backgroundColor: theme.colors.green.default,
        },
        unloading_complete: {
            text: t("components.onTheWay"),
            width: 75,
            backgroundColor: theme.colors.green.default,
        },
        rounds_complete: {
            text: t("components.roundsComplete"),
            width: 75,
            backgroundColor: theme.colors.green.default,
        },
        done: {
            text: t("components.done"),
            width: 100,
            backgroundColor: theme.colors.green.default,
        },
        confirmed: {
            text: t("components.accepted"),
            width: 15,
            backgroundColor: theme.colors.green.default,
        },
        declined: {
            text: t("components.declined"),
            width: 10,
            backgroundColor: theme.colors.red.default,
        },
        cancelled: {
            text: t("components.cancelled"),
            width: 10,
            backgroundColor: theme.colors.red.default,
        },
        verified: {
            text: t("components.verified"),
            width: 100,
            backgroundColor: theme.colors.pink.default,
        },
        invoiced: {
            text: t("components.billed"),
            width: 100,
            backgroundColor: theme.colors.blue.light,
        },
        paid: {
            text: t("components.paid"),
            width: 100,
            backgroundColor: theme.colors.green.default,
        },
        credited: undefined,
        invoice_number_added: undefined,
        uninvoiced: undefined,
        invoice_number_removed: undefined,
    };
}

function getTransportManagedThroughStatusDisplayMap(): Partial<
    Record<
        TransportManagedThrough["status"],
        {
            text: string;
            width: number;
            backgroundColor: string;
        }
    >
> {
    return {
        SEND_IN_PROGRESS: {
            text: t("sendToNetwork.sending"),
            width: 20,
            backgroundColor: theme.colors.green.default,
        },
        SEND_SUCCESS: {
            text: t("sendToNetwork.sendSuccess"),
            width: 20,
            backgroundColor: theme.colors.green.default,
        },
        SEND_FAILED: {
            text: t("sendToNetwork.sendFailed"),
            width: 20,
            backgroundColor: theme.colors.red.default,
        },
        ONGOING: {
            text: t("sendToNetwork.ongoing"),
            width: 55,
            backgroundColor: theme.colors.green.default,
        },
        DONE: {
            text: t("components.done"),
            width: 100,
            backgroundColor: theme.colors.green.default,
        },
    };
}

export function getTransportStatusDisplay(
    status: Transport["status"] | TransportStage | OrderStage,
    managed_status: TransportManagedThrough["status"] | undefined,
    isOrder: boolean
): {text: string; width: number; backgroundColor: string} {
    const transportStatusDisplay = getTransportStatusDisplayMap(isOrder);

    const managedThroughStatusDisplay = getTransportManagedThroughStatusDisplayMap();
    if (managed_status !== undefined && managedThroughStatusDisplay[managed_status]) {
        return managedThroughStatusDisplay[managed_status];
    }

    const display = transportStatusDisplay[status];
    if (!display) {
        return {text: t("common.unknown"), width: 0, backgroundColor: "transparent"};
    }

    return display;
}

/**
 * The draft assignation involves to override the status name for:
 * - created
 * - draft_assigned
 */
export function getTransportationPlanStatusName(
    transport: Transport | TransportListWeb,
    label: string
) {
    let result = label;
    if (transport.status === "created" && transport.carrier_assignation_status === "unassigned") {
        result = t("sidebar.ordersToAssign");
    } else if (transport.carrier_assignation_status === "draft_assigned") {
        result = t("sidebar.ordersToSend");
    }
    return result;
}

export function isTransportMeansManagedByExtension(transport: TransportListWeb) {
    return !!transport.managed_through && transport.managed_through.status != "";
}
