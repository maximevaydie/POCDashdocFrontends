import {
    addressDisplayService,
    getConnectedManagerId,
    NewAddressBadge,
    SuggestedAddress,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, NoWrap, ReorderEditableItemList, Text} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import {
    getSiteZonedAskedDateTimes,
    Address,
    ExtractedNewAddress,
    OriginalAddress,
} from "dashdoc-utils";
import {FieldArrayRenderProps, FormikErrors, useFormikContext} from "formik";
import {max, min} from "lodash";
import isNil from "lodash.isnil";
import React, {FunctionComponent, useContext} from "react";
import {useSelector} from "react-redux";

import {confirmationExtractedDataService} from "app/services/transport";

import {InconsistentDatesIcon} from "../../dates/InconsistentDatesIcon";
import {TransportFormContext} from "../transport-form-context";
import {getInitialActivityData} from "../transport-form-initial-values";
import {tagColors, TransportFormActivity, TransportFormValues} from "../transport-form.types";

import {ActivityFormPanel} from "./ActivityFormPanel";

type ActivitiesOverviewProps = {
    field: "loadings" | "unloadings";
    editingIndex: number | null | "new";
    setEditingIndex: (value: number | null | "new") => void;
    fillSuggestedAddresses: (_field: string, addressPk: number, addressName: string) => void;
    suggestedAddresses: SuggestedAddress[];
    confirmationExtractedAddresses: (OriginalAddress | ExtractedNewAddress)[];
    confirmationExtractedCodes: string[];
    confirmationExtractedSlots: string[][];
};
export const ActivitiesOverview: FunctionComponent<ActivitiesOverviewProps> = ({
    field,
    editingIndex,
    setEditingIndex,
    fillSuggestedAddresses,
    suggestedAddresses,
    confirmationExtractedAddresses,
    confirmationExtractedCodes,
    confirmationExtractedSlots,
}) => {
    const {values, setFieldValue, touched, errors} = useFormikContext<TransportFormValues>();
    const {transportShape} = useContext(TransportFormContext);

    const managerPk = useSelector(getConnectedManagerId);

    const [activities, loads, supportExchanges, activitiesErrors, isTouched] = [
        values[field],
        values.loads,
        values.supportExchanges,
        errors[field],
        !!touched[field],
    ];

    const isCreated =
        activities.length > 1 || activities.findIndex((activity) => !isNil(activity.address)) >= 0;
    const title =
        field === "loadings"
            ? t("common.pickup")
            : isCreated || editingIndex
            ? t("common.delivery")
            : null;
    const timezone = useTimezone();

    const reorderActivities = (reorderedActivities: Array<TransportFormActivity>) => {
        setFieldValue(field, [...reorderedActivities]);
    };
    const deleteActivity = (
        activity: TransportFormActivity,
        index: number,
        arrayHelpers: FieldArrayRenderProps
    ) => {
        if (activities.length === 1) {
            arrayHelpers.replace(0, {
                // @ts-ignore
                ...getInitialActivityData(managerPk.toString(), activity.type),
                uid: activity.uid,
            });
            return;
        }
        arrayHelpers.remove(index);
    };

    const getItemContentToDisplay = (activity: TransportFormActivity, index: number) => {
        const {zonedStart, zonedEnd} = getSiteZonedAskedDateTimes(activity, timezone);
        let addressLabel = activity.address?.name;
        if (
            (activity.address as Address)?.company &&
            (activity.address as Address)?.company?.name !== addressLabel
        ) {
            addressLabel = (activity.address as Address)?.company?.name + " - " + addressLabel;
        }

        const addressToDisplay = addressDisplayService.getActivityAddressLabel(
            activity.address ?? null
        );
        const loadCount = loads.filter(
            (load) =>
                load.delivery[field === "loadings" ? "loadingActivity" : "unloadingActivity"]
                    .uid === activity.uid
        ).length;
        const supportExchangeCount = supportExchanges.filter(
            (support) => support.activity.uid === activity.uid
        ).length;
        let loadSupportLabel =
            loadCount && transportShape !== "simple"
                ? loadCount + " " + t("transportsForm.load", {smart_count: loadCount})
                : "";
        if (supportExchangeCount) {
            if (loadSupportLabel) {
                loadSupportLabel += " - ";
            }
            loadSupportLabel +=
                supportExchangeCount +
                " " +
                t("transportForm.supportExchange", {
                    smart_count: supportExchangeCount,
                });
        }
        const indexOfAllActivities =
            field === "loadings" ? index : index + values["loadings"].length;
        const isInconsistent =
            activity.slots?.[0]?.end &&
            [...values["loadings"], ...values["unloadings"]]
                .slice(0, indexOfAllActivities)
                .some((a) => a.slots?.[0]?.start > activity.slots?.[0]?.end);
        return (
            <>
                {activity.automaticallySetFromConfirmation && (
                    <Flex
                        bg="blue.ultralight"
                        width="28px"
                        height="28px"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="50%"
                        borderStyle="solid"
                        borderColor="blue.default"
                        marginLeft={-6}
                        marginRight={1}
                        marginTop={-8}
                    >
                        <Icon name="robot" color="blue.default" />
                    </Flex>
                )}

                <Box flex={1}>
                    <Flex>
                        <Text variant="h1">{addressLabel}</Text>
                    </Flex>
                    <Text variant="caption" color="grey.dark">
                        {addressToDisplay}
                    </Text>
                </Box>
                <Box width="35%">
                    {activity.address && !("created_by" in activity.address) && (
                        <Flex>
                            <NewAddressBadge />
                        </Flex>
                    )}
                    {zonedStart && (
                        <Flex alignItems="center">
                            <Text color="grey.dark" variant="caption" mr={1}>
                                <DateAndTime
                                    zonedDateTimeMin={zonedStart}
                                    zonedDateTimeMax={zonedEnd}
                                    wrap={false}
                                />
                            </Text>
                            {isInconsistent && <InconsistentDatesIcon />}
                        </Flex>
                    )}
                    {loadSupportLabel && (
                        <NoWrap
                            color={
                                activities.length > 1 ||
                                (activities.length === 1 &&
                                    field === "loadings" &&
                                    transportShape === "simple")
                                    ? tagColors[index % tagColors.length] + ".dark"
                                    : "grey.ultradark"
                            }
                            backgroundColor={
                                activities.length > 1 ||
                                (activities.length === 1 &&
                                    field === "loadings" &&
                                    transportShape === "simple")
                                    ? tagColors[index % tagColors.length] + ".ultralight"
                                    : "grey.light"
                            }
                            p={1}
                            fontSize={0}
                            width="170px"
                            textAlign="center"
                            borderRadius={1}
                        >
                            {loadSupportLabel}
                        </NoWrap>
                    )}
                </Box>
            </>
        );
    };

    const getItemError = (_: TransportFormActivity, index: number) => {
        // @ts-ignore
        if (
            isTouched &&
            activitiesErrors !== undefined && // helping typescript
            activitiesErrors?.length > index &&
            activitiesErrors[index]
        ) {
            return (
                t("common.address") +
                ": " +
                (
                    activitiesErrors[index] as FormikErrors<{
                        address: string;
                    }>
                )?.address
            );
        }
        return null;
    };

    const addFirstItemContent = (
        <>
            <Text mb={3} color="grey.dark">
                {t("transportForm.addAtLeastOnUnloading")}
            </Text>
            <Text color="grey.dark" variant="caption">
                {t("transportForm.addElementAdvice")}
            </Text>
            <Text color="grey.dark" variant="caption" fontWeight={300} lineHeight={0}>
                {t("transportForm.shortcutAdvice")}
            </Text>
        </>
    );

    const activityConfirmationExtractedSlot =
        confirmationExtractedDataService.selectActivityConfirmationExtractedSlot(
            confirmationExtractedSlots,
            editingIndex,
            field,
            values["loadings"],
            values["unloadings"]
        );

    const getEditionElement = (arrayHelpers: FieldArrayRenderProps) => {
        let indexOnAllActivities =
            editingIndex == "new" ? values[field].length : editingIndex ?? 0;
        if (field === "unloadings") {
            indexOnAllActivities += values["loadings"].length;
        }

        const minDate = max(
            [...values["loadings"], ...values["unloadings"]]
                .slice(0, indexOnAllActivities)
                .map((a) => a.slots?.[0]?.end)
                .filter((v) => !!v)
        );
        const maxDate = min(
            [...values["loadings"], ...values["unloadings"]]
                .slice(indexOnAllActivities + 1)
                .map((a) => a.slots?.[0]?.start)
                .filter((v) => !!v)
        );
        return (
            <ActivityFormPanel
                // @ts-ignore
                activity={editingIndex === "new" ? null : activities[editingIndex]}
                activityType={field === "loadings" ? "loading" : "unloading"}
                onSubmit={(value) => {
                    value.automaticallySetFromConfirmation = false;
                    if (activities.length === 1 && isNil(activities[0].address)) {
                        arrayHelpers.replace(0, {
                            ...value,
                            uid: activities[0].uid,
                        });
                    } else {
                        editingIndex === "new"
                            ? arrayHelpers.push({
                                  ...value,
                                  type: field === "loadings" ? "loading" : "unloading",
                              })
                            : // @ts-ignore
                              arrayHelpers.replace(editingIndex, value);
                    }
                    const previousAddress =
                        // @ts-ignore
                        editingIndex === "new" ? null : activities[editingIndex]?.address;
                    // @ts-ignore
                    if (value.address && previousAddress?.pk !== value.address?.pk) {
                        fillSuggestedAddresses(
                            field === "loadings" ? "origin_address" : "destination_address",
                            // @ts-ignore
                            value.address.pk,
                            // @ts-ignore
                            value.address.name
                        );
                    }
                }}
                suggestedAddresses={suggestedAddresses}
                confirmationExtractedAddresses={confirmationExtractedAddresses}
                confirmationExtractedCodes={confirmationExtractedCodes}
                activityConfirmationExtractedSlot={activityConfirmationExtractedSlot}
                onClose={() => setEditingIndex(null)}
                minDate={minDate}
                maxDate={maxDate}
            />
        );
    };

    return (
        <>
            {title && (
                <Text variant="h1" mt={4}>
                    {title}
                </Text>
            )}
            <ReorderEditableItemList
                formikFieldName={field}
                items={isCreated ? activities : []}
                getItemContentToDisplay={getItemContentToDisplay}
                getDraggableItemId={(activity) => activity.uid}
                droppableId={`activities-${field}`}
                getItemDataTestId={(activity) => `${activity.type}-activity-card`}
                getItemError={getItemError}
                onReorderItems={reorderActivities}
                editingIndex={editingIndex}
                onClickItem={setEditingIndex}
                getEditionElement={getEditionElement}
                onDeleteItem={deleteActivity}
                deleteConfirmation={{
                    title: t("components.deleteActivity"),
                    message: t("components.deleteActivityAlert"),
                }}
                showAddButton={!isCreated && field === "loadings"}
                addButtonContent={addFirstItemContent}
                addingItemPlaceholderLabel={
                    field === "loadings"
                        ? t("transportForm.newLoading")
                        : t("transportForm.newUnloading")
                }
                error={
                    isTouched &&
                    activities.length > 0 &&
                    !editingIndex &&
                    !isCreated &&
                    activitiesErrors
                        ? (
                              activitiesErrors?.[0] as FormikErrors<{
                                  address: string;
                              }>
                          )?.address || t("common.mandatoryField")
                        : undefined
                }
            />
        </>
    );
};
