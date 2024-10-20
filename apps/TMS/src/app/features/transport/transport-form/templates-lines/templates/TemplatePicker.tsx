import {apiService, urlService, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, IconButton, LoadingWheel, Text, TextInput} from "@dashdoc/web-ui";
import {TemplateMinimalInfo, formatDate, parseAndZoneDate} from "dashdoc-utils";
import isNil from "lodash.isnil";
import sortBy from "lodash.sortby";
import React, {FunctionComponent, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";

import {fetchDeleteTransportTemplate} from "app/redux/actions";

type TemplatePickerProps = {
    transportTemplates: TemplateMinimalInfo[] | null;
    openEditionInNewTab?: boolean;
    loadTemplates: () => void;
    onEnd?: () => void;
    autoFocusSearchField?: boolean;
};

const TemplatePicker: FunctionComponent<TemplatePickerProps> = ({
    transportTemplates,
    openEditionInNewTab,
    loadTemplates,
    onEnd,
    autoFocusSearchField,
}) => {
    const timezone = useTimezone();
    const [sortedTransportTemplates, setSortedTransportTemplates] = useState<
        TemplateMinimalInfo[] | null
    >(null);
    const [search, setSearch] = useState<string>("");
    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isNil(transportTemplates)) {
            setSortedTransportTemplates(null);
        } else if (transportTemplates.length > 0) {
            const filteredTransports = transportTemplates.filter(
                (t) => !search || t.template_name.toLowerCase().includes(search.toLowerCase())
            );
            const sortedTransports = sortBy(filteredTransports, ["template_name"]);
            setSortedTransportTemplates(sortedTransports);
        } else {
            setSortedTransportTemplates([]);
        }
    }, [transportTemplates, search]);

    if (isNil(sortedTransportTemplates)) {
        return <LoadingWheel noMargin />;
    }

    if (!transportTemplates || transportTemplates.length === 0) {
        return <Text>{t("transportTemplates.noTemplatesCreatedYet")}</Text>;
    }

    const handleSelectTemplate = (transportTemplate: TemplateMinimalInfo) => {
        let path = `/app/transports/new-from-template/${transportTemplate.uid}/`;
        if (transportTemplate.shape === "complex") {
            path = path + "?complex=true";
        }
        history.push(path);
        onEnd?.();
    };

    const handleDeleteTemplate = async (transportTemplate: TemplateMinimalInfo) => {
        await dispatch(fetchDeleteTransportTemplate(transportTemplate.uid));
        loadTemplates();
    };

    const handleEditTemplate = (transportTemplate: TemplateMinimalInfo) => {
        let path = `/app/transport-templates/edit/${transportTemplate.uid}/`;
        if (transportTemplate.shape === "complex") {
            path = path + "?complex=true";
        }
        if (openEditionInNewTab) {
            window.open(urlService.getBaseUrl() + path);
        } else {
            history.push(path);
        }
    };

    return (
        <>
            <TextInput
                value={search}
                onChange={setSearch}
                leftIcon="search"
                placeholder={t("common.search")}
                autoComplete="off"
                autoFocus={autoFocusSearchField}
            />
            {sortedTransportTemplates.length === 0 && (
                <Text color="grey.dark" width="100%" p={3} textAlign="center">
                    {t("common.noResultFound")}
                </Text>
            )}
            {sortedTransportTemplates.map((transportTemplate, transportTemplateIndex: number) => {
                const date = formatDate(
                    parseAndZoneDate(transportTemplate.updated, timezone),
                    "PPPp"
                );

                return (
                    <Flex
                        alignItems="center"
                        key={transportTemplateIndex}
                        my={2}
                        bg="grey.light"
                        px={4}
                        py={2}
                    >
                        <Box flexGrow={1}>
                            <Text data-testid="template-picker-name" flex={1} fontWeight="bold">
                                {transportTemplate.template_name}
                            </Text>
                            <Text variant="caption" color="grey.dark">
                                {t("common.lastUpdateAt", {date})}
                            </Text>
                        </Box>
                        <Button
                            data-testid="template-picker-use"
                            variant="secondary"
                            onClick={() => handleSelectTemplate(transportTemplate)}
                            ml={2}
                        >
                            {t("common.useIt")}
                        </Button>
                        <IconButton
                            data-testid="template-picker-edit"
                            name="edit"
                            onClick={() => handleEditTemplate(transportTemplate)}
                            ml={2}
                        ></IconButton>
                        <IconButton
                            data-testid="template-picker-delete"
                            name="delete"
                            onClick={() => handleDeleteTemplate(transportTemplate)}
                            ml={2}
                            withConfirmation
                            confirmationMessage={t("components.confirmDeleteTransportTemplate", {
                                templateName: transportTemplate.template_name,
                            })}
                            modalProps={{
                                title: t("components.deleteTransportTemplate"),
                                mainButton: {
                                    children: t("common.delete"),
                                    "data-testid": "document-delete-confirmation-button",
                                },
                            }}
                        />
                    </Flex>
                );
            })}
        </>
    );
};

export const TemplatePickerWrapper: FunctionComponent<{shipperCompanyPk: number}> = ({
    shipperCompanyPk,
}) => {
    const [transportTemplates, setTransportTemplates] = useState<TemplateMinimalInfo[]>([]);
    const loadTemplates = () => {
        if (shipperCompanyPk) {
            apiService.Companies.getTransportTemplates(shipperCompanyPk).then(
                (transportTemplates: TemplateMinimalInfo[]) => {
                    setTransportTemplates(transportTemplates);
                }
            );
        }
    };

    useEffect(loadTemplates, [shipperCompanyPk]);

    return (
        <TemplatePicker
            transportTemplates={transportTemplates}
            openEditionInNewTab={false}
            loadTemplates={loadTemplates}
        />
    );
};

export default TemplatePicker;
