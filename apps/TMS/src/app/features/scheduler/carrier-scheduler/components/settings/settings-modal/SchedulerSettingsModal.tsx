import {settingsViewSelector} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {t} from "@dashdoc/web-core";
import {Callout, ConfirmationModal, Flex, Modal, Text, useDevice} from "@dashdoc/web-ui";
import React, {useContext, useRef, useState} from "react";

import {SchedulerSettingsViewForm} from "app/features/scheduler/carrier-scheduler/components/settings/settings-modal/components/SchedulerSettingsViewForm";
import {SchedulerSettingsViewSidebar} from "app/features/scheduler/carrier-scheduler/components/settings/settings-modal/components/SchedulerSettingsViewSidebar";
import {SchedulerSettingsView} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import {useSelector} from "app/redux/hooks";
import {SchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";

type SchedulerCardSettingsModalProps = {
    onClose: () => void;
};
export function SchedulerSettingsModal({onClose}: SchedulerCardSettingsModalProps) {
    const isMobileDevice = useDevice() === "mobile";
    const {viewPk} = useContext(SchedulerViewContext);
    const [editingViewPk, setEditingViewPk] = useState<number | undefined>(viewPk);
    const editingView = useSelector(
        (state) => settingsViewSelector(state, editingViewPk) as SchedulerSettingsView | undefined
    );

    const formRef = useRef<{
        isDirty: boolean;
    }>({isDirty: false});

    const [viewToCancelUpdates, setSaveConfirmationModal] = useState<SchedulerSettingsView>();
    const [confirmDiscardChanges, setConfirmDiscardChanges] = useState<boolean>(false);

    return (
        <>
            <Modal
                title={<Text variant="h1">{t("scheduler.settings.title")}</Text>}
                id="scheduler-settings-modal"
                onClose={() => {
                    if (formRef.current?.isDirty) {
                        setConfirmDiscardChanges(true);
                        return;
                    }
                    onClose();
                }}
                preventClosingByMouseClick={true}
                size="large"
                mainButton={
                    editingView
                        ? {
                              children: t("common.save"),
                              type: "submit",
                              form: "settings-view-form",
                              "data-testid": "scheduler-settings-modal-submit",
                          }
                        : null
                }
                data-testid="scheduler-settings-modal"
                width={isMobileDevice ? undefined : "1200px"}
            >
                <Callout mb={5}>{t("scheduler.settings.indications")}</Callout>
                <Flex
                    backgroundColor="grey.ultralight"
                    borderBottom="1px solid"
                    borderTop="1px solid"
                    borderColor="grey.light"
                    height="67vh"
                    overflowY="auto"
                >
                    <Flex flex="0 0 220px" backgroundColor="white">
                        <SchedulerSettingsViewSidebar
                            selectedViewPk={editingView?.pk}
                            setSelectedView={setSelectedView}
                        />
                    </Flex>
                    <Flex flex={1} minWidth="600px">
                        {editingView && (
                            <SchedulerSettingsViewForm
                                ref={formRef}
                                key={editingView.pk}
                                editingView={editingView}
                            />
                        )}
                    </Flex>
                </Flex>
            </Modal>
            {viewToCancelUpdates && (
                <ConfirmationModal
                    title={t("filteringView.updatesNotSaved")}
                    confirmationMessage={t("filteringView.updatesNotSaved.confirmationMessage")}
                    mainButton={{
                        children: t("filteringView.updatesNotSaved.confirm"),
                        onClick: () => {
                            setSelectedView(viewToCancelUpdates, true);
                            setSaveConfirmationModal(undefined);
                        },
                    }}
                    secondaryButton={{}}
                    onClose={() => setSaveConfirmationModal(undefined)}
                    data-testid="scheduler-settings-confirmation-modal"
                />
            )}
            {confirmDiscardChanges && (
                <ConfirmationModal
                    title={t("filteringView.updatesNotSaved")}
                    confirmationMessage={t("filteringView.updatesNotSaved.confirmationMessage")}
                    mainButton={{
                        children: t("filteringView.updatesNotSaved.confirm"),
                        onClick: () => {
                            onClose();
                        },
                    }}
                    secondaryButton={{}}
                    onClose={() => setConfirmDiscardChanges(false)}
                    data-testid="scheduler-settings-confirmation-modal"
                />
            )}
        </>
    );

    function setSelectedView(view: SchedulerSettingsView | undefined, force?: boolean) {
        if (formRef.current?.isDirty && !force) {
            setSaveConfirmationModal(view);
        } else {
            setEditingViewPk(view?.pk);
        }
    }
}
