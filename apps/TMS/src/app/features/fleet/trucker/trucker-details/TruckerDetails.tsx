import {guid} from "@dashdoc/core";
import {
    TrackedLink,
    apiService,
    getConnectedManager,
    managerService,
    useTimezone,
} from "@dashdoc/web-common";
import {getLoadText, getReadableAddress, t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    ButtonProps,
    DocumentDropzone,
    Flex,
    HorizontalLine,
    Icon,
    IconButton,
    Link,
    Popover,
    Table,
    Text,
    TooltipWrapper,
    theme,
    toast,
} from "@dashdoc/web-ui";
import {
    APIListResponse,
    Tag,
    TransportStatusCategory,
    Trucker,
    TruckerDocument,
    formatDate,
    parseAndZoneDate,
    populateFormData,
    useToggle,
} from "dashdoc-utils";
import isBefore from "date-fns/isBefore";
import omit from "lodash.omit";
import React, {ReactNode, useCallback, useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {TagSection} from "app/features/core/tags/TagSection";
import DocumentModal from "app/features/document/DocumentModal";
import {fetchUpdateTrucker} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {loadRequestAbsenceManagerConnector} from "app/redux/reducers/connectors";
import {getAbsencePlannerConnector} from "app/redux/selectors/connector";
import {activityService} from "app/services/transport/activity.service";
import {TransportListWeb} from "app/types/transport_list_web";

import FleetEvents from "../../fleet-events";
import {getDeadlineValueAndIcon} from "../../getDeadlineValueAndIcon";
import {UnavailabilityListDetails} from "../../unavailabilities/UnavailabilityListDetails";
import UnavailabilityModal from "../../unavailabilities/UnavailabilityModal";
import {DeleteTruckerButton} from "../action-buttons/DeleteTruckerButton";
import {DisableTruckerButton} from "../action-buttons/DisableTruckerButton";
import {EnableTruckerButton} from "../action-buttons/EnableTruckerButton";
import {TruckerInviteCode} from "../trucker-invite-code";
import {TruckerModal} from "../trucker-modal/TruckerModal";

import {TruckerCardsCertificates} from "./TruckerCardsCertificates";
import {TruckerDriverLicense} from "./TruckerDriverLicense";
import TruckerMeansCombination from "./TruckerMeansCombination";

import type {Activity} from "app/types/transport";

export type EditTruckerActionProps = {
    trucker: Trucker;
    label?: string;
} & Partial<ButtonProps>;

const EditTruckerAction = (props: EditTruckerActionProps) => {
    const {trucker, label, ...buttonProps} = props;
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    return (
        <>
            <Button
                key="edit"
                name="edit"
                data-testid="edit-trucker-button"
                variant="primary"
                onClick={openEditModal}
                {...buttonProps}
            >
                {label || (
                    <>
                        <Icon name="edit" mr={2} />
                        {t("common.update")}
                    </>
                )}
            </Button>
            {isEditModalOpen && <TruckerModal trucker={trucker} onClose={closeEditModal} />}
        </>
    );
};

export function TruckerDetailsPanel({children}: {children: ReactNode}) {
    return (
        <Box mt={4} p={4} backgroundColor="grey.white" borderRadius={2}>
            {children}
        </Box>
    );
}

function TruckerDetailsHeader({
    trucker,
    onTruckerDelete,
}: {
    trucker: Trucker;
    onTruckerDelete?: () => void;
}) {
    const timezone = useTimezone();
    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());

    const [isUnavailabilityModalOpen, openUnavailabilityModal, closeUnavailabilityModal] =
        useToggle();

    // If one or more absence manager is linked, no absences can be create by Dashdoc
    const dispatch = useDispatch();
    dispatch(loadRequestAbsenceManagerConnector());
    const hasAbsenceManagerConnector = useSelector(getAbsencePlannerConnector);

    const AddAbsenceTruckerButton = () => (
        <Button
            variant="secondary"
            ml={2}
            disabled={hasAbsenceManagerConnector}
            key="add-unavailability"
            data-testid="add-unavailability"
            onClick={openUnavailabilityModal}
        >
            {t("unavailability.addAbsence")}
        </Button>
    );

    const connectedManager = useSelector(getConnectedManager);

    return (
        <>
            <Box>
                <Flex justifyContent="space-between" alignItems="baseline" flexWrap="wrap">
                    <Flex alignItems="baseline">
                        <Text variant="title">{trucker.display_name}</Text>
                        {trucker.is_disabled && (
                            <Badge
                                data-testid="invoice-detail-header-status"
                                mx={2}
                                variant="error"
                            >
                                {t("common.disabled")}
                            </Badge>
                        )}
                    </Flex>

                    <Flex alignItems="baseline">
                        <Text>
                            {t("settings.dashdocIdentifier")}
                            {t("common.colon")}
                        </Text>
                        <Text ml={2} fontWeight="bold" variant="h1">
                            {trucker.pk}
                        </Text>
                    </Flex>
                </Flex>

                <Text>
                    {t("common.createdOn")}{" "}
                    {formatDate(parseAndZoneDate(trucker.user.date_joined, timezone), "P")}
                </Text>

                <Flex alignItems="baseline">
                    <Text mr={2}>
                        {t("settings.inviteCode")}
                        {t("common.colon")}
                    </Text>
                    <TruckerInviteCode
                        truckerPk={trucker.pk}
                        textProps={{color: theme.colors.grey.ultradark, variant: "h1"}}
                    />
                </Flex>
            </Box>
            <Flex justifyContent="space-between" my={5}>
                <Flex alignItems="center" alignSelf="flex-end" marginLeft="auto" flexWrap="wrap">
                    {managerService.hasAtLeastUserRole(connectedManager) && (
                        <>
                            <Popover key={key}>
                                <Popover.Trigger>
                                    <Button variant="secondary">
                                        {t("common.moreActions")}
                                        <Icon name="arrowDown" ml={2} />
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Content>
                                    <DisableTruckerButton
                                        trucker={trucker}
                                        onClick={clearPopoverState}
                                    />
                                    <EnableTruckerButton
                                        trucker={trucker}
                                        onClick={clearPopoverState}
                                    />
                                    <DeleteTruckerButton
                                        trucker={trucker}
                                        onTruckerDelete={onTruckerDelete}
                                        onConfirmationClose={clearPopoverState}
                                    />
                                </Popover.Content>
                            </Popover>

                            {!trucker.is_disabled && (
                                <>
                                    <AddAbsenceTruckerButton />
                                    <EditTruckerAction trucker={trucker} ml={2} />
                                </>
                            )}
                        </>
                    )}
                </Flex>
                {isUnavailabilityModalOpen && (
                    <UnavailabilityModal
                        fleetItemPk={trucker.pk}
                        fleetItemName={trucker.display_name}
                        type="trucker"
                        onClose={closeUnavailabilityModal}
                    />
                )}
            </Flex>
        </>
    );
}

