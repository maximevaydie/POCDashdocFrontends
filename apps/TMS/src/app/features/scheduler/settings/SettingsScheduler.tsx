import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getGroupView,
    updateGroupViewSettings,
    useDispatch,
    useSelector,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Checkbox,
    ErrorMessage,
    Flex,
    Modal,
    ModeDescription,
    ModeTypeSelector,
    Text,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

import {SchedulerByTimeFindOutMore} from "./find-out-more-scheduler-by-time/SchedulerByTimeFindOutMore";

type SchedulerModeChoice = "byTime" | "byDay";

export function SettingsScheduler({fromGroupView}: {fromGroupView?: boolean}) {
    const groupView = useSelector(getGroupView);
    const companyName = useSelector((state) => getConnectedCompany(state)?.name ?? "");
    const schedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const [schedulerMode, setSchedulerMode] = useState<SchedulerModeChoice>(
        schedulerByTimeEnabled ? "byTime" : "byDay"
    );
    const [isModalOpened, openModal, closeModal] = useToggle();
    const schedulerModeChoices: ModeDescription<SchedulerModeChoice>[] = useMemo(
        () => [
            {
                value: "byTime",
                label: t("settings.scheduler.byTimeMode"),
                icon: "workflowGanttChart",
            },
            {
                value: "byDay",
                label: t("settings.scheduler.byDayMode"),
                icon: "layoutGrid",
            },
        ],
        []
    );
    return (
        <Box p={3}>
            <Text variant="title" mb={3}>
                {t("sidebar.scheduler")}
            </Text>
            {fromGroupView ? (
                <Callout variant="danger" mb={3}>
                    {t("settings.scheduler.activationFromGroupView", {
                        group_view_name: groupView?.name,
                        company_count: groupView?.companies.length,
                    })}
                </Callout>
            ) : (
                <Text mb={3}>
                    {t("settings.scheduler.activationFromCompany", {company_name: companyName})}
                </Text>
            )}
            <Text variant="h1" mb={3}>
                {t("settings.schedulerMode")}
            </Text>
            <ModeTypeSelector
                modeList={schedulerModeChoices}
                currentMode={schedulerMode}
                setCurrentMode={setSchedulerMode}
            />
            <Text mt={1}>
                {schedulerMode === "byTime"
                    ? t("settings.schedulerMode.byTime.details")
                    : t("settings.schedulerMode.byDay.details")}
            </Text>
            {schedulerMode === "byTime" && <SchedulerByTimeFindOutMore fromSettings />}
            <Flex justifyContent="flex-end" mt={4}>
                <Button onClick={openModal}>{t("common.save")}</Button>
            </Flex>
            {isModalOpened && (
                <SwitchSchedulerModeModal
                    mode={schedulerMode}
                    onClose={closeModal}
                    fromGroupView={fromGroupView}
                />
            )}
        </Box>
    );
}

function SwitchSchedulerModeModal({
    mode,
    onClose,
    fromGroupView,
}: {
    mode: SchedulerModeChoice;
    onClose: () => void;
    fromGroupView?: boolean;
}) {
    const [understoodAllGroupView, setUnderstoodGroupView] = useState(false);
    const [understoodOrder, setUnderstoordOrder] = useState(mode === "byDay");
    const [error, setError] = useState<string | null>(null);
    const groupViewId = useSelector((state) => getConnectedCompany(state)?.group_view_id);
    const groupView = useSelector(getGroupView);

    const dispatch = useDispatch();
    if (!groupViewId) {
        return;
    }
    return (
        <Modal
            title={
                mode === "byTime"
                    ? t("settings.switchToSchedulerByTime.title")
                    : t("settings.switchToSchedulerByDay.title")
            }
            onClose={onClose}
            mainButton={{
                onClick: save,
                severity: fromGroupView ? "danger" : "warning",
                children:
                    mode === "byTime"
                        ? t("settings.switchToSchedulerByTime.submitLabel")
                        : t("settings.switchToSchedulerByDay.submitLabel"),
            }}
            secondaryButton={{
                onClick: onClose,
            }}
        >
            <Callout variant={fromGroupView ? "danger" : "warning"} mb={3}>
                {fromGroupView
                    ? t("settings.switchSchedulerMode.allCompanyUsers", {
                          group_view_name: groupView?.name,
                          company_count: groupView?.companies.length,
                      })
                    : t("settings.switchSchedulerMode.allUsers")}
            </Callout>
            {mode === "byTime" && (
                <Text mb={3}>{t("settings.switchToSchedulerByTime.order")}</Text>
            )}

            <Checkbox
                checked={understoodAllGroupView}
                onChange={setUnderstoodGroupView}
                label={
                    fromGroupView
                        ? t("settings.scheduler.understood.groupview", {
                              group_view_name: groupView?.name,
                              company_count: groupView?.companies.length,
                          })
                        : t("settings.scheduler.understood.company")
                }
            />
            {mode === "byTime" && (
                <Checkbox
                    checked={understoodOrder}
                    onChange={setUnderstoordOrder}
                    label={t("settings.scheduler.understood.order")}
                />
            )}
            {error ? <ErrorMessage error={error} /> : null}
        </Modal>
    );

    async function save() {
        if (!understoodAllGroupView || !understoodOrder) {
            setError(t("settings.scheduler.checkUnderstood"));
            return;
        }
        await dispatch(
            updateGroupViewSettings({
                groupViewId: groupViewId as number,
                settings: {scheduler_by_time: mode === "byTime"},
            })
        );
        analyticsService.sendEvent(AnalyticsEvent.schedulerModeUpdate, {
            "groupview id": groupViewId,
            "scheduler mode": mode,
        });
        onClose();
    }
}
