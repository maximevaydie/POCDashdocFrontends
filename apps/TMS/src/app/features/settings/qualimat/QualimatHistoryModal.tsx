import {getConnectedCompany, useFeatureFlag, useTimezone} from "@dashdoc/web-common";
import {Box, Button, Flex, Icon, LoadingWheel, Modal, Table, Text} from "@dashdoc/web-ui";
import {
    Company,
    companyHasIDTFCertification,
    QualimatEvent,
    translate as t,
    useToggle,
} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";
import {Link} from "react-router-dom";

import {QualimatSuggestedCleaning} from "app/features/settings/qualimat/QualimatSuggestedCleaning";
import useSimpleFetch from "app/hooks/useSimpleFetch";
import {fetchAddTrailerQualimatEvent, fetchAddVehicleQualimatEvent} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getEventDetails,
    getEventIconName,
    getEventTime,
    getEventType,
} from "app/services/misc/qualimat.service";

import ExportQualimatHistoryModal from "../export-qualimat-history-modal";

import QualimatAddEvent from "./QualimatAddEvent";

const NoQualimatEventsComponent: FunctionComponent<{}> = () => (
    <Box py={6} data-testid="qualimat-history-table-empty">
        <Text textAlign="center" color="grey.dark">
            {t("qualimatHistory.noEvents")}
        </Text>
    </Box>
);

type QualimatHistoryEventsProps = {
    events: Array<QualimatEvent>;
};

const QualimatHistoryEvents: FunctionComponent<QualimatHistoryEventsProps> = ({events}) => {
    const timezone = useTimezone();
    return (
        <Flex height="24em" flexDirection="column">
            <Table
                height="auto"
                ListEmptyComponent={NoQualimatEventsComponent}
                columns={[
                    {name: "category", label: t("qualimatHistory.category")},
                    {name: "date", label: t("qualimatHistory.date")},
                    {name: "details", label: t("qualimatHistory.details")},
                    {name: "transport", label: t("common.transport")},
                ]}
                rows={events}
                getRowId={(event) => event.uid}
                getRowCellContent={(event, columnName) => {
                    switch (columnName) {
                        case "category":
                            return (
                                <Flex>
                                    <Icon name={getEventIconName(event)} mr={2} />
                                    <Text>{getEventType(event)}</Text>
                                </Flex>
                            );
                        case "date":
                            return <Text>{getEventTime(event, timezone)}</Text>;

                        case "details":
                            return getEventDetails(event);
                        case "transport":
                            return (
                                event.transport_id &&
                                event.transport_uid && (
                                    <Link to={`/app/transports/${event.transport_uid}/`}>
                                        {t("components.transportNumber", {
                                            number: event.transport_id,
                                        })}
                                    </Link>
                                )
                            );
                        default:
                            return null;
                    }
                }}
            />
        </Flex>
    );
};

type QualimatHistoryProps = {
    fleetItemId: number;
    fleetLicensePlate: string;
    fleetUsedForQualimat: boolean;
    onClose: () => void;
    type: "vehicles" | "trailers";
    fromTransportUid?: string;
};

const QualimatHistory: FunctionComponent<QualimatHistoryProps> = ({
    fleetItemId,
    fleetLicensePlate,
    fleetUsedForQualimat,
    type,
    onClose,
    fromTransportUid,
}) => {
    const dispatch = useDispatch();
    const [mode, setMode] = useState<"history" | "add-event">("history");

    const url = `/${type}/${fleetItemId}/qualimat-history/`;
    // not sure how to call the url only when going back to history instead of on every mode change
    const {isLoading, hasError, data} = useSimpleFetch(url, [mode]);

    const [
        isExportQualimatHistoryModalOpen,
        openExportQualimatHistoryModal,
        closeExportQualimatHistoryModal,
    ] = useToggle();

    const connectedCompany = useSelector<Company | null>(getConnectedCompany);

    const hasQualimatSuggestedCleaningEnabled =
        useFeatureFlag("qualimatSuggestedCleaning") &&
        fleetUsedForQualimat &&
        companyHasIDTFCertification(connectedCompany);

    const events = data.results;
    const renderHistory = () => {
        return (
            <>
                <Box>
                    <Flex mb={4} flex={1} justifyContent="flex-end" alignItems="center">
                        <Text mr="auto" fontWeight={600} variant="h1">
                            {type === "vehicles"
                                ? t("qualimat.vehicle_license_plate", {
                                      license_plate: fleetLicensePlate,
                                  })
                                : t("qualimat.trailer_license_plate", {
                                      license_plate: fleetLicensePlate,
                                  })}
                        </Text>
                        <Button onClick={openExportQualimatHistoryModal} variant="secondary">
                            <Icon name="export" mr={2} />
                            {t("common.export")}
                        </Button>

                        <Button
                            ml={2}
                            onClick={() => setMode("add-event")}
                            data-testid="add-qualimat-event"
                        >
                            <Icon name="add" mr={2} />
                            {t("qualimatHistory.addEvent")}
                        </Button>
                    </Flex>
                    <Box>
                        {isLoading && <LoadingWheel />}
                        {hasError && <Text color="red.default">{t("common.error")}</Text>}
                        {events && <QualimatHistoryEvents events={events} />}
                    </Box>
                </Box>

                {hasQualimatSuggestedCleaningEnabled && (
                    <Box mt={6}>
                        <QualimatSuggestedCleaning fleetType={type} fleetItemId={fleetItemId} />
                    </Box>
                )}

                {isExportQualimatHistoryModalOpen && (
                    <ExportQualimatHistoryModal
                        fleetType={type}
                        selectedPlates={[fleetItemId]}
                        allPlatesSelected={false}
                        totalCount={1}
                        onClose={closeExportQualimatHistoryModal}
                    />
                )}
            </>
        );
    };

    const fetchAddQualimatEvent = async (
        type: "vehicles" | "trailers",
        fleetItemId: string,
        event: Partial<QualimatEvent>
    ) => {
        if (type === "vehicles") {
            await dispatch(fetchAddVehicleQualimatEvent(fleetItemId, event));
        } else {
            await dispatch(fetchAddTrailerQualimatEvent(fleetItemId, event));
        }
    };

    return (
        <Modal
            title={
                mode === "history"
                    ? t("qualimatHistory.modalTitle")
                    : t("qualimatAddEvent.modalTitle")
            }
            id="qualimat-history-modal"
            data-testid="qualimat-history-modal"
            onClose={onClose}
            secondaryButton={null}
            mainButton={null}
            size="large"
        >
            <Box>
                {mode === "history" && renderHistory()}
                {mode === "add-event" && (
                    <QualimatAddEvent
                        onCancel={() => setMode("history")}
                        onSave={async (event: Partial<QualimatEvent>) => {
                            await fetchAddQualimatEvent(type, fleetItemId.toString(), event);
                            setMode("history");
                        }}
                        fleetType={type}
                        fleetItemId={fleetItemId}
                        fromTransportUid={fromTransportUid}
                    />
                )}
            </Box>
        </Modal>
    );
};

export default QualimatHistory;
