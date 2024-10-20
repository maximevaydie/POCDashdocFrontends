// Adapted from https://github.com/akursat/react-leaflet-cluster

import {
    extendContext,
    createElementObject,
    createPathComponent,
    LeafletContextInterface,
} from "@react-leaflet/core";
import L, {LeafletMouseEventHandlerFn} from "leaflet";
import React from "react";
import "leaflet.markercluster";

import {MarkerCluster} from "./NetworkMap";

type ClusterType = {[key in string]: any};

type ClusterEvents = {
    onClick?: LeafletMouseEventHandlerFn;
    onDblClick?: LeafletMouseEventHandlerFn;
    onMouseDown?: LeafletMouseEventHandlerFn;
    onMouseUp?: LeafletMouseEventHandlerFn;
    onMouseOver?: LeafletMouseEventHandlerFn;
    onMouseOut?: LeafletMouseEventHandlerFn;
    onContextMenu?: LeafletMouseEventHandlerFn;
};

type MarkerClusterControl = L.MarkerClusterGroupOptions & {
    children: React.ReactNode;
} & ClusterEvents;

function getPropsAndEvents(props: MarkerClusterControl) {
    let clusterProps: ClusterType = {};
    let clusterEvents: ClusterType = {};
    const {children, ...rest} = props;

    // Splitting props and events to different objects
    Object.entries(rest).forEach(([propName, prop]) => {
        if (propName.startsWith("on")) {
            clusterEvents = {...clusterEvents, [propName]: prop};
        } else {
            clusterProps = {...clusterProps, [propName]: prop};
        }
    });
    return {clusterProps, clusterEvents};
}

function createMarkerClusterGroup(props: MarkerClusterControl, context: LeafletContextInterface) {
    const {clusterProps, clusterEvents} = getPropsAndEvents(props);
    const markerClusterGroup = new L.MarkerClusterGroup(clusterProps);
    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
        let clusterEvent;

        let baseEventName = eventAsProp.substring(2).toLowerCase();

        if (["animationend", "spiderfied", "unspiderfied"].includes(baseEventName)) {
            clusterEvent = baseEventName;
        } else {
            clusterEvent = `cluster${baseEventName}`;
        }

        markerClusterGroup.on(clusterEvent, callback);
    });

    return createElementObject(
        markerClusterGroup,
        extendContext(context, {layerContainer: markerClusterGroup})
    );
}

export const MarkerClusterGroup = createPathComponent<L.MarkerClusterGroup, MarkerClusterControl>(
    createMarkerClusterGroup
);
export const createClusterCustomIcon = (cluster: MarkerCluster) => {
    const count = cluster.getChildCount();

    const getColor = (count: number): string => {
        if (count < 20) {
            return "hsl(120, 70%, 35%)";
        }
        if (count < 100) {
            return `hsl(60, 80%, ${Math.max(35, 50 - (count - 20) / 5)}%)`;
        }
        return `hsl(0, 80%, ${Math.max(30, 45 - (count - 100) / 60)}%)`;
    };

    const getIconSize = (count: number): number => {
        return Math.round(40 + Math.min(count, 100) / 10);
    };

    const backgroundColor = getColor(count);
    const iconSize = getIconSize(count);
    const uniqueId = `cluster-${count}-${Math.random().toString(36).slice(2, 7)}`;

    const style = `
        .${uniqueId} {
            background: ${backgroundColor};
            background: linear-gradient(135deg,
                        ${backgroundColor} 0%,
                        ${backgroundColor} 50%,
                        rgba(0,0,0,0.2) 51%,
                        rgba(0,0,0,0.2) 100%),
                        ${backgroundColor};
            border-radius: 50%;
            color: white;
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            font-size: ${Math.max(12, Math.min(iconSize / 3, 18))}px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            box-shadow: inset 0 0 0 2px rgba(255,255,255,0.3),
                        0 4px 6px rgba(0,0,0,0.1),
                        0 1px 3px rgba(0,0,0,0.08);
            transition: transform 0.2s ease-in-out;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
        }
        .${uniqueId}:hover {
            transform: scale(1.05);
        }
    `;

    return L.divIcon({
        html: `<style>${style}</style><span class="${uniqueId}">${count}</span>`,
        className: "custom-marker-cluster-wrapper",
        iconSize: L.point(iconSize, iconSize, true),
    });
};
