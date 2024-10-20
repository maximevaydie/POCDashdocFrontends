import {apiService} from "@dashdoc/web-common";
import {getConnectedCompany} from "@dashdoc/web-common";
import {getConnectedManager} from "@dashdoc/web-common";
import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {managerService} from "@dashdoc/web-common";
import {Logger, BuildConstants} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Text, toast} from "@dashdoc/web-ui";
import React, {ComponentProps, useCallback} from "react";

import {fetchTruckerGenerateInviteCode} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

export function TruckerInviteCode({
    truckerPk,
    textProps,
}: {
    truckerPk: number;
    textProps?: ComponentProps<typeof Text>;
}) {
    const connectedCompany = useSelector(getConnectedCompany);
    const connectedManager = useSelector(getConnectedManager);
    const isReadOnly = !managerService.hasAtLeastUserRole(connectedManager);
    const trucker = useSelector((state) => {
        return state.entities.truckers?.[truckerPk];
    });
    const dispatch = useDispatch();

    const sendInviteCodeBySMS = async (truckerPk: number) => {
        try {
            await apiService.Truckers.sendInviteCodeBySMS(truckerPk, undefined, {
                apiVersion: "web",
            });
            toast.success(t("settings.inviteCodeSentBySMS"));
        } catch (response) {
            const errorMessage = await getErrorMessagesFromServerError(response);
            Logger.error(errorMessage);
            if (errorMessage.error == "fail to send") {
                toast.error(t("settings.errorFailToSendInviteCodeBySMS"));
            } else {
                toast.error(t("settings.errorFailToSendInviteCodeBySMS"));
            }
        }
    };

    const fetchGenerateInviteCode = useCallback(
        async (truckerPk: number) => await dispatch(fetchTruckerGenerateInviteCode(truckerPk)),
        [dispatch]
    );

    const handleInviteCodeClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fetchGenerateInviteCode(trucker.pk);
    }, []);

    const handleSendInviteCodeBySMS = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            sendInviteCodeBySMS(trucker.pk);
        },
        [trucker.pk]
    );

    if (BuildConstants.isTraining) {
        return (
            <Text color="grey.dark" fontFamily="monospace" fontWeight="bold">
                {connectedCompany?.settings?.training_trucker_invitation_code}
            </Text>
        );
    }
    if (trucker?.invite_code) {
        return (
            <Flex alignItems="center" flexWrap="wrap">
                <Text
                    color="grey.dark"
                    fontFamily="monospace"
                    fontWeight="bold"
                    {...textProps}
                    mr={3}
                >
                    {trucker.invite_code}
                </Text>
                {!isReadOnly && trucker.phone_number && (
                    <Button
                        variant="plain"
                        data-testid="trucker-send-invite-sms-button"
                        onClick={handleSendInviteCodeBySMS}
                    >
                        {t("truckersList.sendBySMS")}
                    </Button>
                )}
            </Flex>
        );
    }
    return (
        <Flex>
            {!isReadOnly && (
                <Button
                    variant="plain"
                    data-testid="trucker-generate-code-button"
                    onClick={handleInviteCodeClick}
                    disabled={!managerService.hasAtLeastUserRole(connectedManager)}
                >
                    {t("truckersList.generateInviteCode")}
                </Button>
            )}
        </Flex>
    );
}
