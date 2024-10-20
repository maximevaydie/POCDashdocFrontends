import {urlService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Link, LoadingWheel, Text, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {fetchUpdateSite} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

type Props = {
    siteUid: string;
    isBookingNeeded: boolean;
    slug: string;
};
export function ActivityBooking({isBookingNeeded, siteUid, slug}: Props) {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();

    if (isSubmitting) {
        return (
            <Box
                backgroundColor={isBookingNeeded ? "yellow.ultralight" : "grey.ultralight"}
                borderLeftColor={isBookingNeeded ? "yellow.default" : "blue.default"}
                borderLeftWidth={5}
                borderLeftStyle="solid"
                px={4}
                py={4}
                mb={5}
            >
                {isBookingNeeded ? (
                    <Text textAlign="center">
                        {t("common.markAs", {name: t("tmsIntegration.booked")})}
                    </Text>
                ) : (
                    <Text textAlign="center">
                        {t("common.markAs", {name: t("transportForm.bookingNeeded")})}
                    </Text>
                )}
                <Flex alignItems="center" justifyContent="center">
                    <Text textAlign="center" variant="caption">
                        {t("common.processing")}
                    </Text>
                    <Box ml={4} mt="6px">
                        <LoadingWheel noMargin small />
                    </Box>
                </Flex>
            </Box>
        );
    }
    return (
        <Box
            backgroundColor={isBookingNeeded ? "yellow.ultralight" : "grey.ultralight"}
            borderLeftColor={isBookingNeeded ? "yellow.default" : "blue.default"}
            borderLeftWidth={5}
            borderLeftStyle="solid"
            alignItems="center"
            px={4}
            py={4}
            mb={5}
            style={{display: "grid", gridTemplateColumns: "1fr max-content max-content"}}
        >
            {isBookingNeeded ? (
                <>
                    <Text>{t("tmsIntegration.bookingToSchedule")}</Text>
                    <Link data-testid="edit-address-link" onClick={handleSetAsBooked}>
                        <Icon name="check" mr={1} />
                        {t("common.markAs", {name: t("tmsIntegration.booked")})}
                    </Link>
                    <Button variant="primary" ml={4} onClick={handleBookASlot}>
                        {t("tmsIntegration.scheduleABooking")}
                    </Button>
                </>
            ) : (
                <>
                    <Text>{t("tmsIntegration.bookingScheduled")}</Text>
                    <Flex flexDirection="column">
                        <Flex justifyContent="flex-end" alignItems="center">
                            <Text variant="h2" color="grey.darker">
                                {t("tmsIntegration.booked")}
                            </Text>
                            <Icon
                                name="check"
                                color="grey.white"
                                backgroundColor="green.default"
                                fontSize={1}
                                borderRadius={20}
                                p={1}
                                ml={2}
                            />
                        </Flex>
                        <Box mt={2}>
                            <Link data-testid="edit-address-link" onClick={handleSetAsToBook}>
                                <Icon name="undo" mr={1} />
                                {t("common.markAs", {name: t("transportForm.bookingNeeded")})}
                            </Link>
                        </Box>
                    </Flex>
                </>
            )}
        </Box>
    );

    function handleSetAsBooked() {
        setBookingNeeded(false);
    }

    function handleSetAsToBook() {
        setBookingNeeded(true);
    }

    async function setBookingNeeded(is_booking_needed: boolean) {
        if (isSubmitting) {
            return;
        }
        setIsSubmitting();
        try {
            await dispatch(
                fetchUpdateSite(siteUid, {
                    is_booking_needed,
                })
            );
        } catch (e) {
            Logger.error(e);
            toast.error(t("common.error"));
        } finally {
            setIsSubmitted();
        }
    }

    function handleBookASlot() {
        window.open(`${urlService.getFlowSiteUrl(slug)}`, "_blank");
    }
}