function TruckerDetailsGeneralInformation({trucker}: {trucker: Trucker}) {
    const remoteIdFormattedLabel = `(${t("components.remoteId")})`;

    return (
        <TruckerDetailsPanel>
            <Text variant="h1" mb={3}>
                {t("common.informations")}
            </Text>
            <Flex justifyContent="space-between">
                <Box flexBasis={"50%"} mr={5}>
                    <Text fontWeight="bold" mb={2}>
                        {t("common.general")}
                    </Text>
                    <Text>{trucker.user.first_name}</Text>
                    <Text>{trucker.user.last_name}</Text>
                    {!!trucker.remote_id && (
                        <Text>
                            {trucker.remote_id} {remoteIdFormattedLabel}
                        </Text>
                    )}
                    <TruckerDetailsMedicalCheckup trucker={trucker} />
                    <TruckerDetailsSpecificities trucker={trucker} />
                </Box>
                <Box flexBasis={"50%"} ml={5}>
                    <TruckerDetailsContact trucker={trucker} />
                </Box>
            </Flex>
            <TruckerDetailsMobileApp trucker={trucker} />
        </TruckerDetailsPanel>
    );
}

function TruckerDetailsMedicalCheckup({trucker}: {trucker: Trucker}) {
    const showSection = !!trucker.occupational_health_visit_deadline;
    if (!showSection) {
        return null;
    }

    return (
        <>
            <Text fontWeight="bold" mt={3} mb={2}>
                {t("fleet.common.medicalVisitSection")}
            </Text>
            {/*
// @ts-ignore */}
            <Text>{getDeadlineValueAndIcon(trucker.occupational_health_visit_deadline)}</Text>
        </>
    );
}

