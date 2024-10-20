import {t} from "@dashdoc/web-core";
import {Modal, Tabs} from "@dashdoc/web-ui";
import React from "react";

import {CodeTab} from "./CodeTab";
import {NotificationsTab} from "./notifications-tab/NotificationsTab";
import {ShareDeliveryTrackingLinkTab} from "./ShareDeliveryTrackingLinkTab";
import {TransportVisibilityTab} from "./transport-visibility-tab/TransportVisibilityTab";

import type {Site, Transport} from "app/types/transport";

export type SharingTabId =
    | "visibility-tab"
    | "notifications-tab"
    | "transport-code-tab"
    | "tracking-link-tab";

type Props = {
    transport: Transport;
    sites: Site[];
    onClose: () => void;
    initialTab?: SharingTabId;
};

export const ShareTransportModal = (props: Props) => {
    const {transport, sites, onClose, initialTab} = props;

    const tabs = [
        {
            label: t("transportDetails.shareTransportModal.visibilityTabTitle"),
            testId: "visibility-tab",
            content: <TransportVisibilityTab transport={transport} />,
        },
        {
            label: t("transportDetails.emailNotifications"),
            testId: "notifications-tab",
            content: <NotificationsTab transport={transport} sites={sites} onClose={onClose} />,
        },
        {
            label: t("transportDetails.shareTransportModal.transportCodeTabTitle"),
            testId: "transport-code-tab",
            content: <CodeTab transport={transport} />,
        },
        {
            label: t("transportDetails.shareTransportModal.shareDeliveryTrackingLinkTabTitle"),
            testId: "tracking-link-tab",
            content: <ShareDeliveryTrackingLinkTab transport={transport} />,
        },
    ];

    let initialActiveTab = tabs.findIndex((tab) => tab.testId === initialTab);
    if (initialActiveTab === -1) {
        initialActiveTab = 0;
    }

    return (
        <Modal
            title={t("transportDetails.shareTransportModal.title")}
            onClose={onClose}
            mainButton={null}
            size="large"
            data-testid="share-transport-modal"
        >
            <Tabs tabs={tabs} initialActiveTab={initialActiveTab} />
        </Modal>
    );
};
