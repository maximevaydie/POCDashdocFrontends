import {getLoadText, t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Flex, Icon, IconButton, Text} from "@dashdoc/web-ui";
import {FieldArray, FieldArrayRenderProps, useFormikContext} from "formik";
import sortBy from "lodash.sortby";
import React, {FunctionComponent, useContext, useEffect, useRef} from "react";

import LoadFormPanel from "../../load/load-form/LoadFormPanel";
import {TransportFormContext} from "../transport-form-context";
import {
    FormLoad,
    TransportFormDeliveryOption,
    TransportFormValues,
    tagColors,
} from "../transport-form.types";

type LoadsOverviewProps = {
    editingIndex: number | null | "new";
    setEditingIndex: (value: number | null | "new") => void;
    deliveries: TransportFormDeliveryOption[];
};

export const LoadsOverview: FunctionComponent<LoadsOverviewProps> = ({
    editingIndex,
    setEditingIndex,
    deliveries,
}) => {
    const {
        values: {loads, loadings, unloadings},
        errors: formErrors,
        submitCount,
    } = useFormikContext<TransportFormValues>();
    const {volumeDisplayUnit, loadsSmartSuggestionsMap} = useContext(TransportFormContext);

    const sortedLoads = sortBy(
        loads.map((load, index) => {
            return {...load, index};
        }),
        ["delivery.loadingActivity.index", "delivery.unloadingActivity.index"]
    );

    const loadsError = submitCount > 0 ? formErrors.loads : null;

    const addingPlaceHolderRef = useRef(null);
    useEffect(() => {
        if (editingIndex === "new") {
            // @ts-ignore
            addingPlaceHolderRef.current?.scrollIntoView();
        }
    }, [editingIndex, loads?.length]);

    const renderLoadsFieldArray = (arrayHelpers: FieldArrayRenderProps) => {
        return (
            <>
                {sortedLoads.map((load: FormLoad & {index: number}) => {
                    let tagColor = null;
                    let activityIndex = null;
                    if (loadings.length > 1) {
                        activityIndex = loadings.findIndex(
                            (loading) => loading.uid === load.delivery.loadingActivity.uid
                        );
                        tagColor = tagColors[activityIndex % tagColors.length];
                    } else if (unloadings.length > 1) {
                        activityIndex = unloadings.findIndex(
                            (unloading) => unloading.uid === load.delivery.unloadingActivity.uid
                        );
                        tagColor = tagColors[activityIndex % tagColors.length];
                    }
                    return (
                        <ClickableFlex
                            key={load.index}
                            p={2}
                            bg={load.index === editingIndex ? "grey.light" : undefined}
                            borderBottom="1px solid"
                            borderColor="grey.light"
                            onClick={() => setEditingIndex(load.index)}
                            data-testid={`transport-form-load-card-${load.index}`}
                            alignItems="center"
                        >
                            <Icon name={"load"} color="grey.dark" mr={3} />
                            <Flex flex={1}>
                                <Flex flexDirection="column">
                                    <Text color="grey.dark">
                                        {getLoadText({
                                            ...load,
                                            volume_display_unit: volumeDisplayUnit,
                                        })}
                                    </Text>
                                </Flex>
                            </Flex>

                            {tagColor && (
                                <Text
                                    borderRadius={1}
                                    p={1}
                                    width="80px"
                                    backgroundColor={tagColor + ".ultralight"}
                                    color={tagColor + ".dark"}
                                    textAlign="center"
                                    fontSize={0}
                                    lineHeight={0}
                                >
                                    {loadings.length > 1
                                        ? t("common.pickup")
                                        : t("common.delivery")}{" "}
                                    {activityIndex !== null ? `#${activityIndex + 1}` : ""}
                                </Text>
                            )}

                            <IconButton
                                name="edit"
                                ml={4}
                                data-testid={`edit-load-button-${load.index}`}
                            />
                            <Box
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`delete-load-button-${load.index}`}
                            >
                                <IconButton
                                    name="delete"
                                    onClick={() => {
                                        arrayHelpers.remove(load.index);
                                    }}
                                    withConfirmation
                                    confirmationMessage={t("components.confirmDeleteLoad")}
                                    modalProps={{
                                        title: t("components.confirmDeleteLoadTitle"),
                                        mainButton: {
                                            children: t("common.delete"),
                                        },
                                    }}
                                />
                            </Box>
                        </ClickableFlex>
                    );
                })}
                {editingIndex === "new" && (
                    <Flex
                        bg={loadsError == null ? "grey.light" : "red.ultralight"}
                        px={3}
                        py={4}
                        mt={3}
                        border="1px solid"
                        borderColor={loadsError == null ? "grey.dark" : "red.dark"}
                        ref={addingPlaceHolderRef}
                        onClick={() => setEditingIndex("new")}
                    >
                        <Text>{t("transportForm.newLoad")}</Text>
                    </Flex>
                )}
                {loadsError !== null && typeof loadsError === "string" && (
                    <Text color="red.dark" variant="caption" mt={2} ml={2}>
                        {loadsError}
                    </Text>
                )}
                {editingIndex !== null && (
                    <LoadFormPanel
                        onSubmit={(load) => {
                            editingIndex === "new"
                                ? arrayHelpers.push(load)
                                : arrayHelpers.replace(editingIndex, load);
                        }}
                        // @ts-ignore
                        loadToEdit={editingIndex === "new" ? null : loads[editingIndex]}
                        onClose={() => setEditingIndex(null)}
                        deliveries={deliveries}
                        loadsSmartSuggestionsMap={loadsSmartSuggestionsMap}
                    />
                )}
            </>
        );
    };
    return (
        <Box>
            {(loads.length > 0 || editingIndex) && (
                <Text variant="h1" mt={4} mb={3}>
                    {t("common.loads")}
                </Text>
            )}
            <FieldArray
                name="loads"
                render={(arrayHelpers) => renderLoadsFieldArray(arrayHelpers)}
            />
        </Box>
    );
};
