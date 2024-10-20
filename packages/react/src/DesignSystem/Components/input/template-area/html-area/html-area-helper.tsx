//TYPES
// A position in an html element is defined by a list of successors and an offset.
export type HtmlPosition = {
    successors: number[];
    offset: number;
};

export type HtmlSelection =
    | {
          type: "position";
          position: HtmlPosition;
      }
    | {type: "range"; positions: [HtmlPosition, HtmlPosition]};

export const containsRange = (node: Node, range: Range | undefined) => {
    if (range) {
        return node.contains(range.commonAncestorContainer);
    }
    return false;
};

//UTILS

export const isDiv = (node: Node) => node.nodeName === "DIV" || node.nodeName === "div";

// BUSINESS

// Returns the genealogy of the descendant Node compared to the ancestorNode
export const nodePosition = (ancestorNode: Node, descendantNode: Node): number[] => {
    if (ancestorNode === descendantNode) {
        return []; // The descendantNode is actually at the root of the tree
    }
    for (let i = 0; i < ancestorNode.childNodes.length; i++) {
        const childNode = ancestorNode.childNodes[i];
        if (childNode.contains(descendantNode)) {
            return [i, ...nodePosition(childNode, descendantNode)];
        }
    }
    throw new Error("Unreachable (nodePosition)");
};

export const rangeIsPosition = (range: Range | undefined) => {
    if (!range) {
        return false;
    }
    return range.startContainer === range.endContainer && range.startOffset === range.endOffset;
};

/** Turns a dom range into a relative position in the node */
export const rangeToElementSelection = (
    rootNode: Node,
    range: Range
): HtmlSelection | undefined => {
    if (!containsRange(rootNode, range)) {
        return undefined;
    }
    const startPosition = nodePosition(rootNode, range.startContainer);
    if (rangeIsPosition(range)) {
        return {
            type: "position",
            position: {
                successors: startPosition,
                offset: range.startOffset,
            },
        };
    }
    const endPosition = nodePosition(rootNode, range.endContainer);
    return {
        type: "range",
        positions: [
            {
                successors: startPosition,
                offset: range.startOffset,
            },
            {
                successors: endPosition,
                offset: range.endOffset,
            },
        ],
    };
};

/** Turns a relative position in the node into a dom range */
export const elementSelectionToRange = (
    rootNode: Node,
    elementSelection: HtmlSelection | undefined
): Range => {
    if (elementSelection === undefined) {
        // @ts-ignore
        return undefined;
    }
    if (elementSelection.type === "position") {
        const node = elementSelection.position.successors.reduce(
            (node, successor) => node.childNodes[successor],
            rootNode
        );
        if (node === undefined) {
            // @ts-ignore
            return undefined;
        }
        const range = document.createRange();
        range.setStart(node, elementSelection.position.offset);
        range.setEnd(node, elementSelection.position.offset);
        return range;
    }
    const startNode = elementSelection.positions[0].successors.reduce(
        (node, successor) => node.childNodes[Math.min(successor, node.childNodes.length - 1)],
        rootNode
    );
    const endNode = elementSelection.positions[1].successors.reduce(
        (node, successor) => node.childNodes[Math.min(successor, node.childNodes.length - 1)],
        rootNode
    );
    const range = document.createRange();
    range.setStart(startNode, elementSelection.positions[0].offset);
    range.setEnd(endNode, elementSelection.positions[1].offset);
    return range;
};
