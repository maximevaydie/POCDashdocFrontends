import {DynamicFormComponent} from "@dashdoc/web-common/src/features/dynamic-form/DynamicFormComponent";
import {useDynamicForm} from "@dashdoc/web-common/src/features/dynamic-form/hooks/useDynamicForm";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {ConnectivityStatus} from "app/features/settings/api/ConnectivityStatus";
import {CustomExtensionLatestRunResult} from "app/features/settings/api/CustomExtensionLatestRunResult";
import {ExtensionHeader} from "app/features/settings/api/ExtensionHeader";
import {BackToLink} from "app/features/settings/BackToLink";
import {useCustomExtensionConfigurationForm} from "app/features/settings/hooks/useCustomExtensionConfigurationForm";

import {getRoute, getTranslationKeys} from "../extensions.service";

import {ConnectorCategory, CustomExtension, ExtensionKey} from "./types";

export const CustomExtensionDetails = ({
    extension,
    connectorCategory,
}: {
    extension: CustomExtension;
    connectorCategory: ConnectorCategory;
}) => {
    const {logOutBody, logOutTitle, backToList}: ExtensionKey =
        getTranslationKeys(connectorCategory);

    const {instantiate, uninstantiate, isInstantiated, isSubmitting} =
        useCustomExtensionConfigurationForm(extension, connectorCategory);

    const dynamicFormSpec = extension; // The extension *is* a dynamic form spec
    const form = useDynamicForm(dynamicFormSpec);

    return (
        <Flex flexDirection="column" mt={3} pb="15em">
            <BackToLink label={backToList} route={getRoute(connectorCategory)} />
            <ExtensionHeader
                name={extension.name}
                description={extension.description}
                iconUrl={extension.icon_url}
            />
            <Flex flexDirection="column">
                <Box
                    backgroundColor={isInstantiated ? "blue.ultralight" : "grey.ultralight"}
                    borderRadius={2}
                    p={4}
                >
                    <Flex justifyContent="space-between" alignItems="start">
                        <Text variant="h1">{t("common.configureTitle")}</Text>
                        <ConnectivityStatus
                            status={isInstantiated ? "instantiated" : "notInstantiated"}
                            pt={1}
                        />
                    </Flex>
                    <DynamicFormComponent
                        form={form}
                        dynamicFormSpec={dynamicFormSpec}
                        readOnly={isInstantiated}
                    />

                    <Box my={2}>
                        <CustomExtensionLatestRunResult extension={extension} />
                    </Box>

                    <Flex justifyContent="flex-end" mr={3} mt={2}>
                        {isInstantiated ? (
                            <Button
                                variant={"plain"}
                                severity={"dangerPlain"}
                                type="button"
                                justifySelf="flex-end"
                                withConfirmation
                                confirmationMessage={t(logOutBody, {
                                    name: extension.name,
                                })}
                                modalProps={{
                                    title: t(logOutTitle, {
                                        name: extension.name,
                                    }),
                                    mainButton: {
                                        children: t("common.delete"),
                                    },
                                }}
                                data-testid="delete-connector-button"
                                disabled={isSubmitting}
                                onClick={uninstantiate}
                                alignItems="end"
                            >
                                {t("common.delete")}
                            </Button>
                        ) : (
                            <Button
                                variant={"secondary"}
                                justifySelf="flex-end"
                                onClick={() => form.handleSubmit(instantiate)()}
                                disabled={isSubmitting}
                                data-testid="add-connector-button"
                            >
                                {t("common.configureTitle")}
                            </Button>
                        )}
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};
