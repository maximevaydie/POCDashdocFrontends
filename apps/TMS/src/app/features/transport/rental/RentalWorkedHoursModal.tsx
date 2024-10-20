import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Modal, Text} from "@dashdoc/web-ui";
import {parseAndZoneDate} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {DateBlock} from "./rental-worked-hours-components/DateBlock";
import {DurationBlock} from "./rental-worked-hours-components/DurationBlock";
import {AmendByAddingRentalRest} from "./rental-worked-hours-components/RentalAmendRestButtons";
import {RestLine} from "./rental-worked-hours-components/RestLine";

import type {Transport} from "app/types/transport";

type RentalWorkedHoursModalProps = {
    transport: Transport;
    onClose: () => void;
    canAmendRest: boolean;
};

export const RentalWorkedHoursModal: FunctionComponent<RentalWorkedHoursModalProps> = ({
    transport,
    onClose,
    canAmendRest,
}) => {
    const delivery = transport.deliveries[0];
    const timezone = useTimezone();
    const startDate = delivery.origin.real_end
        ? parseAndZoneDate(delivery.origin.real_end, timezone)
        : null;
    const endDate = delivery.destination.real_end
        ? parseAndZoneDate(delivery.destination.real_end, timezone)
        : null;
    const rests = delivery.rental_details?.rests ?? [];
    return (
        <Modal
            title={t("rentalWorkedHours.modalTitle")}
            onClose={onClose}
            id="rental-worked-hours-modal"
            data-testid="rental-worked-hours-modal"
            mainButton={null}
            secondaryButton={null}
            size="large"
        >
            <Flex mb={3} alignItems="center">
                <Flex flex={1}>
                    <DateBlock
                        date={startDate}
                        label={t("activityStatus.startOfRental")}
                        isActivityDone={!!startDate || transport.global_status === "done"}
                        notDoneLabel={t("rental.notStarted")}
                    />
                    <Icon name="arrowRightFull" mx={4} mt="28px" color="grey.default" />
                    <DateBlock
                        date={endDate}
                        label={t("activityStatus.endOfRental")}
                        isActivityDone={!!endDate || transport.global_status === "done"}
                        notDoneLabel={t("rental.notEnded")}
                    />
                </Flex>
                {startDate && endDate && delivery.rental_details?.total_hours && (
                    <Box mt="28px">
                        <DurationBlock
                            duration={parseFloat(delivery.rental_details.total_hours)}
                            data-testid="rental-hours"
                        />
                    </Box>
                )}
                <Flex mr={1} width="62px" />
            </Flex>
            {rests.length > 0 && (
                <>
                    <Text>{t("rental.breaks")}</Text>
                    {rests.map((rest) => (
                        <RestLine
                            key={rest.uid}
                            rest={rest}
                            canAmend={canAmendRest}
                            transportUid={transport.uid}
                            deliveryUid={delivery.uid}
                        />
                    ))}
                </>
            )}

            {canAmendRest && (
                <Box>
                    <AmendByAddingRentalRest
                        deliveryUid={delivery.uid}
                        transportUid={transport.uid}
                        startDate={startDate}
                    />
                </Box>
            )}

            {delivery.rental_details?.worked_hours && (
                <Flex bg="blue.ultralight" py={2} alignItems="center" borderRadius={1} mt={2}>
                    <Text flex={1} fontWeight="600" color="blue.dark" pl={3}>
                        {t("rental.workedHours")}
                    </Text>
                    {startDate && endDate && (
                        <DurationBlock
                            variant="primary"
                            duration={parseFloat(delivery.rental_details.worked_hours)}
                            data-testid="working-hours"
                        />
                    )}
                    <Flex mr={1} width="62px" />
                </Flex>
            )}
        </Modal>
    );
};
