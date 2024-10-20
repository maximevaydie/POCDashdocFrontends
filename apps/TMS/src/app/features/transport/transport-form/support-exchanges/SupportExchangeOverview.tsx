import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {FieldArray, FieldArrayRenderProps, useFormikContext} from "formik";
import sortBy from "lodash.sortby";
import React, {FunctionComponent, useEffect, useRef} from "react";

import {
    tagColors,
    TransportFormValues,
    TransportFormSupportExchange,
} from "../transport-form.types";

import {SupportExchangeFormPanel} from "./SupportExchangeFormPanel";
import {SupportExchangeItem} from "./SupportExchangeItem";

type SupportExchangesOverviewProps = {
    loadings: TransportFormValues["loadings"];
    unloadings: TransportFormValues["unloadings"];
    editingIndex: number | null | "new";
    hideTitle?: boolean;
    setEditingIndex: (value: number | null | "new") => void;
};
export const SupportExchangesOverview: FunctionComponent<SupportExchangesOverviewProps> = ({
    loadings,
    unloadings,
    editingIndex,
    hideTitle = false,
    setEditingIndex,
}) => {
    const {
        values: {supportExchanges},
    } = useFormikContext<TransportFormValues>();

    const sortedSupportExchanges = sortBy(
        supportExchanges.map((supportExchange, index) => {
            return {...supportExchange, index};
        }),
        [
            (s) => {
                const index = loadings.findIndex((loading) => loading.uid === s.activity.uid);
                return index > -1 ? index : null;
            },
            (s) => unloadings.findIndex((unloading) => unloading.uid === s.activity.uid),
        ]
    );

    const addingPlaceHolderRef = useRef(null);
    useEffect(() => {
        if (editingIndex === "new") {
            // @ts-ignore
            addingPlaceHolderRef.current?.scrollIntoView();
        }
    }, [editingIndex, supportExchanges?.length]);

    const renderSupportExchangesFieldArray = (arrayHelpers: FieldArrayRenderProps) => {
        return (
            <>
                {sortedSupportExchanges.map(
                    (supportExchange: TransportFormSupportExchange & {index: number}) => {
                        let tagColor = null;
                        let indexTodisplay = null;
                        const loadingIndex = loadings.findIndex(
                            (loading) => loading.uid === supportExchange.activity.uid
                        );
                        const unloadingIndex = unloadings.findIndex(
                            (unloading) => unloading.uid === supportExchange.activity.uid
                        );

                        if (
                            loadingIndex >= 0 &&
                            (loadings.length > 1 || unloadings.length === 1)
                        ) {
                            indexTodisplay = loadings.length > 1 ? loadingIndex + 1 : null;
                            tagColor = tagColors[loadingIndex % tagColors.length];
                        } else if (unloadings.length > 1 && unloadingIndex >= 0) {
                            indexTodisplay = unloadingIndex + 1;
                            tagColor = tagColors[unloadingIndex % tagColors.length];
                        }

                        const tagText =
                            (loadingIndex >= 0 ? t("common.pickup") : t("common.delivery")) +
                            (indexTodisplay !== null ? ` #${indexTodisplay}` : "");

                        return (
                            <SupportExchangeItem
                                key={supportExchange.index}
                                supportExchange={supportExchange}
                                index={supportExchange.index}
                                isEditing={editingIndex === supportExchange.index}
                                tagColor={tagColor}
                                tagText={tagText}
                                onEdit={() => setEditingIndex(supportExchange.index)}
                                onDelete={() => arrayHelpers.remove(supportExchange.index)}
                            />
                        );
                    }
                )}
                {editingIndex === "new" && (
                    <Flex
                        bg="grey.light"
                        px={3}
                        py={3}
                        borderBottom="1px solid"
                        borderColor="grey.light"
                        ref={addingPlaceHolderRef}
                    >
                        <Text>{t("transportForm.newSupportExchange")}</Text>
                    </Flex>
                )}
                {editingIndex !== null && (
                    <SupportExchangeFormPanel
                        onSubmit={(value) =>
                            editingIndex === "new"
                                ? arrayHelpers.push(value)
                                : arrayHelpers.replace(editingIndex, value)
                        }
                        onClose={() => setEditingIndex(null)}
                        loadingActivities={loadings}
                        unloadingActivities={unloadings}
                        // @ts-ignore
                        supportExchangeToEdit={
                            editingIndex === "new" ? null : supportExchanges[editingIndex]
                        }
                    />
                )}
            </>
        );
    };

    return (
        <Box>
            {!hideTitle && (supportExchanges.length > 0 || editingIndex !== null) && (
                <Text variant="h1" mt={4} mb={3}>
                    {t("common.supportExchanges")}
                </Text>
            )}
            <FieldArray
                name="supportExchanges"
                render={(arrayHelpers) => renderSupportExchangesFieldArray(arrayHelpers)}
            />
        </Box>
    );
};
