import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text, Tag} from "@dashdoc/web-ui";
import {Tag as TagType} from "dashdoc-utils";
import {uniqBy} from "lodash";
import React from "react";

import {TagSection} from "app/features/core/tags/TagSection";
import {TripTransport} from "app/features/trip/trip.types";
import {fetchUpdateTransportTags} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

export function TripTags({
    transports,
    editable,
}: {
    transports: TripTransport[];
    editable: boolean;
}) {
    return transports.length > 1 ? (
        <PreparedTripTags transports={transports} />
    ) : (
        <TransportTags transport={transports[0]} editable={editable} />
    );
}

function PreparedTripTags({transports}: {transports: TripTransport[]}) {
    const tags = uniqBy(
        transports.flatMap((t) => t.tags),
        (t) => t.pk
    );
    if (tags.length === 0) {
        return <Text variant="caption"> {t("scheduler.noTags")}</Text>;
    }
    return (
        <>
            {tags.map((tag, index) => (
                <Tag tag={tag} key={index} mr={1} mb={1} />
            ))}
        </>
    );
}

function TransportTags({transport, editable}: {transport: TripTransport; editable: boolean}) {
    const dispatch = useDispatch();
    const canUpdateTags = useSelector((state) =>
        managerService.hasAtLeastUserRole(getConnectedManager(state))
    );

    return (
        <TagSection
            tags={transport.tags}
            canUpdateTags={editable && canUpdateTags}
            onAdd={handleAddTag}
            onDelete={handleDeleteTag}
        />
    );

    function handleAddTag(tag: TagType) {
        dispatch(fetchUpdateTransportTags(transport.uid, [...transport.tags, tag]));
    }

    function handleDeleteTag(tag: TagType) {
        dispatch(
            fetchUpdateTransportTags(transport.uid, [
                ...transport.tags.filter((t) => t.pk !== tag.pk),
            ])
        );
    }
}
