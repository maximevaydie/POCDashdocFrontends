import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Link, LoadingWheel, Select, SelectOption, Text} from "@dashdoc/web-ui";
import {TransportStatusCategory, useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo} from "react";

import {SimplifiedTransportStatus} from "app/types/constants";

import {UserPersona, SimpleTransportStatus} from "./transport";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    statusLoading: boolean;
    persona: UserPersona;
    qualimatPreventStatusUpdate: boolean;
    onStatusChange: ((status: SimpleTransportStatus) => void) | null;
};

export function TransportInformations({
    transport,
    statusLoading,
    persona,
    qualimatPreventStatusUpdate,
    onStatusChange,
}: Props) {
    const [isEditMode, showStatusSelect, hideStatusSelect] = useToggle(false);

    const simplifiedTransportStatus = useMemo(() => {
        switch (transport.status as TransportStatusCategory) {
            case "created":
            case "updated":
            case "confirmed":
            case "assigned":
            case "acknowledged":
            case "on_the_way":
            case "rounds_started":
            case "round_added":
            case "round_added_v2":
            case "round_edited":
            case "round_deleted":
            case "truck_wash":
            case "checklist_filled":
            case "on_loading_site":
            case "loading_complete":
            case "bulking_break_started":
            case "bulking_break_complete":
            case "on_unloading_site":
            case "unloading_complete":
            case "restored":
            case "break_time":
            case "handling_started":
                return SimplifiedTransportStatus.ONGOING;
            case "done":
            case "invoiced":
            case "paid":
            case "rounds_complete":
            case "verified":
                return SimplifiedTransportStatus.DONE;
            case "declined":
            case "deleted":
            case "cancelled":
                return SimplifiedTransportStatus.CANCELLED;
            default:
                return SimplifiedTransportStatus.UNKNOWN;
        }
    }, [transport.status]);

    const getSimplifiedTransportStatusText = useCallback(
        (simplifiedStatus: SimplifiedTransportStatus) => {
            switch (simplifiedStatus) {
                case SimplifiedTransportStatus.ONGOING:
                    return t("components.ongoing");
                case SimplifiedTransportStatus.DONE:
                    return t("components.done");
                case SimplifiedTransportStatus.CANCELLED:
                    return t("components.cancelled");
                case SimplifiedTransportStatus.UNKNOWN:
                default:
                    return t("common.unknown");
            }
        },
        []
    );

    const getTransportStatusesOptions = useCallback((): SelectOption<SimpleTransportStatus>[] => {
        return [
            {value: "done", label: "Terminé"},
            {value: "cancelled", label: "Annulé"},
        ];
    }, []);

    useEffect(() => {
        hideStatusSelect();
    }, [transport]);

    const onOpenTransportClick = () => {
        window.open(`${window.location.origin}/app/transports/${transport.uid}/`);
    };

    const canStatusBeUpdated = () => {
        const isStatusUpdatable = ![
            "done",
            "invoiced",
            "paid",
            "rounds_complete",
            "declined",
            "deleted",
            "cancelled",
        ].includes(transport.status);
        if (qualimatPreventStatusUpdate || !isStatusUpdatable) {
            return false;
        }
        return true;
    };

    return (
        <Box mb={5}>
            <Text variant="title">{t("common.informations")}</Text>
            <Link
                data-testid="late-transport-go-to-transport-details-button"
                onClick={onOpenTransportClick}
                mb={2}
                display={"inline-block"}
            >
                {t("updateLateTransports.goToTransportDetails")}
            </Link>

            <Flex flexDirection="column">
                <Flex flexWrap="wrap">
                    <Flex minWidth="200px">
                        <Text color="grey.dark">{t("common.shipper")}</Text>
                    </Flex>
                    <Flex minWidth="200px">
                        <Text data-testid="late-transport-shipper">{transport.shipper.name}</Text>
                    </Flex>
                </Flex>
                <Flex flexWrap="wrap">
                    <Flex minWidth="200px">
                        <Text color="grey.dark">{t("transportsForm.shipperReference")}</Text>
                    </Flex>
                    <Flex minWidth="200px">
                        <Text data-testid="late-transport-shipper-reference">
                            {transport.deliveries[0]?.shipper_reference || "-"}
                        </Text>
                    </Flex>
                </Flex>
                <Flex flexWrap="wrap">
                    <Flex minWidth="200px">
                        <Text color="grey.dark">{t("updateLateTransports.transportNumber")}</Text>
                    </Flex>
                    <Flex minWidth="200px">
                        <Text data-testid="late-transport-sequential-id">
                            {transport.sequential_id}
                        </Text>
                    </Flex>
                </Flex>
                <Flex alignItems="center" flexWrap="wrap">
                    <Flex minWidth="200px">
                        <Text color="grey.dark">{t("common.status")}</Text>
                    </Flex>
                    <Flex minWidth="200px">
                        <Text data-testid="late-transport-status">
                            {getSimplifiedTransportStatusText(simplifiedTransportStatus)}
                        </Text>
                    </Flex>
                    {canStatusBeUpdated() &&
                        (statusLoading ? (
                            <LoadingWheel inline small />
                        ) : !isEditMode ? (
                            !!onStatusChange && (
                                <Button
                                    data-testid="late-transport-update-status-button"
                                    variant={
                                        persona === UserPersona.REMINDER_STATUS
                                            ? "primary"
                                            : "plain"
                                    }
                                    ml={3}
                                    p={0}
                                    onClick={showStatusSelect}
                                >
                                    {t("common.update")}
                                </Button>
                            )
                        ) : (
                            <Box width="150px" ml={3}>
                                <Select
                                    data-testid="late-transport-update-status-select"
                                    options={getTransportStatusesOptions()}
                                    onChange={(option: SelectOption<SimpleTransportStatus>) => {
                                        // @ts-ignore
                                        onStatusChange(option.value);
                                        hideStatusSelect();
                                    }}
                                />
                            </Box>
                        ))}
                </Flex>
            </Flex>
        </Box>
    );
}
