import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, LoadingWheel, Text} from "@dashdoc/web-ui";
import {Connector, useToggle} from "dashdoc-utils";
import {Form, Formik, FormikProps, useFormik} from "formik";
import React from "react";

import {
    ConnectivityStatus,
    ConnectivityStatusValue,
} from "app/features/settings/api/ConnectivityStatus";
import {EnvironmentPicker} from "app/features/settings/api/EnvironmentPicker";
import {ShippersPlatformServicesPicker} from "app/features/settings/api/shippers-platform-services-picker";
import {SHIPPERS_PLATFORM_SERVICES} from "app/services/misc/shippersPlatform.service";

import {
    generateInitialValues,
    generateSchemaFromRequiredFields,
    getExtension,
    getTranslationKeys,
} from "../extensions.service";
import {ExtensionsConnectorPayload, useCrudConnector} from "../hooks/useCrudConnector";

import {ConnectorFields} from "./ConnectorFields";
import {GedmouvConnectorSpecificities} from "./GedmouvConnectorSpecificities";
import {DeleteConnectorConfirmationModal} from "./modal/DeleteConnectorConfirmationModal";
import {StatusDisplay} from "./StatusDisplay";
import {TransporeonConnectorSpecificities} from "./TransporeonConnectorSpecificities";
import {ConnectorCategory, ExtensionDataSource, ExtensionKey} from "./types";

interface ExtensionConnectivityProps {
    status: ConnectivityStatusValue;
    connector: Connector | undefined;
    dataSource: ExtensionDataSource;
    connectorCategory: ConnectorCategory;
    updateStatus: (newStatus: ConnectivityStatusValue) => void;
    updateConnector: (newConnector: Connector | undefined) => void;
}

