import {t} from "@dashdoc/web-core";
import {Modal, toast, TextInput} from "@dashdoc/web-ui";
import React, {FC, useMemo, useState} from "react";

import {TariffGrid} from "../types";

import {modalService} from "./modal.service";

type RenameModalProps = {
    tariffGrid: TariffGrid;
    onClose: () => unknown;
    afterRename: () => unknown;
};

export const RenameModal: FC<RenameModalProps> = ({tariffGrid, onClose, afterRename}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [name, setName] = useState(tariffGrid.name);
    const isMainButtonDisabled = useMemo(() => isLoading || name === "", [isLoading, name]);
    return (
        <Modal
            title={t("tariffGrids.RenameModalTitle")}
            mainButton={{
                disabled: isMainButtonDisabled,
                children: t("common.rename"),
                "data-testid": "tariff-grid-rename-modal-tariff-grid-button",
                onClick: async () => {
                    setIsLoading(true);
                    try {
                        await modalService.rename(tariffGrid.uid, name);
                        setIsLoading(false);
                        afterRename();
                    } catch (e) {
                        toast.error(t("common.error"));
                        setIsLoading(false);
                    }
                },
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
        >
            <TextInput
                required={true}
                data-testid={"tariff-grid-creation-modal-name-input"}
                label={t("tariffGrids.TariffGridName")}
                value={name}
                onChange={(newValue) => {
                    setName(newValue);
                }}
            />
        </Modal>
    );
};
