import {t} from "@dashdoc/web-core";
import {Box, Callout, Modal, Radio, Text, toast} from "@dashdoc/web-ui";
import React, {FC, useState} from "react";

import {TariffGrid} from "../types";

import {modalService} from "./modal.service";

type DuplicationModalProps = {
    tariffGrid: TariffGrid;
    onClose: () => unknown;
    afterDuplication: (tariffGrid: TariffGrid) => unknown;
};

export const DuplicationModal: FC<DuplicationModalProps> = ({
    tariffGrid,
    onClose,
    afterDuplication,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [clearCellValues, setClearCellValues] = useState<boolean>(false);

    return (
        <Modal
            title={t("tariffGrids.DuplicationModalTitle")}
            mainButton={{
                disabled: isLoading,
                children: t("components.duplicate"),
                "data-testid": "tariff-grid-duplication-modal-create-tariff-grid-button",
                onClick: async () => {
                    setIsLoading(true);
                    try {
                        const duplicated = await modalService.duplicate(
                            tariffGrid.uid,
                            tariffGrid.name,
                            clearCellValues
                        );
                        setIsLoading(false);
                        afterDuplication(duplicated);
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
            <Text variant="h1" color="grey.dark">
                {t("tariffGrids.duplicate.method")}
            </Text>

            <Box mt={4}>
                <Radio
                    key={"keepValues"}
                    name="keepValues"
                    label={t("tariffGrids.duplicate.keepValues")}
                    value={"keepValues"}
                    onChange={() => setClearCellValues(false)}
                    checked={!clearCellValues}
                    labelProps={{marginBottom: 0}}
                />
                {!clearCellValues && (
                    <Callout ml={4} iconDisabled>
                        <Text>{t("tariffGrids.duplicate.keepValuesDetails")}</Text>
                    </Callout>
                )}
            </Box>
            <Box mt={4}>
                <Radio
                    key={"clearValues"}
                    name="clearValues"
                    label={t("tariffGrids.duplicate.clearValues")}
                    value={"clearValues"}
                    onChange={() => setClearCellValues(true)}
                    checked={clearCellValues}
                    labelProps={{marginBottom: 0}}
                />
                {clearCellValues && (
                    <Callout ml={4} iconDisabled>
                        <Text>{t("tariffGrids.duplicate.clearValuesDetails")}</Text>
                    </Callout>
                )}
            </Box>
        </Modal>
    );
};
