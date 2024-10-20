import {useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import {Tag, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {TagSection} from "app/features/core/tags/TagSection";
import {SelectedTransportsCountCallout} from "app/features/transport/actions/bulk/SelectedTransportsCountCallout";
import {fetchBulkRemoveTagsFromTransport} from "app/redux/actions/transports";
import {SearchQuery} from "app/redux/reducers/searches";

type BulkRemoveTagsModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
};

export const BulkRemoveTagsModal: FunctionComponent<BulkRemoveTagsModalProps> = ({
    selectedTransportsCount,
    selectedTransportsQuery,
    onClose,
}) => {
    const [isLoading, startLoading, stopLoading] = useToggle(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const dispatch = useDispatch();

    async function handleSubmit() {
        startLoading();
        dispatch(await fetchBulkRemoveTagsFromTransport(tags, selectedTransportsQuery));
        stopLoading();
        onClose();
    }

    return (
        <Modal
            title={t("bulkAction.removeTags.modalTitle")}
            id="bulk-add-tags-modal"
            onClose={onClose}
            mainButton={{
                children: t("bulkAction.removeTags.modalConfirmButton"),
                // disabled: tags.length === 0,
                loading: isLoading,
                onClick: () => handleSubmit(),
                severity: "warning",
            }}
            secondaryButton={{type: "button", onClick: onClose}}
        >
            {!isLoading && (
                <>
                    <SelectedTransportsCountCallout
                        selectedTransportsCount={selectedTransportsCount}
                        variant="warning"
                    />

                    <Text my={4}>{t("bulkAction.removeTags.informationText")}</Text>

                    <Box minWidth="25rem">
                        <TagSection
                            tags={tags}
                            onDelete={(tag) => setTags(tags.filter((t) => t.name !== tag.name))}
                            onAdd={(tag) => setTags([...tags, tag])}
                        />
                    </Box>
                </>
            )}
            {isLoading && <LoadingWheel noMargin />}
        </Modal>
    );
};
