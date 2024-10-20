import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon, Modal, Text} from "@dashdoc/web-ui";
import {TelematicConnector, useToggle} from "dashdoc-utils";
import capitalize from "lodash.capitalize";
import React from "react";

type Props = {
    telematic: TelematicConnector;
    onDelete: () => void;
};

export function DeleteTelematicAction({telematic, onDelete}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    return (
        <>
            <Button
                variant="secondary"
                onClick={handleDelete}
                data-testid="settings-telematic-delete"
                disabled={!telematic.enabled}
            >
                <Icon name="bin" />
            </Button>
            {isModalOpen && (
                <Modal
                    id="add-telematic-modal"
                    title={t("settings.telematicDeleted")}
                    onClose={closeModal}
                    mainButton={{
                        children: t("common.confirmUnderstanding"),
                        onClick: closeModal,
                    }}
                    secondaryButton={null}
                >
                    <Text>{t("settings.telematicDeletedExplanation")}</Text>
                </Modal>
            )}
        </>
    );

    async function handleDelete() {
        const confirmation = confirm(
            t("settings.confirmTelematicDeletion", {vendorName: capitalize(telematic.vendor_name)})
        );
        if (confirmation) {
            await apiService.delete(`/telematics/links/${telematic.id}/`, {apiVersion: "v4"});
            onDelete();
            openModal();
        }
    }
}
