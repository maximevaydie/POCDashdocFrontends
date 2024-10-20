import {Logger} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {Identifier} from "dnd-core";
import React, {CSSProperties, FunctionComponent, useMemo} from "react";
import {XYCoord} from "react-dnd";
import {usePreview} from "react-dnd-preview";
import {createPortal} from "react-dom";

import {ErrorBoundary} from "../misc";

import {DndItem} from "./types";

export type GhostComponentProps = {
    item: DndItem;
    style: CSSProperties;
};

type DndGhostProps = {
    ghostComponents: Record<Identifier, FunctionComponent<GhostComponentProps>>;
};
export function DndGhost({ghostComponents}: DndGhostProps) {
    return (
        <ErrorBoundary>
            {createPortal(
                <GhostContentProvider ghostComponents={ghostComponents} />,
                document.getElementById("react-app-modal-root") as HTMLElement
            )}
        </ErrorBoundary>
    );
}

function GhostContentProvider({ghostComponents}: DndGhostProps) {
    const preview = usePreview<DndItem>();
    if (!preview.display) {
        return null;
    }
    const {itemType, item, style: previewStyle, monitor} = preview;
    const clientOffset = monitor.getClientOffset() ?? {x: 0, y: 0};

    if (!itemType) {
        Logger.error("DndGhost: no itemType");
        return null;
    }
    if (!ghostComponents) {
        Logger.error("DndGhost: no ghostComponents props");
        return null;
    }
    const GhostComponent = ghostComponents[itemType];
    if (!GhostComponent) {
        return null;
    }

    return (
        <GhostContent
            Component={GhostComponent}
            item={item}
            previewStyle={previewStyle}
            clientOffset={clientOffset}
        />
    );
}

type GhostContentProps = {
    Component: FunctionComponent<GhostComponentProps>;
    clientOffset: XYCoord;
    previewStyle: CSSProperties;
    item: DndItem;
};
function GhostContent({Component, clientOffset, previewStyle, item}: GhostContentProps) {
    const transform = `translate(${clientOffset.x}px, ${clientOffset.y}px)`;
    const style = useMemo(
        () => ({
            ...previewStyle,
            zIndex: theme.zIndices.dndGhost,
            transform,
            WebkitTransform: transform,
            cursor: "grabbing",
        }),
        [previewStyle, transform]
    );
    return <Component item={item} style={style} />;
}
