import {ErrorBoundary} from "@dashdoc/web-common";
import {dateService} from "@dashdoc/web-common";
import styled from "@emotion/styled";
import {TransportMessage} from "dashdoc-utils";
import React from "react";

import {useSelector} from "app/redux/hooks";

import TransportNoteInput from "../transport-note-input";

import {Message} from "./Message";
import {StatusUpdate} from "./StatusUpdate";

import type {Transport, TransportStatus} from "app/types/transport";

const StatusListContainer = styled("div")<{showInput: boolean}>`
    height: calc(100% - ${(props: any) => (props.showInput ? "90px" : "40px")});
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    @media (max-width: 581px) {
        height: calc(100% - ${(props: any) => (props.showInput ? "120px" : "40px")});
    }
`;

const StatusContainer = styled("div")`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const HIDDEN_STATUS_CATEGORIES = [
    "bulking_break_started",
    "bulking_break_complete",
    "round_added",
];

type TransportStatusListProps = {
    transport: Transport;
    isOrder: boolean;
    onAddNote: (transportUid: string, deliveryUid: string, message: any) => Promise<any>;
    showInput: boolean;
};

export default function TransportStatusList({
    transport,
    isOrder,
    onAddNote,
    showInput,
}: TransportStatusListProps) {
    const sites = useSelector((state) => Object.values(state.entities.sites ?? {}));

    // we hide some statuses while we don't have a permission / visibility system
    // The round_added events have been superseded by the round_added_v2 event so they are hidden to avoid duplicates

    const breakingSitesUids = sites
        .filter((site) => site.category === "breaking")
        .map((site) => site.uid);

    const status_updates = (transport.status_updates ?? []).filter(
        (status) =>
            HIDDEN_STATUS_CATEGORIES.indexOf(status.category) < 0 &&
            !(
                (status.category === "departed" ||
                    (status.category === "event" &&
                        status.update_details.status === "departed")) &&
                status.site &&
                breakingSitesUids.includes(status.site)
            )
    );
    const transportStatus: (TransportStatus & {eventType: "statusUpdate"})[] = status_updates.map(
        (statusUpdate) => ({
            ...statusUpdate,
            eventType: "statusUpdate",
        })
    );

    const messages = (transport.messages ?? []).filter(Boolean);
    const transportMessages: (TransportMessage & {eventType: "message"})[] = messages.map(
        (message) => ({...message, eventType: "message"})
    );

    const updates = dateService.sortByCreatedDeviceDate(
        [...transportStatus, ...transportMessages],
        true
    );

    return (
        <ErrorBoundary>
            <StatusContainer data-testid="transport-status-list">
                {showInput && <TransportNoteInput onAddNote={onAddNote} transport={transport} />}
                <StatusListContainer showInput={showInput}>
                    {updates.map((update) => {
                        return update.eventType === "statusUpdate" ? (
                            <StatusUpdate
                                key={update.uid}
                                transport={transport}
                                statusUpdate={update}
                                isOrder={isOrder}
                            />
                        ) : (
                            <Message key={update.uid} transport={transport} message={update} />
                        );
                    })}
                </StatusListContainer>
            </StatusContainer>
        </ErrorBoundary>
    );
}
