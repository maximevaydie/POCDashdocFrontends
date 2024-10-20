import {t} from "@dashdoc/web-core";
import {ClickableFlex, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {ExportModal} from "features/export/modal/ExportModal";
import React from "react";
import {Site} from "types";

type Props = {
    site: Site;
};
export function ExportAction({site}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    return (
        <>
            <ClickableFlex mx={3} onClick={openModal} p={4}>
                <Text color="blue.default">{t("flow.export_data")}</Text>
            </ClickableFlex>
            {isModalOpen && <ExportModal site={site} onClose={closeModal} />}
        </>
    );
}
