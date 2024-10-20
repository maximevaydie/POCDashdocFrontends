import {getConnectedManager, managerService, useTimezone} from "@dashdoc/web-common";
import {TranslationKeys, t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, ListEmptyComponent, NoWrap, Table, Text} from "@dashdoc/web-ui";
import {
    Trailer,
    Trucker,
    Vehicle,
    Unavailability,
    formatDate,
    parseAndZoneDate,
} from "dashdoc-utils";
import orderBy from "lodash.orderby";
import React, {useCallback, useMemo, useState} from "react";

import {getFleetUnavailabilityFunctionsByType} from "app/features/fleet/unavailabilities/unavailability.service";
import {useDispatch, useSelector} from "app/redux/hooks";
import {loadRequestAbsenceManagerConnector} from "app/redux/reducers/connectors";
import {getAbsencePlannerConnector, getMiddayTimeFormatted} from "app/redux/selectors/connector";

import UnavailabilityModal from "./UnavailabilityModal";

type TruckerDetailsUnavailabilityColumn = "type" | "startDate" | "endDate" | "note" | "delete";

const UnavailabilityColumns: {
    name: TruckerDetailsUnavailabilityColumn;
    getLabel: () => string;
    width?: string;
}[] = [
    {getLabel: () => t("common.type"), name: "type", width: "20%"},
    {getLabel: () => t("components.beginDate"), name: "startDate"},
    {getLabel: () => t("components.endDate"), name: "endDate"},
    {getLabel: () => t("common.comments"), name: "note", width: "30%"},
    {getLabel: () => "", name: "delete", width: "2.8em"},
];

export function UnavailabilityListDetails({
    fleetItem,
    type,
}: {
    fleetItem: Trucker | Vehicle | Trailer;
    type: "trucker" | "trailer" | "vehicle";
}) {
    const rows = useMemo(
        () => orderBy(fleetItem.unavailability, ["start_date"], ["desc"]),
        [fleetItem.unavailability]
    );
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const connectedManager = useSelector(getConnectedManager);
    dispatch(loadRequestAbsenceManagerConnector());
    const middayTime = useSelector(getMiddayTimeFormatted);
    const hasAbsencePlannerConnector = useSelector(getAbsencePlannerConnector);
    const handleDeleteUnavailability = useCallback(
        async (fleetItemPk: number, unavailability: Unavailability) => {
            const {deleteUnavailability, retrieveFleetItem} =
                getFleetUnavailabilityFunctionsByType(type);
            await dispatch(deleteUnavailability(fleetItemPk, unavailability.id as number));
            dispatch(retrieveFleetItem(fleetItemPk));
        },
        [dispatch, type]
    );

    const getRowCellContent = useCallback(
        (unavailability: Unavailability, columnName: TruckerDetailsUnavailabilityColumn) => {
            const startAfternoon =
                formatDate(parseAndZoneDate(unavailability?.start_date, timezone), "HH:mm") ===
                middayTime;
            const endMorning =
                formatDate(parseAndZoneDate(unavailability?.end_date, timezone), "HH:mm") ===
                middayTime;
            switch (columnName) {
                case "type":
                    return (
                        <NoWrap>
                            {
                                // nosemgrep no_string_interpolation_in_translate
                                t(
                                    `unavailability.${unavailability.unavailability_type}` as TranslationKeys
                                )
                            }
                        </NoWrap>
                    );
                case "startDate":
                    return (
                        <>
                            <NoWrap>
                                {formatDate(
                                    parseAndZoneDate(unavailability.start_date, timezone),
                                    "P"
                                )}
                            </NoWrap>
                            {startAfternoon && (
                                <Text variant="subcaption" lineHeight={0}>
                                    {t("unavailability.afternoon")}
                                </Text>
                            )}
                        </>
                    );
                case "endDate":
                    return (
                        <>
                            <NoWrap>
                                {formatDate(
                                    parseAndZoneDate(unavailability.end_date, timezone),
                                    "P"
                                )}
                            </NoWrap>
                            {endMorning && (
                                <Text variant="subcaption" lineHeight={0}>
                                    {t("unavailability.morning")}
                                </Text>
                            )}
                        </>
                    );
                case "note":
                    return <NoWrap>{unavailability.unavailability_note}</NoWrap>;
                case "delete":
                    return (
                        <Flex justifyContent="flex-end" fontSize={2}>
                            {managerService.hasAtLeastUserRole(connectedManager) && (
                                <IconButton
                                    name="delete"
                                    withConfirmation
                                    confirmationMessage={
                                        type === "trucker"
                                            ? t("unavailability.confirmDeleteAbsence")
                                            : t("unavailability.confirmDeleteUnavailability")
                                    }
                                    modalProps={{
                                        title:
                                            type === "trucker"
                                                ? t("unavailability.deleteAbsence")
                                                : t("unavailability.deleteUnavailability"),
                                        mainButton: {
                                            children: t("common.delete"),
                                            "data-testid": "confirm-delete-unavailability",
                                        },
                                    }}
                                    data-testid="unavailability-delete-button"
                                    onClick={() =>
                                        handleDeleteUnavailability(fleetItem.pk, unavailability)
                                    }
                                    disabled={hasAbsencePlannerConnector}
                                />
                            )}
                        </Flex>
                    );
                default:
                    return null;
            }
        },
        [
            timezone,
            middayTime,
            type,
            hasAbsencePlannerConnector,
            handleDeleteUnavailability,
            fleetItem.pk,
        ]
    );

    const [editingUnavailability, setEditingUnavailability] = useState<Unavailability>();

    return (
        <Box mt={3} p={3} backgroundColor="grey.white" borderRadius={2}>
            <Text variant="h1" mb={2}>
                {type === "trucker" ? t("components.absences") : t("components.unavailabilities")}
            </Text>
            <Table
                fontSize={1}
                columns={UnavailabilityColumns}
                rows={rows}
                getRowCellContent={getRowCellContent}
                // @ts-ignore
                onClickOnRow={setEditingUnavailability}
                getRowCellIsClickable={(_, columnName) => columnName !== "delete"}
                getRowTestId={() => "unavailability-row"}
                ListEmptyComponent={() => (
                    <ListEmptyComponent
                        emptyLabel={
                            type === "trucker"
                                ? t("unavailability.noAbsence")
                                : t("unavailability.noUnavailability")
                        }
                    />
                )}
                maxHeight="300px"
            />
            {editingUnavailability && !hasAbsencePlannerConnector && (
                <UnavailabilityModal
                    fleetItemPk={fleetItem.pk}
                    fleetItemName={
                        type === "trucker"
                            ? (fleetItem as Trucker).display_name
                            : (fleetItem as Vehicle | Trailer).license_plate
                    }
                    type={type}
                    unavailability={editingUnavailability}
                    onClose={setEditingUnavailability.bind(undefined, undefined)}
                />
            )}
        </Box>
    );
}
