import {t} from "@dashdoc/web-core";
import {Box, Modal, Text} from "@dashdoc/web-ui";
import {ImageViewer} from "@dashdoc/web-ui";
import React from "react";

import {utilsService} from "../../../../../../services/utils.service";

import {DocumentViewer} from "./DocumentViewer";

// this file base on frontend/src/app/features/document/document-modal.tsx

type Props = {
    url: string;
    label: string;
    onClose: () => void;
};

export function DocumentModal({url, label, onClose}: Props) {
    const download = utilsService.isDownload(url);
    return (
        <Modal
            title={`${t("components.attachedDocument")}${label}`}
            id="document-modal"
            size="xlarge"
            onClose={onClose}
            mainButton={null}
            secondaryButton={null}
        >
            <Box position="relative">
                <Box>
                    {download && (
                        <Text width="100%" textAlign="center">
                            {t("components.uploadingFile")}
                        </Text>
                    )}

                    {utilsService.isImage(url) ? (
                        <ImageViewer src={url} />
                    ) : (
                        <DocumentViewer url={url} onLoaded={handleLoaded} />
                    )}
                </Box>
            </Box>
        </Modal>
    );

    function handleLoaded() {
        if (download) {
            onClose();
        }
    }
}
