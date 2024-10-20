import {
    apiService,
    getConnectedManager,
    HasFeatureFlag,
    managerService,
    ModerationButton,
    TrackedLink,
    useTimezone,
} from "@dashdoc/web-common";
import {getLoadText, getReadableAddress, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    DocumentDropzone,
    EditableField,
    Flex,
    Icon,
    IconButton,
    Link,
    Table,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {
    APIListResponse,
    FleetItem,
    formatDate,
    isFleetItemVehicle,
    parseAndZoneDate,
    populateFormData,
    Tag,
    Trailer,
    TrailerDocument,
    TransportStatusCategory,
    useToggle,
    Vehicle,
    VehicleDocument,
} from "dashdoc-utils";
import isBefore from "date-fns/isBefore";
import omit from "lodash.omit";
import React, {
    ComponentProps,
    FunctionComponent,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {useSelector} from "react-redux";
import {RouteComponentProps, withRouter} from "react-router";

import {TagSection} from "app/features/core/tags/TagSection";
import DocumentModal from "app/features/document/DocumentModal";
import FleetMeansCombination from "app/features/fleet/fleet-details/FleetMeansCombination";
import QualimatHistoryModal from "app/features/settings/qualimat/QualimatHistoryModal";
import {
    fetchDeleteTrailer,
    fetchDeleteVehicle,
    fetchTelematicVehicleLink,
    fetchUpdateTrailer,
    fetchUpdateVehicle,
    TelematicVehicleLink,
} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {fuelTypeService} from "app/services/transport";
import {activityService} from "app/services/transport/activity.service";
import {TransportListWeb} from "app/types/transport_list_web";

import FleetEvents from "../fleet-events";
import FleetModal from "../FleetModal";
import {getDeadlineValueAndIcon} from "../getDeadlineValueAndIcon";
import {UnavailabilityListDetails} from "../unavailabilities/UnavailabilityListDetails";
import UnavailabilityModal from "../unavailabilities/UnavailabilityModal";

import type {Activity} from "app/types/transport";

export function FleetDetailsPanel({children}: {children: ReactNode}) {
    return (
        <Box mt={3} p={3} backgroundColor="grey.white" borderRadius={2}>
            {children}
        </Box>
    );
}

const FleetInformationSubtitle: FunctionComponent<{
    iconName: ComponentProps<typeof Icon>["name"];
    title: string;
}> = ({iconName, title}) => {
    return (
        <Flex>
            <Icon name={iconName} color="blue.default" mr={1} />
            <Text variant="h2" alignSelf="flex-end">
                {title}
            </Text>
        </Flex>
    );
};

type Item = Vehicle | Trailer;
type FleetItemDocument = VehicleDocument | TrailerDocument;
type FleetDetailCommonProps = {
    fleetItem: Item;
    fleetItemType: FleetItem["type"];
};

function RoutelessFleetDetailsHeader({
    fleetItem,
    fleetItemType,
    onFleetItemDelete,
    history,
}: FleetDetailCommonProps &
    RouteComponentProps & {
        onFleetItemDelete?: () => void;
    }) {
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    const [isUnavailabilityModalOpen, openUnavailabilityModal, closeUnavailabilityModal] =
        useToggle();
    const timezone = useTimezone();

    const dispatch = useDispatch();

    const handleDeleteItem = useCallback(async () => {
        if (fleetItemType === "vehicle") {
            await dispatch(fetchDeleteVehicle(fleetItem));
        } else {
            await dispatch(fetchDeleteTrailer(fleetItem));
        }
        onFleetItemDelete?.();
        history.push("/app/fleet/vehicles/");
    }, [dispatch, fleetItem, fleetItemType, history, onFleetItemDelete]);

    const title = useMemo(() => {
        if (!!fleetItem.license_plate && !!fleetItem.fleet_number) {
            return `${fleetItem.license_plate} - ${fleetItem.fleet_number}`;
        }
        return fleetItem.license_plate || fleetItem.fleet_number;
    }, [fleetItem.fleet_number, fleetItem.license_plate]);

    const connectedManager = useSelector(getConnectedManager);

    return (
        <Flex justifyContent="space-between" mb={3} flexWrap="wrap">
            <Box>
                <Flex alignItems="baseline">
                    <Text variant="title">
                        <Icon
                            mr={2}
                            name={fleetItemType === "vehicle" ? "steeringWheel" : "trailer"}
                        />
                        {title}
                    </Text>
                    <Text ml={3}>
                        {t("common.createdOn")}{" "}
                        {formatDate(parseAndZoneDate(fleetItem.created, timezone), "P")}
                    </Text>
                </Flex>

                {fleetItemType === "vehicle" && (
                    <ModerationButton
                        manager={connectedManager}
                        path={`vehicles/${fleetItem.pk}/`}
                    />
                )}

                {fleetItemType === "trailer" && (
                    <ModerationButton
                        manager={connectedManager}
                        path={`trailers/${fleetItem.pk}/`}
                    />
                )}
            </Box>
            <Flex alignSelf="flex-end" marginLeft="auto">
                {managerService.hasAtLeastUserRole(connectedManager) && (
                    <>
                        <Button
                            ml={2}
                            key="edit"
                            name="edit"
                            variant="primary"
                            onClick={openEditModal}
                            data-testid="fleet-detail-update"
                        >
                            <Icon name="edit" mr={2} />
                            {t("common.update")}
                        </Button>
                        <Button
                            variant="secondary"
                            ml={2}
                            key="add-unavailability"
                            data-testid="add-unavailability"
                            onClick={openUnavailabilityModal}
                        >
                            {t("unavailability.addUnavailability")}
                        </Button>

                        <IconButton
                            ml={2}
                            alignSelf="center"
                            key="delete"
                            name="delete"
                            label={t("common.delete")}
                            onClick={handleDeleteItem}
                            withConfirmation
                            data-testid="fleet-detail-delete"
                        />
                    </>
                )}
            </Flex>
            {isUnavailabilityModalOpen && (
                <UnavailabilityModal
                    fleetItemPk={fleetItem.pk}
                    fleetItemName={fleetItem.license_plate}
                    type={fleetItemType}
                    onClose={closeUnavailabilityModal}
                />
            )}
            {isEditModalOpen && (
                <FleetModal
                    onClose={closeEditModal}
                    type={fleetItemType}
                    item={fleetItem as Vehicle | Trailer}
                />
            )}
        </Flex>
    );
}

const FleetDetailsHeader = withRouter(RoutelessFleetDetailsHeader);

type FleetDetailsInformationProps = FleetDetailCommonProps;

function FleetDetailsInformation({fleetItem, fleetItemType}: FleetDetailsInformationProps) {
    // @ts-ignore
    const [telematicVehicle, setTelematicVehicle] = useState<TelematicVehicleLink>(null);
    const [isHistoryModalOpen, openHistoryModal, closeHistoryModal] = useToggle();
    const fleetAsVehicle = fleetItemType === "vehicle" ? (fleetItem as Vehicle) : null;

    const fetchTelematics = useCallback(async () => {
        try {
            const vehicle_link_response: TelematicVehicleLink = await fetchTelematicVehicleLink(
                // @ts-ignore
                fleetAsVehicle.telematic_vehicle
            );

            setTelematicVehicle(vehicle_link_response);
        } catch (error) {
            // If the error is a 404; ignore it and let
            // the user create a new telematic vehicle.
            // This can happen if it has been deleted from
            // the backend but redux has not refreshed.
            if (error.status != 404) {
                throw error;
            }
            // @ts-ignore
            setTelematicVehicle(null);
        }
    }, [fleetAsVehicle?.telematic_vehicle]);

    useEffect(() => {
        if (fleetAsVehicle?.telematic_vehicle) {
            fetchTelematics();
        }
    }, [fetchTelematics, fleetItem]);

    const fuel_type_value = useMemo(
        // @ts-ignore
        () =>
            fleetAsVehicle?.fuel_type
                ? fuelTypeService.translateFuelType(fleetAsVehicle.fuel_type)
                : null,
        [fleetAsVehicle]
    );

    return (
        <FleetDetailsPanel>
            <Flex flexWrap="wrap">
                <Box flexBasis={"50%"}>
                    <FleetInformationSubtitle iconName="truck" title={t("fleet.identification")} />
                    <EditableField
                        label={`${t("components.remoteId")} :`}
                        value={fleetItem.remote_id}
                        clickable={false}
                    />
                    <EditableField
                        label={`${t("components.licensePlate")} :`}
                        value={fleetItem.license_plate}
                        clickable={false}
                    />
                    {fleetItemType === "vehicle" && (
                        <>
                            <EditableField
                                label={`${t("common.gross_combination_weight.acronym")} :`}
                                value={
                                    // @ts-ignore
                                    fleetAsVehicle.gross_combination_weight_in_tons
                                        ? t("common.metric_tons_formatted", {
                                              // @ts-ignore
                                              weight: fleetAsVehicle.gross_combination_weight_in_tons,
                                          })
                                        : ""
                                }
                                clickable={false}
                            />
                            <EditableField
                                label={`${t("common.fuel_type")} :`}
                                value={fuel_type_value}
                                clickable={false}
                            />
                        </>
                    )}

                    <EditableField
                        label={`${t("common.fleetNumber")} :`}
                        value={fleetItem.fleet_number}
                        clickable={false}
                    />
                    <EditableField
                        label={`${t("fleet.usedForQualimat")} :`}
                        value={t(
                            fleetItem.used_for_qualimat_transports ? "common.yes" : "common.no",
                            // @ts-ignore
                            null,
                            {capitalize: true}
                        )}
                        clickable={false}
                    />
                    <EditableField
                        label={`${t("qualimatHistory.modalTitle")} :`}
                        value={
                            <a
                                href="#"
                                onClick={openHistoryModal}
                                data-testid="qualimat-history-button"
                            >
                                <Icon name="openInNewTab" />
                            </a>
                        }
                        clickable={false}
                    />
                    <HasFeatureFlag flagName={"dedicatedResources"}>
                        <EditableField
                            label={`${t("common.specificities")} :`}
                            value={
                                fleetItem.dedicated_by_carrier
                                    ? t("fleet.dedicatedEquipmentFor", {
                                          company_name: fleetItem.dedicated_by_carrier.name,
                                      })
                                    : ""
                            }
                            data-testid="fleet-specificities"
                            clickable={false}
                        />
                    </HasFeatureFlag>
                </Box>
                <Box flexBasis={"50%"}>
                    <FleetInformationSubtitle iconName="calendar" title={t("fleet.deadlines")} />
                    <EditableField
                        label={`${t("fleet.technicalControlDeadlinePlaceholder")} :`}
                        // @ts-ignore
                        value={getDeadlineValueAndIcon(fleetItem.technical_control_deadline)}
                        clickable={false}
                    />
                    {fleetItemType === "vehicle" && (
                        <>
                            <EditableField
                                label={`${t("fleet.tachographControlDeadlinePlaceholder")} :`}
                                // @ts-ignore
                                value={getDeadlineValueAndIcon(fleetAsVehicle.tachograph_deadline)}
                                clickable={false}
                            />
                            <EditableField
                                label={`${t("fleet.speedLimiterControlDeadlinePlaceholder")} :`}
                                value={getDeadlineValueAndIcon(
                                    // @ts-ignore
                                    fleetAsVehicle.speed_limiter_deadline
                                )}
                                clickable={false}
                            />
                        </>
                    )}
                </Box>
                {fleetItemType === "vehicle" && (
                    <Box mt={4}>
                        <FleetInformationSubtitle
                            iconName="telematicConnection"
                            title={t("common.telematic")}
                        />
                        <EditableField
                            label={`${t("settings.telematicVendor")} :`}
                            value={telematicVehicle?.vendor_name}
                            clickable={false}
                        />
                        <EditableField
                            label={`${t("telematic.vehicleTelematicID")} :`}
                            value={telematicVehicle?.vendor_id}
                            clickable={false}
                        />
                    </Box>
                )}
            </Flex>
            {isHistoryModalOpen && (
                <QualimatHistoryModal
                    type={fleetItemType == "vehicle" ? "vehicles" : "trailers"}
                    fleetItemId={fleetItem.pk}
                    fleetLicensePlate={fleetItem.license_plate}
                    fleetUsedForQualimat={fleetItem.used_for_qualimat_transports}
                    onClose={closeHistoryModal}
                />
            )}
        </FleetDetailsPanel>
    );
}

function FleetDetailsTag({fleetItem, fleetItemType}: FleetDetailCommonProps) {
    const dispatch = useDispatch();
    const connectedManager = useSelector(getConnectedManager);

    const fleetData = {
        ...omit(fleetItem, "unavailability", "events"),
    };

    const fetchUpdate = fleetItemType === "trailer" ? fetchUpdateTrailer : fetchUpdateVehicle;
    const handleOnDeleteTag = (tag: Tag) => {
        dispatch(
            fetchUpdate({
                ...fleetData,
                // @ts-ignore
                tags: fleetItem.tags.filter((t: Tag) => t.pk !== tag.pk),
            })
        );
    };

    const handleOnAddTag = (tag: Tag) => {
        dispatch(
            fetchUpdate({
                ...fleetData,
                // @ts-ignore
                tags: [...fleetItem.tags, tag],
            })
        );
    };

    return (
        <FleetDetailsPanel>
            <Text variant="h1">{t("common.tags")}</Text>
            <Flex flexWrap="wrap">
                <TagSection
                    // @ts-ignore
                    tags={fleetItem.tags}
                    onDelete={handleOnDeleteTag}
                    onAdd={handleOnAddTag}
                    canUpdateTags={managerService.hasAtLeastUserRole(connectedManager)}
                />
            </Flex>
        </FleetDetailsPanel>
    );
}

type FleetDetailsActivityColumn = "type" | "date" | "location" | "details" | "transport";

const FleetActivitiesColumns: {getLabel: () => string; name: FleetDetailsActivityColumn}[] = [
    {getLabel: () => t("common.date"), name: "date"},
    {getLabel: () => t("common.activities"), name: "type"},
    {getLabel: () => t("common.location"), name: "location"},
    {getLabel: () => t("components.details"), name: "details"},
    {getLabel: () => t("common.transport"), name: "transport"},
];

function FleetDetailsActivities({fleetItem}: {fleetItem: Item}) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [transports, setTransports] = useState<TransportListWeb[]>([]);
    const [isActivitiesLoading, loadActivities, unloadActivities] = useToggle();
    const timezone = useTimezone();

    const fetchActivities = useCallback(async () => {
        loadActivities();
        const isVehicle = isFleetItemVehicle(fleetItem);
        // The API expects comma separated strings and not list for `_in` filters
        const query = isVehicle
            ? {vehicle__in: [fleetItem.pk].join(",")}
            : {trailer__in: [fleetItem.pk].join(",")};
        const response: APIListResponse<TransportListWeb> = await apiService.post(
            "/transports/list/",
            {
                filters: query,
            },
            {
                apiVersion: "web",
            }
        );
        const {results: transports} = response;
        setTransports(transports);

        let activities: Activity[] = [];

        const filterPlateFunction = isVehicle
            ? (activity: Activity) =>
                  !!activity.site.real_end &&
                  (activity.segment?.vehicle?.original || activity.segment?.vehicle?.pk) ===
                      fleetItem.pk
            : (activity: Activity) =>
                  !!activity.site.real_end &&
                  (activity.segment?.trailers[0]?.original ||
                      activity.segment?.trailers[0]?.pk) === fleetItem.pk;

        transports.forEach((transport) => {
            // TODO: compatibility with TransportListWeb
            const currentTransportActivities = activityService.getTransportActivities(
                transport as any
            ) as Activity[];
            activities.push(...currentTransportActivities.filter(filterPlateFunction));
        });
        activities = activities.sort((a, b) =>
            // @ts-ignore
            isBefore(new Date(a.site.real_end), new Date(b.site.real_end)) ? 1 : -1
        );
        unloadActivities();
        setActivities(activities);
    }, [loadActivities, fleetItem, unloadActivities]);

    useEffect(() => {
        fetchActivities();
    }, [fleetItem.pk]);

    const getRowCellContent = useCallback(
        (activity: Activity, columnName: FleetDetailsActivityColumn) => {
            switch (columnName) {
                case "type":
                    return activityService.getActivityTitle(activity);
                case "date":
                    return formatDate(parseAndZoneDate(activity.site.real_end, timezone), "P");
                case "location":
                    if (activity.site.address) {
                        return getReadableAddress(activity.site?.address);
                    } else {
                        return null;
                    }
                case "details": {
                    if (["bulkingBreakEnd", "bulkingBreakStart"].includes(activity.type)) {
                        return "—";
                    }
                    const statusUpdatesCategory: TransportStatusCategory =
                        activity.type === "loading" ? "loading_complete" : "unloading_complete";
                    const relatedStatusUpdates = activity.statusUpdates.filter(
                        ({category}) => category === statusUpdatesCategory
                    );
                    let loadTexts: string[] = [];
                    const deliveries = activity.deliveries.map(({uid}) => uid);
                    relatedStatusUpdates.forEach((statusUpdate) => {
                        deliveries.forEach((deliveryUid) => {
                            loadTexts.push(
                                statusUpdate.update_details?.loads?.[deliveryUid]?.map?.(
                                    getLoadText
                                )
                            );
                        });
                    });
                    loadTexts = loadTexts.filter(Boolean);
                    if (loadTexts.length) {
                        return loadTexts.map((load, index) => (
                            // @ts-ignore
                            <Text key={`activity-${activity.segment.uid}-${index}`}>{load}</Text>
                        ));
                    }
                    return "—";
                }
                case "transport": {
                    const transport = transports.find(({uid}) => uid === activity.transportUid);
                    return (
                        <TrackedLink to={`/app/transports/${activity.transportUid}/`}>
                            {t("transportDetails.transportNumber", {
                                // @ts-ignore
                                number: transport.sequential_id,
                            })}{" "}
                            <Icon fontSize="10px" name="openInNewTab" />
                        </TrackedLink>
                    );
                }
                default:
                    return null;
            }
        },
        [transports]
    );

    return (
        <FleetDetailsPanel>
            <Text variant="h1">{t("common.activities")}</Text>
            <Table
                columns={FleetActivitiesColumns}
                rows={activities}
                getRowCellContent={getRowCellContent}
                isLoading={isActivitiesLoading}
                height={"300px"}
            />
        </FleetDetailsPanel>
    );
}

type FleetDetailsDocumentsColumn = "name" | "created" | "author" | "actions";

const fleetItemDocumentsColumns: {
    width: string;
    getLabel: () => string;
    name: FleetDetailsDocumentsColumn;
}[] = [
    {width: "auto", getLabel: () => t("common.name"), name: "name"},
    {width: "auto", getLabel: () => t("components.uploadDate"), name: "created"},
    {width: "auto", getLabel: () => t("common.author"), name: "author"},
    {width: "40px", getLabel: () => "", name: "actions"},
];

function FleetDetailsDocuments({fleetItem, fleetItemType}: FleetDetailsProps) {
    // @ts-ignore
    const [selectedFile, setSelectedFile] = useState<File>(null);
    const [documents, setDocuments] = useState<FleetItemDocument[]>([]);
    const [isTableLoading, setTableLoading, setTableNotLoading] = useToggle();
    // @ts-ignore
    const [previewedDocument, setPreviewedDocument] = useState<FleetItemDocument>(null);
    const timezone = useTimezone();
    const connectedManager = useSelector(getConnectedManager);

    const fetchDocuments = useCallback(async () => {
        setTableLoading();
        try {
            if (fleetItemType === "vehicle") {
                const {results} = await apiService.VehicleDocuments.getAll({
                    query: {vehicle__in: fleetItem.pk},
                });
                setDocuments(results);
            } else if (fleetItemType === "trailer") {
                const {results} = await apiService.TrailerDocuments.getAll({
                    query: {trailer__in: fleetItem.pk},
                });
                setDocuments(results);
            }
        } catch (error) {
            toast.error(t("fleet.errors.couldNotRetrieveDocument"));
        }
        setTableNotLoading();
    }, [setTableLoading, setTableNotLoading, fleetItemType, fleetItem.pk]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments, fleetItem.pk]);

    const handleDeleteDocumentClick = useCallback(
        async (document: FleetItemDocument) => {
            setTableLoading();
            try {
                if (fleetItemType === "vehicle") {
                    await apiService.VehicleDocuments.delete(document.uid);
                } else if (fleetItemType === "trailer") {
                    await apiService.TrailerDocuments.delete(document.uid);
                }
                toast.success(t("components.documentSuccessfullyDeleted"));
            } catch (error) {
                toast.error(t("fleet.errors.couldNotDeleteDocument"));
            }
            fetchDocuments();
        },
        [fetchDocuments, fleetItemType, setTableLoading]
    );

    const uploadFile = useCallback(
        async (file: File) => {
            setSelectedFile(file);
            try {
                if (fleetItemType === "vehicle") {
                    await apiService.VehicleDocuments.post({
                        data: populateFormData({
                            vehicle: fleetItem.pk,
                            file,
                            name: file.name,
                        }) as any,
                    });
                } else if (fleetItemType === "trailer") {
                    await apiService.TrailerDocuments.post({
                        data: populateFormData({
                            trailer: fleetItem.pk,
                            file,
                            name: file.name,
                        }) as any,
                    });
                }
                toast.success(t("components.documentSuccessfullyAdded"));
            } catch (error) {
                toast.error(t("fleet.errors.couldNotAddDocument"));
            }
            fetchDocuments();
            // @ts-ignore
            setSelectedFile(null);
        },
        [fetchDocuments, fleetItem.pk, fleetItemType]
    );

    const getRowCellContent = useCallback(
        (document: VehicleDocument | TrailerDocument, columnName: FleetDetailsDocumentsColumn) => {
            switch (columnName) {
                case "name":
                    return (
                        <Link onClick={setPreviewedDocument.bind(undefined, document)}>
                            {document.name}
                        </Link>
                    );
                case "author":
                    return document.author?.display_name;
                case "created":
                    return formatDate(parseAndZoneDate(document.created, timezone), "P");
                case "actions":
                    return (
                        <IconButton
                            name="delete"
                            onClick={() => handleDeleteDocumentClick(document)}
                            data-testid="document-row-delete-button"
                            withConfirmation
                            confirmationMessage={t("components.confirmDeleteDocument")}
                            modalProps={{
                                title: t("components.deleteDocument"),
                                mainButton: {
                                    children: t("common.delete"),
                                    "data-testid": "document-delete-confirmation-button",
                                },
                            }}
                        ></IconButton>
                    );
                default:
                    return "";
            }
        },
        []
    );

    return (
        <FleetDetailsPanel>
            <Text variant="h1">{t("components.documentsPhotos")}</Text>
            {managerService.hasAtLeastUserRole(connectedManager) && (
                <DocumentDropzone
                    file={selectedFile}
                    onAcceptedFile={uploadFile}
                    onRemoveFile={setSelectedFile.bind(undefined, null)}
                    loading={!!selectedFile}
                    nameMaxLength={100}
                />
            )}

            <Table
                columns={fleetItemDocumentsColumns}
                rows={documents}
                getRowCellContent={getRowCellContent}
                isLoading={isTableLoading}
                height={"300px"}
            />

            {previewedDocument && (
                <DocumentModal
                    documents={[{label: t("common.document"), url: previewedDocument.file}]}
                    onClose={setPreviewedDocument.bind(undefined, null)}
                />
            )}
        </FleetDetailsPanel>
    );
}