function TruckerDetailsSpecificities({trucker}: {trucker: Trucker}) {
    const showSection = trucker.is_rented || trucker.is_dedicated;
    if (!showSection) {
        return null;
    }

    return (
        <>
            <Text fontWeight="bold" mt={3} mb={2}>
                {t("common.specificities")}
            </Text>

            {trucker.is_rented && (
                <Badge variant="neutral" style={{display: "inline-block"}}>
                    {t("fleet.rentalDriver") +
                        " " +
                        t("fleet.rentalDriverFor", {
                            company_name: trucker.carrier.name,
                        })}
                </Badge>
            )}

            {trucker.is_dedicated && (
                <Badge
                    variant="neutral"
                    style={{display: "inline-block"}}
                    data-testid="dedicated-badge"
                >
                    {t("fleet.dedicatedDriver") +
                        " " +
                        t("fleet.dedicatedDriverFor", {
                            company_name: trucker.carrier.name,
                        })}
                </Badge>
            )}
        </>
    );
}

function TruckerDetailsContact({trucker}: {trucker: Trucker}) {
    const showSection =
        !!trucker.phone_number ||
        !!trucker.phone_number_personal ||
        !!trucker.user.email ||
        !!trucker.address ||
        !!trucker.postcode ||
        !!trucker.city ||
        !!trucker.country_code;
    if (!showSection) {
        return null;
    }

    return (
        <>
            <Text fontWeight="bold" mb={2}>
                {t("common.contactSection")}
            </Text>
            <Text>{trucker.phone_number}</Text>
            <Text>
                {trucker.phone_number_personal} {t("common.personalPhoneNumberLabel")}
            </Text>
            <Text>{trucker.user.email}</Text>
            <Text>
                {getReadableAddress({
                    address: trucker.address,
                    postcode: trucker.postcode,
                    city: trucker.city,
                    country: trucker.country_code,
                })}
            </Text>
        </>
    );
}

function TruckerDetailsMobileApp({trucker}: {trucker: Trucker}) {
    const timezone = useTimezone();

    const showSection = !!trucker.user.last_login || !!trucker.readable_app_version;
    if (!showSection) {
        return null;
    }

    const lastLoginFormattedLabel = `${t("truckersList.lastLogin")}${t("common.colon")}`;
    const appVersionFormattedLabel = `${t("components.appVersion")}${t("common.colon")}`;

    return (
        <>
            <HorizontalLine my={4} />
            <Text variant="h1" mb={3}>
                {t("common.mobileApp")}
            </Text>
            <Flex justifyContent="space-between">
                <Text flexBasis={"50%"}>
                    {lastLoginFormattedLabel}
                    {formatDate(parseAndZoneDate(trucker.user.last_login, timezone), "P")}
                </Text>
                <Flex flexBasis={"50%"} justifyContent="end" style={{gap: "8px"}}>
                    {appVersionFormattedLabel}
                    {trucker.readable_app_version}{" "}
                    {trucker.new_app_update_available && (
                        <TooltipWrapper content={t("settings.outdated")} placement="top">
                            <Icon name="warning" />
                        </TooltipWrapper>
                    )}
                </Flex>
            </Flex>
        </>
    );
}

function TruckerDetailsTag({trucker}: {trucker: Trucker}) {
    const dispatch = useDispatch();
    const connectedManager = useSelector(getConnectedManager);

    const truckerData = {
        ...omit(trucker, "unavailability", "events", "carrier"),
        carrier: trucker.carrier.pk,
    };

    const handleOnDeleteTag = (tag: Tag) => {
        dispatch(
            fetchUpdateTrucker(trucker.pk, {
                ...truckerData,
                tags: trucker.tags?.filter((t: Tag) => t.pk !== tag.pk),
            })
        );
    };

    const handleOnAddTag = (tag: Tag) => {
        dispatch(
            fetchUpdateTrucker(trucker.pk, {
                ...truckerData,
                tags: [...(trucker.tags ?? []), tag],
            })
        );
    };
    const canUpdateTags =
        trucker.is_disabled == false && managerService.hasAtLeastUserRole(connectedManager);
    return (
        <TruckerDetailsPanel>
            <Text variant="h1" mb={3}>
                {t("common.tags")}
            </Text>
            <Flex flexWrap="wrap">
                <TagSection
                    // @ts-ignore
                    tags={trucker.tags}
                    onAdd={handleOnAddTag}
                    onDelete={handleOnDeleteTag}
                    canUpdateTags={canUpdateTags}
                />
            </Flex>
        </TruckerDetailsPanel>
    );
}

