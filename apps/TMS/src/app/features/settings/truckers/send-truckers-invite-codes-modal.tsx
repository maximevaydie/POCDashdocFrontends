import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Modal, ProgressBar, Text} from "@dashdoc/web-ui";
import {usePrevious} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";

import {fetchSendInviteCodes} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getLastInviteCodeEvent, getTruckersCurrentQuery} from "app/redux/selectors";

type InviteCodeStatus = "pending" | "loading" | "done";

type SendTruckersInviteCodeModalProps = {
    selectedTruckers: Record<string, boolean>;
    allTruckersSelected?: boolean;
    allTruckersCount: number;
    onInviteCodesSent: () => void;
    onClose: () => void;
};

const SendTruckersInviteCodeModal: FunctionComponent<SendTruckersInviteCodeModalProps> = ({
    selectedTruckers,
    allTruckersSelected,
    allTruckersCount,
    onInviteCodesSent,
    onClose,
}) => {
    const query = useSelector(getTruckersCurrentQuery);
    const dispatch = useDispatch();
    const lastInviteCodeEvent = useSelector(getLastInviteCodeEvent);
    const previousInviteCodeEvent = usePrevious(lastInviteCodeEvent?.timestamp);

    const [invitedTruckers, setInvitedTruckers] = useState<
        {pk: number; name: string; success?: boolean; error?: boolean}[]
    >([]);
    const [inviteCodeStatus, setInviteCodeStatus] = useState<InviteCodeStatus>("pending");
    const selectedTruckersPkList = useMemo(
        () =>
            Object.entries(selectedTruckers).reduce((acc: string[], [pk, selected]) => {
                if (selected) {
                    acc.push(pk);
                }
                return acc;
            }, []),
        [selectedTruckers]
    );

    const truckersToInviteCount = allTruckersSelected
        ? allTruckersCount
        : selectedTruckersPkList.length;

    const handleSendInviteCodes = useCallback(async () => {
        const filters = allTruckersSelected
            ? query
            : {
                  ...query,
                  id__in: selectedTruckersPkList,
              };
        setInviteCodeStatus("loading");
        dispatch(fetchSendInviteCodes(filters));
    }, [query, selectedTruckersPkList]);

    useEffect(() => {
        if (inviteCodeStatus === "loading") {
            if (lastInviteCodeEvent?.timestamp !== previousInviteCodeEvent) {
                const data = lastInviteCodeEvent?.data;
                if (data?.success) {
                    setInvitedTruckers([
                        ...invitedTruckers,
                        {pk: data?.trucker_pk, name: data?.trucker_name, success: true},
                    ]);
                } else if (data?.error) {
                    setInvitedTruckers([
                        ...invitedTruckers,
                        {pk: data?.trucker_pk, name: data?.trucker_name, error: true},
                    ]);
                }
                if (data?.done) {
                    setInviteCodeStatus("done");
                }
            }
        }
    }, [lastInviteCodeEvent]);

    return (
        <Modal
            title={
                <Flex alignItems="center" p={1}>
                    <Icon textAlign="center" name="textMessage" mr={2} />
                    <Text variant="h1">{t("settings.sendInviteCodeViaSms")}</Text>
                </Flex>
            }
            id="send-trucker-invite-code-modal"
            onClose={onClose}
            mainButton={
                inviteCodeStatus !== "done"
                    ? {
                          loading: inviteCodeStatus === "loading",
                          onClick: handleSendInviteCodes,
                          disabled: inviteCodeStatus !== "pending",
                      }
                    : {
                          onClick: onInviteCodesSent,
                          children: t("common.confirmUnderstanding"),
                      }
            }
            // @ts-ignore
            secondaryButton={inviteCodeStatus === "done" && null}
        >
            {inviteCodeStatus !== "done" && (
                <Box>
                    <Text p={1} mb={2}>
                        {t("settings.inviteCodePhoneNumberNote")}
                    </Text>
                    <Text p={1} textAlign="center">
                        {t("components.selectedTruckersCount", {
                            smart_count: truckersToInviteCount,
                        })}
                    </Text>
                </Box>
            )}
            <Flex flexDirection="column" width="100%">
                <Box>
                    {inviteCodeStatus !== "pending" && (
                        <>
                            {inviteCodeStatus === "done" ? (
                                <Flex
                                    justifyContent="center"
                                    alignItems="center"
                                    fontSize={4}
                                    mb={2}
                                >
                                    <Icon color={"green.default"} name="checkCircle" mr={2} />
                                    {t("components.done")}
                                </Flex>
                            ) : (
                                <ProgressBar
                                    progress={Math.floor(
                                        (invitedTruckers.length / truckersToInviteCount) * 100
                                    )}
                                />
                            )}
                            <Flex
                                flexDirection="column"
                                my={3}
                                flexBasis={invitedTruckers.length.toString() + "em"}
                                maxHeight="20em"
                                overflowY="auto"
                            >
                                {invitedTruckers.map((trucker, index) => (
                                    <Flex justifyContent="space-between" key={index} mx={5}>
                                        <Text>{trucker.name}</Text>
                                        {trucker.success && (
                                            <Flex alignItems="center">
                                                <Icon name="checkCircle" color="green.default" />
                                                <Text ml={1} variant="caption">
                                                    {t("settings.oneSMSSent")}
                                                </Text>
                                            </Flex>
                                        )}
                                        {trucker.error && (
                                            <Flex alignItems="center">
                                                <Icon name="warning" color="red.default" />
                                                <Text ml={1} variant="caption">
                                                    {t("settings.SMSNotSent")}
                                                </Text>
                                            </Flex>
                                        )}
                                    </Flex>
                                ))}
                            </Flex>
                        </>
                    )}
                </Box>
            </Flex>
        </Modal>
    );
};

export default SendTruckersInviteCodeModal;
