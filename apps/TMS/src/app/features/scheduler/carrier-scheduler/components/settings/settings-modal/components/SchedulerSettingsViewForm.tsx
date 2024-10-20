import {updateSettingsView} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {Logger, t} from "@dashdoc/web-core";
import {Tabs} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {forwardRef, useContext, useImperativeHandle} from "react";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {getDedicatedResourcesIdsParams} from "app/features/scheduler/carrier-scheduler/components/settings/resources/resources.service";
import {SchedulerCardSettings} from "app/features/scheduler/carrier-scheduler/components/settings/settings-modal/components/SchedulerCardSettings";
import {SchedulerGeneralSettings} from "app/features/scheduler/carrier-scheduler/components/settings/settings-modal/components/SchedulerGeneralSettings";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {
    SchedulerSettings,
    SchedulerSettingsView,
} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useDispatch} from "app/redux/hooks";
import {DEFAULT_SCHEDULER_CARD_SETTINGS} from "app/redux/selectors/manager";
import {SchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";

type SchedulerSettingsViewFormProps = {
    editingView: SchedulerSettingsView;
};
export const SchedulerSettingsViewForm = forwardRef(
    ({editingView}: SchedulerSettingsViewFormProps, ref) => {
        const dispatch = useDispatch();
        const {viewPk, selectView} = useContext(SchedulerViewContext);

        const resourceSettings = editingView?.settings.resource_settings ?? {};

        const formik = useFormik({
            initialValues: {
                cards: {
                    ...DEFAULT_SCHEDULER_CARD_SETTINGS,
                    ...(editingView?.settings.card_display_settings ?? {}),
                },
                general: {
                    resourceType: resourceSettings.view!,
                    resourcesUids: getResourceUids(resourceSettings.view, resourceSettings),
                    resourcesCustomIdOrder: resourceSettings.custom_id_order ?? [],
                    resourcesTags: getResourceTags(resourceSettings),
                    sort: getResourceSort(resourceSettings.view, resourceSettings),
                    extendedView: resourceSettings.extended_view ?? true,
                    label: editingView?.label ?? "",
                },
            },
            enableReinitialize: true,
            validationSchema: yup.object().shape({
                cards: yup.object().shape({
                    display_shipper_name: yup.boolean(),
                    display_activities: yup.boolean(),
                    activity_list_mode: yup.string().oneOf(["expand", "collapsed"]),
                    display_activity_type: yup.boolean(),
                    display_means: yup.boolean(),
                    display_vehicle_requested: yup.boolean(),
                    display_global_instructions: yup.boolean(),
                    display_tags: yup.boolean(),
                    display_tag_text: yup.boolean(),
                }),
                general: yup.object().shape({
                    resourceType: yup
                        .string()
                        .oneOf([
                            "trucker",
                            "vehicle",
                            "trailer",
                            "chartering",
                            "dedicated_resources",
                        ]),
                    resourcesUids: yup.array(yup.string()),
                    resourcesTags: yup.array(yup.string()),
                    sort: yup.string(),
                    extendedView: yup.boolean(),
                    label: yup.string().required(t("common.field_required")),
                }),
            }),
            onSubmit: handleSubmit,
        });

        useImperativeHandle(ref, () => ({
            isDirty: formik?.dirty ?? false,
        }));

        return (
            <form id="settings-view-form" onSubmit={formik.handleSubmit} style={{width: "100%"}}>
                <Tabs
                    tabs={[
                        {
                            label: t("common.general"),
                            testId: "scheduler-settings-general",
                            content: (
                                <SchedulerGeneralSettings
                                    values={formik.values.general}
                                    setFieldValue={(field, value) =>
                                        formik.setFieldValue(`general.${field}`, value)
                                    }
                                    errors={formik.errors.general}
                                />
                            ),
                        },
                        {
                            label: t("scheduler.cardsSettings"),
                            testId: "scheduler-settings-cards",
                            content: (
                                <SchedulerCardSettings
                                    key={editingView.pk}
                                    viewMode={formik.values.general.resourceType ?? "trucker"}
                                    values={formik.values.cards}
                                    setFieldValue={(field, value) =>
                                        formik.setFieldValue(`cards.${field}`, value)
                                    }
                                />
                            ),
                        },
                    ]}
                />
            </form>
        );

        async function handleSubmit() {
            if (editingView.pk) {
                const updatedView: SchedulerSettingsView = {
                    pk: editingView.pk,
                    category: "scheduler",
                    label: formik.values.general.label,
                    settings: {
                        resource_settings: getResourceSettingsToUpdate(
                            formik.values.general.resourceType,
                            formik.values.general.resourcesUids,
                            formik.values.general.resourcesTags,
                            formik.values.general.sort,
                            formik.values.general.extendedView
                        ),
                        card_display_settings: formik.values.cards,
                    },
                };
                try {
                    await dispatch(
                        updateSettingsView({
                            id: editingView.pk,
                            data: updatedView,
                            successMessage: t("scheduler.updatedSchedulerSettings"),
                        })
                    );
                    if (editingView.pk === viewPk) {
                        selectView(updatedView);
                    }
                } catch (error) {
                    Logger.error(error);
                }
            }
        }
    }
);
SchedulerSettingsViewForm.displayName = "SchedulerSettingsViewForm";

function getResourceUids(
    resourceType: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined,
    currentQuery: SchedulerFilters
) {
    let truckerUidsForDedicatedResources: string[] = [];
    let vehicleUidsForDedicatedResources: string[] = [];
    let trailerUidsForDedicatedResources: string[] = [];
    switch (resourceType) {
        case "trucker":
            return currentQuery.trucker__in ?? [];
        case "vehicle":
            return currentQuery.vehicle__in ?? [];
        case "trailer":
            return currentQuery.trailer__in ?? [];
        case "chartering":
            return currentQuery.carrier__in ?? [];
        case "dedicated_resources":
            if (currentQuery.trucker__in) {
                truckerUidsForDedicatedResources = currentQuery.trucker__in.map(
                    (uid) => `trucker-${uid}`
                );
            }

            if (currentQuery.vehicle__in) {
                vehicleUidsForDedicatedResources = currentQuery.vehicle__in.map(
                    (uid) => `vehicle-${uid}`
                );
            }

            if (currentQuery.trailer__in) {
                trailerUidsForDedicatedResources = currentQuery.trailer__in.map(
                    (uid) => `trailer-${uid}`
                );
            }
            return [
                ...truckerUidsForDedicatedResources,
                ...vehicleUidsForDedicatedResources,
                ...trailerUidsForDedicatedResources,
            ];
        default:
            return [];
    }
}

function getResourceTags(currentQuery: SchedulerFilters) {
    return currentQuery.fleet_tags__in ?? [];
}

function getResourceSort(
    resourceType: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined,
    currentQuery: SchedulerFilters
) {
    switch (resourceType) {
        case "trucker":
            return currentQuery.ordering_truckers;
        case "vehicle":
            return currentQuery.ordering_vehicles;
        case "trailer":
            return currentQuery.ordering_trailers;
        default:
            return undefined;
    }
}
function getResourceSettingsToUpdate(
    resourceType: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined,
    resourceUids: string[],
    resourceTags: string[],
    sort: string | undefined,
    extendedView: boolean
): SchedulerSettings["resource_settings"] {
    let resourceQuery = {};
    switch (resourceType) {
        case "trucker":
            resourceQuery = {
                trucker__in: resourceUids,
                fleet_tags__in: resourceTags,
                ordering_truckers: sort,
            };
            break;
        case "vehicle":
            resourceQuery = {
                vehicle__in: resourceUids,
                fleet_tags__in: resourceTags,
                ordering_vehicles: sort,
            };
            break;
        case "trailer":
            resourceQuery = {
                trailer__in: resourceUids,
                fleet_tags__in: resourceTags,
                ordering_trailers: sort,
            };
            break;
        case "chartering":
            resourceQuery = {carrier__in: resourceUids};
            break;
        case "dedicated_resources":
            // resourceUids is a list of string in the form "resource_type-pk"
            resourceQuery = getDedicatedResourcesIdsParams(resourceUids);
            break;
    }
    return {
        trucker__in: [],
        vehicle__in: [],
        trailer__in: [],
        carrier__in: [],
        fleet_tags__in: [],
        ordering_truckers: "user",
        ordering_vehicles: "license_plate",
        ordering_trailers: "license_plate",
        view: resourceType,
        extended_view: extendedView,
        custom_id_order: resourceUids,
        ...resourceQuery,
    };
}