type TruckerDetailsActivityColumn = "type" | "date" | "location" | "details" | "transport";

const truckerActivitiesColumns: {getLabel: () => string; name: TruckerDetailsActivityColumn}[] = [
    {getLabel: () => t("common.date"), name: "date"},
    {getLabel: () => t("common.activities"), name: "type"},
    {getLabel: () => t("common.location"), name: "location"},
    {getLabel: () => t("components.details"), name: "details"},
    {getLabel: () => t("common.transport"), name: "transport"},
];

function TruckerDetailsActivities({trucker}: {trucker: Trucker}) {
    const timezone = useTimezone();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [transports, setTransports] = useState<TransportListWeb[]>([]);
    const [isActivitiesLoading, loadActivities, unloadActivities] = useToggle();

    const fetchActivities = useCallback(async () => {
        loadActivities();
        const response: APIListResponse<TransportListWeb> = await apiService.post(
            "/transports/list/",
            {
                // The API expects comma separated strings and not list for `_in` filters
                filters: {trucker__in: [trucker.pk].join(",")},
            },
            {
                apiVersion: "web",
            }
        );
        const {results: transports} = response;
        setTransports(transports);

        let activities: Activity[] = [];

        transports.forEach((transport) => {
            // TODO: compatibility with TransportListWeb
            const currentTransportActivities = activityService.getTransportActivities(
                transport as any
            ) as Activity[];
            activities.push(
                ...currentTransportActivities.filter(
                    (activity) =>
                        activity.segment?.trucker?.pk === trucker.pk && !!activity.site.real_end
                )
            );
        });
        activities = activities.sort((a, b) =>
            // @ts-ignore
            isBefore(new Date(a.site.real_end), new Date(b.site.real_end)) ? 1 : -1
        );
        unloadActivities();
        setActivities(activities);
    }, [loadActivities, trucker.pk, unloadActivities]);

    useEffect(() => {
        fetchActivities();
    }, [trucker.pk, fetchActivities]);

    const getRowCellContent = useCallback(
        (activity: Activity, columnName: TruckerDetailsActivityColumn) => {
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
        [transports, timezone]
    );

    return (
        <TruckerDetailsPanel>
            <Text mb={3} variant="h1">
                {t("common.activities")}
            </Text>
            <Table
                columns={truckerActivitiesColumns}
                rows={activities}
                getRowCellContent={getRowCellContent}
                isLoading={isActivitiesLoading}
                maxHeight={"300px"}
            />
        </TruckerDetailsPanel>
    );
}

function TruckerDetailsEvents({trucker}: {trucker: Trucker}) {
    return (
        <TruckerDetailsPanel>
            <Text variant="h1" mb={3}>
                {t("components.events")}
            </Text>
            <FleetEvents events={trucker.events} />
        </TruckerDetailsPanel>
    );
}

type TruckerDetailsDocumentsColumn = "name" | "created" | "author" | "actions";

const truckerDocumentsColumns: {
    width: string;
    getLabel: () => string;
    name: TruckerDetailsDocumentsColumn;
}[] = [
    {width: "auto", getLabel: () => t("common.name"), name: "name"},
    {width: "auto", getLabel: () => t("components.uploadDate"), name: "created"},
    {width: "auto", getLabel: () => t("common.author"), name: "author"},
    {width: "40px", getLabel: () => "", name: "actions"},
];
function TruckerDetailsDocuments({trucker}: {trucker: Trucker}) {
    // @ts-ignore
    const [selectedFile, setSelectedFile] = useState<File>(null);
    const [documents, setDocuments] = useState<TruckerDocument[]>([]);
    const [isTableLoading, setTableLoading, setTableNotLoading] = useToggle();
    // @ts-ignore
    const [previewedDocument, setPreviewedDocument] = useState<TruckerDocument>(null);
    const timezone = useTimezone();
    const connectedManager = useSelector(getConnectedManager);
    const isReadOnly = trucker.is_disabled || !managerService.hasAtLeastUserRole(connectedManager);

    const fetchDocuments = useCallback(async () => {
        setTableLoading();
        try {
            const {results} = await apiService.TruckerDocuments.getAll({
                query: {trucker__in: trucker.pk},
            });
            setDocuments(results);
        } catch (error) {
            toast.error(t("common.error"));
        }
        setTableNotLoading();
    }, [setTableLoading, setTableNotLoading, trucker.pk]);

    useEffect(() => {
        fetchDocuments();
    }, [trucker.pk, fetchDocuments]);

    const handleDeleteDocumentClick = useCallback(
        async (document: TruckerDocument) => {
            setTableLoading();
            try {
                await apiService.TruckerDocuments.delete(document.uid);
                toast.success(t("components.documentSuccessfullyDeleted"));
            } catch (error) {
                toast.error(t("common.error"));
            }
            fetchDocuments();
        },
        [fetchDocuments, setTableLoading]
    );

    const uploadFile = useCallback(
        async (file: File) => {
            setSelectedFile(file);
            try {
                await apiService.TruckerDocuments.post({
                    data: populateFormData({trucker: trucker.pk, file, name: file.name}) as any,
                });
                toast.success(t("components.documentSuccessfullyAdded"));
            } catch (error) {
                toast.error(t("common.error"));
            }
            fetchDocuments();
            // @ts-ignore
            setSelectedFile(null);
        },
        [fetchDocuments, trucker.pk]
    );

    const getRowCellContent = useCallback(
        (document: TruckerDocument, columnName: TruckerDetailsDocumentsColumn) => {
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
                    return !isReadOnly ? (
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
                    ) : null;
                default:
                    return "";
            }
        },
        [timezone]
    );

    return (
        <TruckerDetailsPanel>
            <Text variant="h1" mb={3}>
                {t("components.documentsPhotos")}
            </Text>
            {!isReadOnly && (
                <DocumentDropzone
                    file={selectedFile}
                    onAcceptedFile={uploadFile}
                    onRemoveFile={setSelectedFile.bind(undefined, null)}
                    loading={!!selectedFile}
                    nameMaxLength={100}
                />
            )}

            <Table
                columns={truckerDocumentsColumns}
                rows={documents}
                getRowCellContent={getRowCellContent}
                isLoading={isTableLoading}
                maxHeight={"300px"}
            />

            {previewedDocument && (
                <DocumentModal
                    documents={[{label: t("common.document"), url: previewedDocument.file}]}
                    onClose={setPreviewedDocument.bind(undefined, null)}
                />
            )}
        </TruckerDetailsPanel>
    );
}

type TruckerDetailsProps = {
    trucker: Trucker;
    onTruckerDelete?: () => void;
};

export function TruckerDetails({trucker, onTruckerDelete}: TruckerDetailsProps) {
    return (
        <Box>
            <TruckerDetailsHeader trucker={trucker} onTruckerDelete={onTruckerDelete} />
            <TruckerDetailsGeneralInformation trucker={trucker} />
            <TruckerDetailsTag trucker={trucker} />
            <TruckerMeansCombination trucker={trucker} />
            <TruckerDriverLicense trucker={trucker} />
            <TruckerCardsCertificates trucker={trucker} />
            <TruckerDetailsActivities trucker={trucker} />
            <UnavailabilityListDetails fleetItem={trucker} type="trucker" />
            <Flex flexWrap="wrap" pb={3} ml={-3}>
                <Box flex="1 1 500px" ml={3}>
                    <TruckerDetailsDocuments trucker={trucker} />
                </Box>
                <Box flex="1 1 500px" ml={3}>
                    <TruckerDetailsEvents trucker={trucker} />
                </Box>
            </Flex>
        </Box>
    );
}
