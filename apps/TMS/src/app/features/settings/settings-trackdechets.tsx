import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Box, Button, Flex, Callout, SwitchInput, TextInput, toast} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {TrackDechetsApi} from "dashdoc-utils";
import {Form, Formik} from "formik";
import React, {useEffect, useState} from "react";

const trackDechetsApi = new TrackDechetsApi(apiService);

type ConnectorForm = {
    token: string;
};
const SettingsTrackdechets = () => {
    const environment = import.meta.env.MODE;
    const initialValues = {token: ""};
    const [onChangeToken, setOnChangeToken] = useState<string>("");
    const [connectorUid, setConnectorUID] = useState<string | null>(null);
    const [isProduction, setIsProduction] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const response = await trackDechetsApi.fetchListTrackDechetsConnectors();
                setConnectorUID(response?.results[0]?.uid);
                setIsProduction(response?.results[0]?.is_production ?? false);
            } catch (error) {
                setConnectorUID(null);
                toast.error(t("settings.trackedechets.error"));
            }
        })();
    }, []);

    const handleSubmit = async () => {
        let token = onChangeToken;
        try {
            const response = await trackDechetsApi.fetchCreateTrackDechetsConnector(
                token,
                isProduction
            );
            toast.success(t("settings.trackdechetsAdded"));
            setConnectorUID(response?.uid);
        } catch (e) {
            toast.error(t("common.invalidToken"));
        }
    };

    const removeConnector = async () => {
        if (connectorUid) {
            try {
                await trackDechetsApi.fetchDeleteTrackDechetsConnector(connectorUid);
                setConnectorUID(null);
                setOnChangeToken("");
                toast.success(t("settings.trackdechetsDeleted"));
            } catch (error) {
                toast.error(t("settings.trackedechets.error"));
            }
        }
    };

    const environmentSetting = async (value: boolean) => {
        setIsProduction(value);
    };

    // TODO: Convert to our useFormik style
    return (
        <>
            <Callout marginY={4}>
                <p style={{margin: 0}}>
                    {/* TODO: translate this with phrase! */}
                    Retrouvez comment relier votre compte à Trackdéchets et comment fonctionne la
                    liaison entre les deux plateformes dans notre{" "}
                    <a
                        href="https://help.dashdoc.eu/fr/articles/6142306-comment-valider-vos-bsd-trackdechets-depuis-dashdoc"
                        target={"_blank"}
                        rel="noreferrer"
                    >
                        documentation
                    </a>
                    .
                </p>
            </Callout>
            <h4 className="panel-settings-heading">{t("settings.trackdechets.title")}</h4>
            {connectorUid == null && (
                <Formik
                    initialValues={initialValues as ConnectorForm}
                    validateOnBlur={true}
                    validateOnChange={true}
                    onSubmit={async () => {
                        handleSubmit();
                    }}
                >
                    {({
                        isSubmitting,
                        /* and other goodies */
                    }) => (
                        <Form>
                            <FormGroup>
                                <Box mt={2}>
                                    <TextInput
                                        value={onChangeToken}
                                        autoComplete="off"
                                        label="Token"
                                        type="text"
                                        required={true}
                                        disabled={isSubmitting}
                                        onChange={setOnChangeToken}
                                        data-testid="add-token-trackdechets"
                                    />
                                </Box>
                            </FormGroup>
                            <Flex alignItems="center" mt={4}>
                                <Badge
                                    maxWidth="fit-content"
                                    variant={isProduction ? "blue" : "success"}
                                    mr={3}
                                >
                                    {"Environnement"}
                                </Badge>
                                <SwitchInput
                                    disabled={environment != "prod"}
                                    value={isProduction}
                                    labelRight={t("settings.trackdechets.environment.production")}
                                    labelLeft={t("settings.trackdechets.environment.test")}
                                    onChange={environmentSetting}
                                />
                            </Flex>
                            <Flex alignItems="flex-end" flexDirection="column">
                                <Button
                                    type="submit"
                                    justifySelf="flex-end"
                                    disabled={isSubmitting}
                                    data-testid="add-trackdechets-connector-button"
                                >
                                    {t("common.save")}
                                </Button>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            )}
            {!!connectorUid && (
                <>
                    <Flex alignItems="center">
                        <Badge
                            maxWidth="fit-content"
                            variant="warning"
                            data-testid="trackdechets-connector-status"
                        >
                            {t("settings.trackdechets.active")}
                        </Badge>
                        <Badge
                            maxWidth="fit-content"
                            variant={isProduction ? "blue" : "success"}
                            data-testid="trackdechets-connector-status"
                        >
                            {isProduction
                                ? t("settings.trackdechets.environment.production")
                                : t("settings.trackdechets.environment.test")}
                        </Badge>
                    </Flex>
                    <Button
                        variant="secondary"
                        severity="danger"
                        withConfirmation
                        confirmationMessage={t("settings.trackdechets.confirmRemoveConnector")}
                        modalProps={{
                            title: t("settings.trackdechets.removeConnector"),
                            mainButton: {
                                children: t("common.delete"),
                            },
                        }}
                        data-testid="remove-trackdechets-connector-button"
                        maxWidth="fit-content"
                        mt={4}
                        onClick={removeConnector}
                    >
                        {t("settings.trackdechets.removeConnector")}
                    </Button>
                </>
            )}
        </>
    );
};
export default SettingsTrackdechets;
