import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, IconButton, Callout, Text, Link} from "@dashdoc/web-ui";
import {TrackDechets, TrackDechetsApi} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

import {
    TrackDechetsCreateModal,
    TrackDechetsDeleteModal,
    trackDechetsToExtraDocumentRow,
} from "app/features/transport/track-dechets/track-dechets";
import {TransportDocumentsPanel} from "app/features/transport/transport-details/transport-documents-panel";

import type {Transport} from "app/types/transport";

type Props = {transport: Transport; readOnly: boolean; hasTrackDechetEnabled: boolean};

const trackDechetsApi = new TrackDechetsApi(apiService);

export function TransportDocumentsPanelWithTrackDechets({
    transport,
    readOnly,
    hasTrackDechetEnabled,
}: Props) {
    const [hasTrackDechetConnector, setHasTrackDechetConnector] = useState(false);
    const [trackDechetsModalOpen, setTrackDechetsModalOpen] = useState<null | "create" | "delete">(
        null
    );
    const [trackDechets, setTrackDechets] = useState<TrackDechets | null>(null);

    useEffect(() => {
        const init = async () => {
            if (hasTrackDechetEnabled) {
                const response = await trackDechetsApi.fetchHasTrackDechetsConnector();
                setHasTrackDechetConnector(response);
                try {
                    const response = await trackDechetsApi.fetchGetTrackDechets(transport.uid);
                    setTrackDechets(response);
                } catch (error) {
                    setTrackDechets(null);
                }
            }
        };
        init();
    }, []);
    return (
        <>
            <Flex>
                <Text variant="h1" mb={3} flexGrow={1}>
                    {t("components.documentsPhotos")}
                </Text>
                {hasTrackDechetConnector && (
                    <IconButton
                        data-testid={`documents-photos-link-waste-manifest`}
                        ml={4}
                        disabled={trackDechets !== null}
                        onClick={() => {
                            setTrackDechetsModalOpen("create");
                        }}
                        name="recyclingTrashBin"
                        label={t("trackdechets.createLink")}
                    />
                )}
            </Flex>
            {trackDechets && (
                <Callout mt={3}>
                    {t("trackdechets.linkEstablished", {
                        wasteManifest: trackDechets.readable_id,
                    })}
                    <Link ml={1} onClick={() => setTrackDechetsModalOpen("delete")}>
                        {t("trackdechets.deleteLink")}
                    </Link>
                </Callout>
            )}
            <TransportDocumentsPanel
                transport={transport}
                readOnly={readOnly}
                extraRows={
                    trackDechets
                        ? [trackDechetsToExtraDocumentRow(trackDechets, transport)]
                        : undefined
                }
                maxFileSize={10485760} //This value should be the same as DATA_UPLOAD_MAX_MEMORY_SIZE in the backend
            />

            {trackDechetsModalOpen === "create" && (
                <TrackDechetsCreateModal
                    transport={transport}
                    onSubmit={(trackdechets) => {
                        setTrackDechets(trackdechets);
                        setTrackDechetsModalOpen(null);
                    }}
                    onClose={() => {
                        setTrackDechetsModalOpen(null);
                    }}
                />
            )}
            {trackDechetsModalOpen === "delete" && trackDechets && (
                <TrackDechetsDeleteModal
                    trackDechets={trackDechets}
                    onSubmit={async () => {
                        setTrackDechets(null);
                        setTrackDechetsModalOpen(null);
                    }}
                    onClose={() => {
                        setTrackDechetsModalOpen(null);
                    }}
                />
            )}
        </>
    );
}