export const ExtensionConnectivity = ({
    status,
    connector,
    dataSource,
    connectorCategory,
    updateStatus,
    updateConnector,
}: ExtensionConnectivityProps) => {
    const {
        name,
        requiredCredentials,
        requiredParameters,
        isEnvironmentPickingAvailable,
        availableServices,
        isOauthAvailable,
    } = getExtension(connectorCategory, dataSource);

    const {oauthStatus, upsertConnector, removeConnector} = useCrudConnector(
        status,
        connector,
        connectorCategory,
        dataSource,
        isOauthAvailable ?? false,
        updateStatus,
        updateConnector
    );
    const {logOutBody, logOutTitle}: ExtensionKey = getTranslationKeys(connectorCategory);
    const [deleteConfirmationModal, showDeleteConfirmationModal, hideDeleteConfirmationModal] =
        useToggle();
    const defaultEnvironment = import.meta.env.MODE === "prod" ? "production" : "sandbox";

    const validationSchema = generateSchemaFromRequiredFields(
        connectorCategory,
        requiredCredentials,
        requiredParameters
    );

    const onDeleteConnector = () => {
        removeConnector();
        hideDeleteConfirmationModal();
    };

    const formik_remove_connector = useFormik({
        initialValues: {},
        onSubmit: () => {
            try {
                removeConnector();
            } catch (error) {
                formik_remove_connector.setFieldError("cancel_reason", error.message);
            }
        },
        validateOnChange: false,
        validateOnBlur: false,
    });

    return (
        <Flex flexDirection="column">
            {status === "loading" && <LoadingWheel />}
            {status !== "loading" && (
                <>
                    <Formik
                        initialValues={generateInitialValues(
                            connector?.parameters,
                            defaultEnvironment,
                            connectorCategory,
                            dataSource,
                            requiredCredentials,
                            requiredParameters,
                            availableServices
                        )}
                        validationSchema={validationSchema}
                        validateOnBlur={false}
                        validateOnChange={false}
                        onSubmit={(values, formikHelpers) =>
                            upsertConnector(
                                values,
                                formikHelpers,
                                requiredCredentials,
                                requiredParameters
                            )
                        }
                        enableReinitialize
                    >
                        {({
                            values,
                            errors,
                            isSubmitting,
                            setFieldValue,
                        }: FormikProps<ExtensionsConnectorPayload>) => (
                            <Form>
                                <Box
                                    backgroundColor={
                                        status === "connected"
                                            ? "blue.ultralight"
                                            : "grey.ultralight"
                                    }
                                    borderRadius={2}
                                    p={2}
                                >
                                    <Flex justifyContent="space-between" alignItems="start" my={2}>
                                        <Text variant="h1">{t("common.connection")}</Text>
                                        <ConnectivityStatus status={status} pt={1} />
                                    </Flex>
                                    <ConnectorFields
                                        requiredCredentials={requiredCredentials}
                                        requiredParameters={requiredParameters}
                                        dataSource={dataSource}
                                        values={values}
                                        setFieldValue={setFieldValue}
                                        errors={errors}
                                        disabled={status === "connected"}
                                    />
                                    <Box padding={2} />

                                    {/* ShippersPlatform Part */}
                                    {connectorCategory === "external_tms" && (
                                        <ShippersPlatformServicesPicker
                                            // @ts-ignore
                                            availableServices={SHIPPERS_PLATFORM_SERVICES.filter(
                                                (service) =>
                                                    availableServices &&
                                                    availableServices.indexOf(service.key) >= 0
                                            ).map((service) => {
                                                return {
                                                    ...service,
                                                    disabled: service.displayOnly,
                                                    value: service.displayOnly
                                                        ? true
                                                        : (values[
                                                              service.key
                                                          ] as unknown as boolean),
                                                    error: errors[service.key],
                                                    onChange: (value: any) => {
                                                        if (service.displayOnly) {
                                                            return;
                                                        } else {
                                                            setFieldValue(service.key, value);
                                                        }
                                                    },
                                                };
                                            })}
                                            disabled={status === "connected"}
                                        />
                                    )}
                                    {dataSource === "gedmouv" && (
                                        <GedmouvConnectorSpecificities
                                            values={values}
                                            errors={errors}
                                            setFieldValue={setFieldValue}
                                            disabled={status === "connected"}
                                        />
                                    )}
                                    {dataSource === "transporeon" && (
                                        <TransporeonConnectorSpecificities
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            disabled={status === "connected"}
                                        />
                                    )}

                                    {isEnvironmentPickingAvailable && (
                                        <EnvironmentPicker
                                            isOnProductionEnvironment={
                                                values["environment"] === "production"
                                            }
                                            disablePickingOnProduction={false}
                                            switchEnvironment={(goToProduction) =>
                                                goToProduction
                                                    ? setFieldValue("environment", "production")
                                                    : setFieldValue("environment", "sandbox")
                                            }
                                            disabled={status === "connected"}
                                        />
                                    )}
                                    <Flex
                                        flexDirection={"row"}
                                        justifyContent="space-between"
                                        mr={3}
                                        mt={2}
                                    >
                                        <StatusDisplay
                                            status={oauthStatus ?? status}
                                            extensionName={name}
                                        />
                                        {status !== "noConnector" &&
                                            connectorCategory === "invoicing" && (
                                                <Button
                                                    variant={"plain"}
                                                    severity={"dangerPlain"}
                                                    type="button"
                                                    justifySelf="flex-end"
                                                    tracking="remove absence manager connector"
                                                    data-testid="delete-connector-button"
                                                    onClick={showDeleteConfirmationModal}
                                                    alignItems="end"
                                                >
                                                    {t("common.logOut")}
                                                </Button>
                                            )}
                                        {status !== "noConnector" &&
                                            connectorCategory !== "invoicing" && (
                                                <Button
                                                    variant={"plain"}
                                                    severity={"dangerPlain"}
                                                    type="button"
                                                    justifySelf="flex-end"
                                                    tracking="remove absence manager connector"
                                                    withConfirmation
                                                    confirmationMessage={t(logOutBody, {
                                                        platform_name: name,
                                                    })}
                                                    modalProps={{
                                                        title: t(logOutTitle, {
                                                            platform_name: name,
                                                        }),
                                                        mainButton: {
                                                            children: t("common.logOut"),
                                                            tracking:
                                                                "remove absence manager connector submit",
                                                        },
                                                    }}
                                                    data-testid="delete-connector-button"
                                                    onClick={removeConnector}
                                                    alignItems="end"
                                                >
                                                    {t("common.logOut")}
                                                </Button>
                                            )}
                                        {![
                                            "connected",
                                            "authenticationInProgress",
                                            "redirectingToProvider",
                                            "authenticatingOnThirdParty",
                                        ].includes(status) && (
                                            <Button
                                                variant={"secondary"}
                                                type="submit"
                                                justifySelf="flex-end"
                                                tracking="add absence manager connector"
                                                disabled={isSubmitting}
                                                data-testid="add-connector-button"
                                            >
                                                {t("common.logIn")}
                                            </Button>
                                        )}
                                    </Flex>
                                </Box>
                                {deleteConfirmationModal && (
                                    <DeleteConnectorConfirmationModal
                                        onSubmit={onDeleteConnector}
                                        onClose={hideDeleteConfirmationModal}
                                    />
                                )}
                            </Form>
                        )}
                    </Formik>
                </>
            )}
        </Flex>
    );
};
