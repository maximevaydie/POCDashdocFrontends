import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ClickableBox, Flex, Icon, NoWrap, Text, theme} from "@dashdoc/web-ui";
import React, {FunctionComponent, useEffect, useRef} from "react";

import {SendToTruckerButton} from "app/features/trip/trip-edition/trip-means/SendToTruckerButton";

import {type TransportFormMeans} from "../transport-form.types";
import {TEST_ID_PREFIX} from "../TransportForm";

type MeansOverviewProps = {
    means: TransportFormMeans | null;
    isEditing: boolean;
    hideTitle?: boolean;
    openEdition: () => void;
    // TODO: remove all props below when we remove the ff subcontractTrip
    tripUid?: string;
    canSend?: boolean;
    cannotEditMeans?: boolean;
};
export const MeansOverview: FunctionComponent<MeansOverviewProps> = ({
    means,
    isEditing,
    openEdition,
    hideTitle = false,
    tripUid,
    canSend = false,
    cannotEditMeans,
}) => {
    const meansRef = useRef(null);
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    useEffect(() => {
        if (isEditing) {
            // @ts-ignore
            meansRef.current?.scrollIntoView();
        }
    }, [isEditing]);
    const MeansBox = cannotEditMeans ? Box : ClickableBox;

    const meansName = means
        ? hasBetterCompanyRolesEnabled
            ? means.carrier?.carrier?.name
            : means.carrier?.address?.name
        : null;

    return (
        <>
            {!means && isEditing && (
                <>
                    <Text variant="h1" mt={4} mb={3} ref={meansRef}>
                        {t("common.means")}
                    </Text>
                    <Box
                        border="1px solid"
                        borderColor="grey.light"
                        bg="grey.light"
                        height="46px"
                    />
                </>
            )}
            {means && (
                <>
                    {!hideTitle && (
                        <Text variant="h1" mt={4} mb={3}>
                            {t("common.means")}
                        </Text>
                    )}
                    <Flex width="100%">
                        <MeansBox
                            px={4}
                            py={3}
                            border={"1px solid"}
                            borderColor={isEditing ? "grey.default" : "grey.light"}
                            bg={isEditing ? "grey.light" : undefined}
                            onClick={() => openEdition()}
                            flex={1}
                            data-testid={`${TEST_ID_PREFIX}means`}
                        >
                            {meansName && (
                                <Text
                                    variant="caption"
                                    color="grey.dark"
                                    data-testid={`${TEST_ID_PREFIX}means-carrier-address`}
                                >
                                    {meansName}
                                </Text>
                            )}
                            {means.trucker && (
                                <Text
                                    variant="h2"
                                    color="grey.ultradark"
                                    data-testid={`${TEST_ID_PREFIX}means-trucker`}
                                >
                                    {means.trucker.display_name}
                                </Text>
                            )}
                            <Flex style={{gap: theme.space[2]}}>
                                {means.vehicle?.license_plate && (
                                    <NoWrap
                                        display="flex"
                                        fontSize={2}
                                        color="grey.dark"
                                        mt={2}
                                        data-testid={`${TEST_ID_PREFIX}means-vehicle`}
                                    >
                                        <Icon color="grey.dark" name="truck" mr={1} />
                                        {means.vehicle.license_plate}
                                    </NoWrap>
                                )}

                                {means.trailer?.license_plate && (
                                    <NoWrap
                                        display="flex"
                                        fontSize={2}
                                        color="grey.dark"
                                        mt={2}
                                        data-testid={`${TEST_ID_PREFIX}means-trailer`}
                                        alignContent="center"
                                    >
                                        <Icon name="trailer" color="grey.dark" mr={1} />
                                        {means.trailer.license_plate}
                                    </NoWrap>
                                )}
                                {means.requestedVehicle && (
                                    <Text
                                        display="flex"
                                        color="grey.dark"
                                        data-testid={`${TEST_ID_PREFIX}means-vehicle-type`}
                                    >
                                        <Icon name="truck" color="grey.dark" mr={1} />
                                        {means.requestedVehicle.label}
                                    </Text>
                                )}
                            </Flex>
                        </MeansBox>
                        {canSend && tripUid && <SendToTruckerButton tripUid={tripUid} />}
                    </Flex>
                </>
            )}
        </>
    );
};