function FleetDetailsEvents({fleetItem}: {fleetItem: Vehicle | Trailer}) {
    return (
        <Box flex={1} mt={3} p={3} backgroundColor="grey.white" borderRadius={2}>
            <Text variant="h1">{t("components.events")}</Text>
            {/*
// @ts-ignore */}
            <FleetEvents events={fleetItem.events} />
        </Box>
    );
}

type FleetDetailsProps = {
    fleetItem: Item;
    fleetItemType: FleetItem["type"];
    onFleetItemDelete?: () => void;
};

function FleetDetails(props: FleetDetailsProps) {
    return (
        <Box>
            <FleetDetailsHeader {...props} />
            <FleetDetailsInformation {...props} />
            <FleetDetailsTag {...props} />
            <FleetMeansCombination {...props} />
            <FleetDetailsActivities {...props} />
            <UnavailabilityListDetails fleetItem={props.fleetItem} type={props.fleetItemType} />
            <Flex flexWrap="wrap" pb={3} ml={-3}>
                <Box flex="1 1 500px" ml={3}>
                    <FleetDetailsDocuments {...props} />
                </Box>
                <Box flex="1 1 500px" ml={3}>
                    <FleetDetailsEvents fleetItem={props.fleetItem} />
                </Box>
            </Flex>
        </Box>
    );
}

export default FleetDetails;
