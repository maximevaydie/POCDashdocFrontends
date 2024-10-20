import {apiService, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, IconButton, LoadingWheel, Text, toast} from "@dashdoc/web-ui";
import {TransportStatusCategory} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";

import {useSelector} from "app/redux/hooks";

import {AddEditWebhookLinkModal} from "./add-edit-webhook-link-modal";
import WebhookLogModal from "./webhook/WebhookLogModal";

export type ConnectorParameters = {
    sending_on_hold: boolean;
    subscriptions: TransportStatusCategory[];
    url: string;
    version: string;
    name: string;
    authorization: string;
};

export interface Connector {
    pk?: number;
    parameters: ConnectorParameters;
    enabled: boolean;
    retried_events_count?: number;
}

export const SettingsApi: FunctionComponent = () => {
    const company = useSelector(getConnectedCompany);

    const [isLoading, setIsLoading] = useState(true);
    const [apiToken, setApiToken] = useState<string | null>(null);
    const [isLogModalOpened, setIsLogModalOpened] = useState<{
        opened: Boolean;
        pk: number;
        // @ts-ignore
    }>({opened: false, pk: null});
    const [isAddModalOpened, setIsAddModalOpened] = useState(false);
    const [isEditModalOpened, setIsEditModalOpened] = useState<{
        opened: Boolean;
        connector: Connector;
        // @ts-ignore
    }>({opened: false, connector: null});
    const [connectorList, setConnectorList] = useState<Connector[]>([]);

    const renderWebhookRow = (connector: Connector) => {
        return (
            <Flex
                flex={1}
                mt={2}
                borderRadius={1}
                backgroundColor="grey.light"
                border="1px solid"
                borderColor="grey.light"
                data-testid="webhook-row"
            >
                <Box flex={1} p={2} display="flex">
                    <Text mt="auto" mb="auto">
                        {connector.parameters.name}
                    </Text>
                </Box>
                <Box flex={1} p={2} display="flex">
                    <Text mr={1} mt="auto" mb="auto">
                        {t("settings.webhookSendingStatus") + ":"}
                    </Text>
                    {!connector.parameters.sending_on_hold ? (
                        <Text color="green.default" mt="auto" mb="auto">
                            ON
                        </Text>
                    ) : (
                        <Text color="red.default" mt="auto" mb="auto">
                            OFF
                        </Text>
                    )}
                    {/*
// @ts-ignore */}
                    {connector.parameters.sending_on_hold || connector.retried_events_count > 0 ? (
                        <IconButton
                            name="synchronize"
                            // @ts-ignore
                            onClick={() => resumeSending(connector.pk)}
                        ></IconButton>
                    ) : null}
                </Box>
                <Box flex={1} p={2} display="flex">
                    <Text mt="auto" mb="auto">
                        {t("settings.webhookFailedSendings", {
                            smart_count: connector.retried_events_count,
                        })}
                    </Text>
                </Box>
                <Box flex={1} p={2} display="flex">
                    <IconButton
                        name="instructions"
                        ml="auto"
                        // @ts-ignore
                        onClick={() => setIsLogModalOpened({opened: true, pk: connector.pk})}
                        data-testid="webhook-logs-button"
                    ></IconButton>
                    <IconButton
                        name="edit"
                        onClick={() => setIsEditModalOpened({opened: true, connector: connector})}
                        data-testid="webhook-edit-button"
                    ></IconButton>
                    <IconButton
                        name="bin"
                        withConfirmation={true}
                        confirmationMessage={t("settings.webhookDeletionConfirmationMessage")}
                        // @ts-ignore
                        onClick={() => deleteConnectorWebhook(connector.pk)}
                        modalProps={{
                            title: t("settings.webhookDeletion"),
                            mainButton: {children: t("settings.deleteThisWebhook")},
                        }}
                        data-testid="webhook-delete-button"
                    ></IconButton>
                </Box>
            </Flex>
        );
    };

    const createApiToken = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.post(
                `/companies/${company?.pk}/create-api-token/`,
                {},
                {apiVersion: "v4"}
            );
            setApiToken(response.token);
            setIsLoading(false);
        } catch (e) {
            toast.error(t("settings.apiTokenError"));
            setIsLoading(false);
        }
    };

    const getApiToken = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get(`/companies/${company?.pk}/api-token/`, {
                apiVersion: "v4",
            });
            setApiToken(response.token);
            setIsLoading(false);
        } catch (e) {
            toast.error(t("settings.apiTokenError"));
            setIsLoading(false);
        }
    }, [company?.pk]);

    const getConnectorWebhook = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.get("/webhook-v2-connector/", {
                apiVersion: "v4",
            });
            setConnectorList(response.results);
            setIsLoading(false);
        } catch (e) {
            toast.error(t("settings.getWebhookError"));
            setIsLoading(false);
        }
    }, [setConnectorList]);

    const createConnectorWebhook = async (data: Connector) => {
        setIsLoading(true);
        try {
            await apiService.post("/webhook-v2-connector/", data, {
                apiVersion: "v4",
            });
            setIsLoading(false);
            getConnectorWebhook();
        } catch (e) {
            toast.error(t("settings.createWebhookError"));
            setIsLoading(false);
        }
    };

    const updateConnectorWebhook = async (data: Connector, id: number) => {
        setIsLoading(true);
        try {
            await apiService.patch(`/webhook-v2-connector/${id}/`, data, {
                apiVersion: "v4",
            });
            setIsLoading(false);
            getConnectorWebhook();
        } catch (e) {
            toast.error(t("settings.editWebhookError"));
            setIsLoading(false);
        }
    };

    const deleteConnectorWebhook = async (id: number) => {
        setIsLoading(true);
        try {
            await apiService.delete(`/webhook-v2-connector/${id}/`, {
                apiVersion: "v4",
            });
            setIsLoading(false);
            getConnectorWebhook();
        } catch (e) {
            toast.error(t("settings.deleteWebhookError"));
            setIsLoading(false);
        }
    };

    const resumeSending = async (pk: number) => {
        setIsLoading(true);
        try {
            await apiService.post(`/webhook-v2-connector/${pk}/resume/`, {
                apiVersion: "v4",
            });
            setIsLoading(false);
            getConnectorWebhook();
        } catch (e) {
            toast.error(t("settings.resumeWebhookSendingError"));
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getApiToken();
        getConnectorWebhook();
    }, [getApiToken, getConnectorWebhook]);

    return (
        <div>
            <h4 className="panel-settings-heading">{t("settings.APIAccess")}</h4>
            <p>{t("settings.APIAccessDetails")}</p>
            <p>
                <a href="https://www.dashdoc.eu/api/v4/docs/">
                    https://www.dashdoc.eu/api/v4/docs/
                </a>
            </p>
            <h5>{t("settings.APIToken")}</h5>
            {isLoading ? (
                <LoadingWheel />
            ) : apiToken ? (
                <pre data-testid="settings-api-token">{apiToken}</pre>
            ) : (
                <div>
                    <p>{t("settings.noAPIToken")}</p>
                    <Button
                        className="btn btn-info"
                        onClick={createApiToken}
                        data-testid="settings-api-generate-token"
                    >
                        {t("settings.generateAPIToken")}
                    </Button>
                </div>
            )}

            <>
                <div className="spacer" />
                <h4 className="panel-settings-heading">Webhooks</h4>
                <p>{t("settings.webhooksAccessDoc")}</p>
                <p>
                    <a href="https://developer.dashdoc.eu/docs/tutorials/webhooks-v2">
                        https://developer.dashdoc.eu/docs/tutorials/webhooks-v2
                    </a>
                </p>
                <Button
                    ml={"auto"}
                    onClick={() => setIsAddModalOpened(true)}
                    data-testid="settings-API-add-webhook-button"
                >
                    <Icon name="add" mr={3} />
                    {t("settings.addWebhook")}
                </Button>
                {!isLoading &&
                    connectorList.map((connector: Connector) => renderWebhookRow(connector))}
                {isAddModalOpened && (
                    <AddEditWebhookLinkModal
                        onClose={() => setIsAddModalOpened(false)}
                        onSubmit={createConnectorWebhook}
                    ></AddEditWebhookLinkModal>
                )}
                {isEditModalOpened.opened && (
                    <AddEditWebhookLinkModal
                        connector={isEditModalOpened.connector}
                        // @ts-ignore
                        onClose={() => setIsEditModalOpened({opened: false, connector: null})}
                        onSubmit={updateConnectorWebhook}
                    ></AddEditWebhookLinkModal>
                )}
                {isLogModalOpened.opened && (
                    <WebhookLogModal
                        // @ts-ignore
                        onClose={() => setIsLogModalOpened({opened: false, pk: null})}
                        connectorPk={isLogModalOpened.pk}
                        // @ts-ignore
                        history={undefined}
                        // @ts-ignore
                        location={undefined}
                        // @ts-ignore
                        match={undefined}
                    ></WebhookLogModal>
                )}
            </>
        </div>
    );
};
