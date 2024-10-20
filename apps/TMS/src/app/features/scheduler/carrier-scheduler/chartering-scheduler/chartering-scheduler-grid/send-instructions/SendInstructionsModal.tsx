import {useDispatch, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, buttonVariants, Flex, Modal, Text, toast} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {formatISO} from "date-fns";
import React, {useEffect, useState} from "react";

import {RawCarrierCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {fetchConfirmTransportDraftAssigned} from "app/redux/actions";

import {SegmentSummary} from "./SegmentSummary";

type SendInstructionButtonProps = {
    uids: string[];
    label: string;
    variant: keyof typeof buttonVariants;
    onInstructionsSent: (string: string) => void;
    successToasterDatas: {transport_pk: number}[];
};

export function SendInstructionButton({
    uids,
    label,
    variant,
    onInstructionsSent,
    successToasterDatas = [],
}: SendInstructionButtonProps) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    return (
        <Button
            variant={variant}
            data-testid="send-instructions-button"
            loading={isLoading}
            disabled={isDisabled || !uids || uids.length === 0}
            onClick={handleSendToCarrier}
        >
            {label}
        </Button>
    );

    async function handleSendToCarrier() {
        const filter = {uid__in: uids.join(",")};
        setIsLoading(true);

        try {
            await dispatch(fetchConfirmTransportDraftAssigned(filter));
        } finally {
            setIsLoading(false);
        }

        setIsDisabled(true);
        for (let data of successToasterDatas) {
            const message = t("scheduler.toasterMissionSentToCarrier", {
                transport: data.transport_pk,
            });
            toast.success(message);
        }

        onInstructionsSent(filter.uid__in);
    }
}

function SendInstructionLine({
    segment,
    onInstructionsSent,
}: {
    segment: RawCarrierCharteringSchedulerSegment;
    onInstructionsSent: (string: string) => void;
}) {
    const timezone = useTimezone();
    return (
        <Flex alignItems="center">
            <Text fontWeight="bold" flex="2">
                {formatDate(
                    parseAndZoneDate(segment.scheduler_datetime_range.start, timezone),
                    "HH:mm",
                    {
                        nilOutput: "--:--",
                        failOutput: "--:--",
                    }
                )}
            </Text>

            <Text flex="3">
                {t("transportDetails.transportNumber", {
                    number: segment.transport.sequential_id,
                })}{" "}
            </Text>
            <Box flex="4">
                <SegmentSummary segment={segment} />
            </Box>
            <Flex flex="2">
                <SendInstructionButton
                    onInstructionsSent={onInstructionsSent}
                    uids={[segment.uid]}
                    label={t("common.send")}
                    variant="plain"
                    successToasterDatas={[
                        {
                            transport_pk: segment.transport.sequential_id,
                        },
                    ]}
                />
            </Flex>
        </Flex>
    );
}

export default function SendInstructionModal({
    day,
    onClose,
    notSentSegments,
    onInstructionsSent,
    loadAllRows,
    isLoadingRows,
    isLoadingSegments,
}: {
    day: Date;
    onClose: () => void;
    onInstructionsSent: (string: string) => void;
    notSentSegments: RawCarrierCharteringSchedulerSegment[];
    loadAllRows: () => void;
    isLoadingRows: boolean;
    isLoadingSegments: boolean;
}) {
    const segmentToSent = notSentSegments.filter(
        (s) => s.status === "planned_but_not_sent" || s.status === "draft_assigned_to_charter"
    );

    const dayStringForId = formatISO(day, {representation: "date"});

    useEffect(() => {
        loadAllRows();
    }, []);

    return (
        <Modal
            title={t("scheduler.instructions.modalTitle", {
                smart_count: isLoadingSegments || isLoadingRows ? "" : notSentSegments.length,
                day: formatDate(day, "P-"),
            })}
            id={`send-instruction-${dayStringForId}`}
            onClose={onClose}
            size="large"
            mainButton={{
                variant: "none",
                children: (
                    <SendInstructionButton
                        label={t("scheduler.instructions.sendToAll")}
                        // @ts-ignore
                        uids={
                            isLoadingSegments || isLoadingRows
                                ? null
                                : segmentToSent.map((segment) => segment.uid)
                        }
                        variant="primary"
                        onInstructionsSent={onInstructionsSent}
                        successToasterDatas={segmentToSent.map((segment) => {
                            return {
                                transport_pk: segment.transport.sequential_id,
                            };
                        })}
                    />
                ),
            }}
            secondaryButton={null}
        >
            {isLoadingSegments || isLoadingRows ? (
                <LoadingWheel />
            ) : (
                <Box mt={1} fontSize={2} pl={4}>
                    {segmentToSent.map((segment) => {
                        return (
                            <SendInstructionLine
                                key={`instruction-modal-${dayStringForId}-${segment.uid}`}
                                segment={segment}
                                onInstructionsSent={onInstructionsSent}
                            />
                        );
                    })}
                </Box>
            )}
        </Modal>
    );
}
