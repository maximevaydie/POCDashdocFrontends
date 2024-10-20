import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, LoadingWheel, Modal, ProgressBar, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    nbTotal: number;
    nbCreated: number;
    nbAborted: number;
    onClose: () => void;
};
export function MultiSlotBookingFeedbackModal({onClose, ...props}: Props) {
    if (!("nbTotal" in props)) {
        return (
            <Modal title={t("flow.makeBookings")} mainButton={null} secondaryButton={null}>
                <LoadingWheel />
            </Modal>
        );
    }
    const {nbTotal, nbCreated, nbAborted} = props;
    if (nbTotal > nbCreated + nbAborted) {
        const progress = Math.floor(((nbCreated + nbAborted) / nbTotal) * 100);
        return (
            <Modal title={t("flow.makeBookings")} mainButton={null} secondaryButton={null}>
                <Text mb={4} variant="h1" color="grey.dark">
                    {t("common.processing")}
                </Text>
                <Callout iconDisabled>
                    <LoadingWheel noMargin />
                    <ProgressBar progress={progress} />
                </Callout>
            </Modal>
        );
    }
    return (
        <Modal
            title={t("flow.makeBookings")}
            onClose={onClose}
            mainButton={{
                onClick: onClose,
                children: t("common.understood"),
            }}
            secondaryButton={null}
        >
            <Text mb={4} variant="h1" color="grey.dark">
                {t("common.summary")}
            </Text>
            <FeedbackCallout nbCreated={nbCreated} nbAborted={nbAborted} />
        </Modal>
    );
}

function FeedbackCallout({nbCreated, nbAborted}: {nbCreated: number; nbAborted: number}) {
    return (
        <Callout iconDisabled>
            <Text mb={2} variant="h2">
                {t("common.processing_summary")}
                {t("common.colon")}
            </Text>
            {nbCreated > 0 && (
                <Flex mb={2}>
                    <Icon name="checkCircle" mr={2} color="green.default" />
                    {t("flow.bookings.added", {smart_count: nbCreated})}
                </Flex>
            )}
            {nbAborted > 0 && (
                <Flex>
                    <Box>
                        <Icon name="removeCircle" mr={2} color="red.default" />
                    </Box>
                    {t("common.bookings.aborted", {smart_count: nbAborted})}
                </Flex>
            )}
        </Callout>
    );
}
