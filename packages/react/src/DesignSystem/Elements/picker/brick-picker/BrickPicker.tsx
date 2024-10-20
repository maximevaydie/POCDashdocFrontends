import {Logger, t} from "@dashdoc/web-core";
import {Text, TooltipWrapper, Box, Flex} from "@dashdoc/web-ui";
import clone from "lodash.clone";
import React, {Fragment, useState} from "react";

import {ABrick} from "./components/ABrick";
import {ClearAll} from "./components/ClearAll";
import {ClearLine} from "./components/ClearLine";
import {SelectColumn} from "./components/SelectColumn";
import {defaultBrickStyles} from "./default";
import {Brick, BrickPickerStyle, BrickStyle, BrickLine} from "./types";
import {useMouseButtonDown} from "./useMouseButtonDown";

type BrickState = Brick & {
    style: BrickStyle;
    lineIndex: number;
    columnIndex: number;
};

type HoverState = null | {columnIndex: number} | {lineIndex: number; columnIndex: number};

export type BrickPickerProps = {
    lines: BrickLine[];
    onChange: (lines: BrickLine[]) => void;
    style?: BrickPickerStyle;
    rootId?: string;
};

export function BrickPicker({
    lines,
    style = defaultBrickStyles,
    onChange,
    rootId = "react-app",
}: BrickPickerProps) {
    const maxLength = getMaxLength(lines);
    const mouseDown = useMouseButtonDown(rootId);
    const [hoverState, setHoverState] = useState<HoverState>(null);
    return (
        <Flex flexDirection="column" overflowY="auto">
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: `max-content repeat(${maxLength}, 2fr) max-content`,
                    userSelect: "none",
                }}
                onMouseEnter={() => {
                    setHoverState(null);
                }}
                onMouseLeave={() => {
                    setHoverState(null);
                }}
            >
                <Text
                    p={style.m}
                    style={{visibility: "hidden"}}
                    variant="caption"
                    key={`column-first`}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                        e.stopPropagation();
                        setHoverState(null);
                    }}
                >
                    xx:xx{/* Take the expected width */}
                </Text>
                {[...Array(maxLength)].map((_, columnIndex) => (
                    <Box
                        p={style.m}
                        key={`column-${columnIndex}`}
                        backgroundColor={
                            hoverState !== null &&
                            !("lineIndex" in hoverState) &&
                            "columnIndex" in hoverState &&
                            hoverState.columnIndex <= columnIndex
                                ? "grey.light"
                                : "transparent"
                        }
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            e.stopPropagation();
                            setHoverState({columnIndex});
                        }}
                        onMouseOver={() => {
                            if (mouseDown) {
                                handleColumnSelect(columnIndex);
                            }
                        }}
                        onMouseDown={() => {
                            handleColumnSelect(columnIndex);
                        }}
                    >
                        <TooltipWrapper
                            content={
                                columnIndex === 0
                                    ? t("common.selectAll")
                                    : columnIndex === maxLength - 1
                                    ? t("common.selectColumn")
                                    : t("common.selectColumns")
                            }
                            placement="top"
                        >
                            <SelectColumn
                                forceHover={
                                    hoverState !== null &&
                                    !("lineIndex" in hoverState) &&
                                    "columnIndex" in hoverState &&
                                    hoverState.columnIndex <= columnIndex
                                }
                            />
                        </TooltipWrapper>
                    </Box>
                ))}
                <Box
                    key={`column-clear-all`}
                    p={style.m}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                        e.stopPropagation();
                        setHoverState(null);
                    }}
                    onMouseOver={() => {
                        if (mouseDown) {
                            handleColumnSelect(null);
                        }
                    }}
                    onMouseDown={() => {
                        handleColumnSelect(null);
                    }}
                >
                    <TooltipWrapper content={t("common.deselectAll")} placement="top">
                        <ClearAll />
                    </TooltipWrapper>
                </Box>
            </Box>
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: `max-content repeat(${maxLength}, 2fr) max-content`,
                    userSelect: "none",
                    overflowY: "auto",
                }}
                onMouseEnter={() => {
                    setHoverState(null);
                }}
                onMouseLeave={() => {
                    setHoverState(null);
                }}
            >
                {lines.map((line, lineIndex) => (
                    <Fragment key={`line-${lineIndex}`}>
                        {getBrickStates(maxLength, line.bricks, lineIndex).map(
                            (state, columnIndex) => (
                                <Fragment key={`line-${lineIndex}-${columnIndex}`}>
                                    {columnIndex === 0 && (
                                        <Flex
                                            key={`line-label-${lineIndex}`}
                                            p={style.m}
                                            alignItems="center"
                                            justifyContent="end"
                                            style={{cursor: "pointer"}}
                                            backgroundColor={
                                                hoverState !== null &&
                                                "lineIndex" in hoverState &&
                                                hoverState.lineIndex === lineIndex
                                                    ? "grey.light"
                                                    : "transparent"
                                            }
                                            onMouseEnter={(
                                                e: React.MouseEvent<HTMLDivElement, MouseEvent>
                                            ) => {
                                                e.stopPropagation();
                                                setHoverState({lineIndex, columnIndex});
                                            }}
                                            onMouseOver={() => {
                                                if (mouseDown) {
                                                    handleDrag(state);
                                                }
                                            }}
                                            onMouseDown={() => {
                                                handleClick(state);
                                            }}
                                        >
                                            <Text variant="caption">{line.label}</Text>
                                        </Flex>
                                    )}

                                    <Box
                                        key={`brick-${lineIndex}-${columnIndex}`}
                                        data-testid={`brick-${lineIndex}-${columnIndex}`}
                                        p={style.m}
                                        backgroundColor={
                                            hoverState !== null &&
                                            "lineIndex" in hoverState &&
                                            hoverState.lineIndex === lineIndex
                                                ? "grey.light"
                                                : "transparent"
                                        }
                                        onMouseEnter={(
                                            e: React.MouseEvent<HTMLDivElement, MouseEvent>
                                        ) => {
                                            e.stopPropagation();
                                            setHoverState({lineIndex, columnIndex});
                                        }}
                                        onMouseOver={() => {
                                            if (mouseDown) {
                                                handleDrag(state);
                                            }
                                        }}
                                        onMouseDown={() => {
                                            handleClick(state);
                                        }}
                                    >
                                        <ABrick
                                            height={style.height}
                                            defaultStyle={state.style.defaultStyle}
                                            hoverStyle={state.style.hoverStyle}
                                            forceHover={shouldForceHover(state, hoverState)}
                                        />
                                    </Box>
                                    {columnIndex === maxLength - 1 && (
                                        <Box
                                            key={`clear-line-${lineIndex}`}
                                            p={style.m}
                                            backgroundColor={
                                                hoverState !== null &&
                                                "lineIndex" in hoverState &&
                                                hoverState.lineIndex === lineIndex
                                                    ? "grey.light"
                                                    : "transparent"
                                            }
                                            onMouseOver={() => {
                                                setHoverState({lineIndex, columnIndex: maxLength});
                                                if (mouseDown) {
                                                    handleClear(lineIndex);
                                                }
                                            }}
                                            onMouseDown={() => {
                                                handleClear(lineIndex);
                                            }}
                                        >
                                            <TooltipWrapper
                                                content={`${t("common.deselectLine")} ${
                                                    line.label
                                                }`}
                                                placement="right"
                                            >
                                                <ClearLine
                                                    forceHover={
                                                        hoverState !== null &&
                                                        "lineIndex" in hoverState &&
                                                        hoverState?.lineIndex === lineIndex &&
                                                        hoverState?.lineIndex === lineIndex
                                                    }
                                                />
                                            </TooltipWrapper>
                                        </Box>
                                    )}
                                </Fragment>
                            )
                        )}
                    </Fragment>
                ))}
            </Box>
        </Flex>
    );

    function handleClear(lineIndex: number) {
        updateLines(lineIndex, maxLength - 1, false);
    }

    /**
     * Start the selection.
     */
    function handleClick(state: BrickState) {
        const {lineIndex, columnIndex} = state;
        let selected = true;
        if (state.columnIndex === maxLength - 1 && state.selected) {
            selected = false;
        }
        updateLines(lineIndex, columnIndex, selected);
    }

    /**
     * Continue the selection.
     */
    function handleDrag({lineIndex, columnIndex}: BrickState) {
        if (mouseDown) {
            updateLines(lineIndex, columnIndex, true);
        } else {
            Logger.log(`Continue aborted: no touch start or mouse down`);
        }
    }

    function handleColumnSelect(columnIndex: number | null) {
        const selected = columnIndex !== null;
        let result: BrickLine[] = clone(lines);
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            result = turnFollowing(result, lineIndex, columnIndex ?? 0, selected);
        }
        onChange(result);
    }

    function updateLines(lineIndex: number, columnIndex: number, selected: boolean) {
        const result: BrickLine[] = turnFollowing(lines, lineIndex, columnIndex, selected);
        onChange(result);
    }

    function getBrickStates(maxLength: number, bricks: Brick[], lineIndex: number): BrickState[] {
        const result = [...Array(maxLength)].map((_, columnIndex) => {
            const brick = bricks[columnIndex] ?? null;
            return convertToBrickState(brick, lineIndex, columnIndex);
        });
        return result;
    }

    function convertToBrickState(
        brick: Brick | null,
        lineIndex: number,
        columnIndex: number
    ): BrickState {
        if (brick !== null) {
            const {empty, selected} = brick;
            if (!brick.empty) {
                if (brick.selected) {
                    return {style: style.fullSelected, empty, selected, lineIndex, columnIndex};
                }
                return {style: style.full, empty, selected, lineIndex, columnIndex};
            }
            if (brick.selected) {
                return {style: style.emptySelected, empty, selected, lineIndex, columnIndex};
            }
        }
        return {
            style: style.empty,
            empty: true,
            selected: false,
            lineIndex,
            columnIndex,
        };
    }
}

function getMaxLength(lines: BrickLine[]): number {
    return Math.max(0, ...lines.map((line) => line.bricks.length));
}

/**
 * Turn the current brick (and following) to the expected selected state.
 */
function turnFollowing(
    lines: BrickLine[],
    lineIndex: number,
    columnIndex: number,
    selected: boolean
): BrickLine[] {
    const maxLength = getMaxLength(lines);
    const result: BrickLine[] = clone(lines);
    for (let i = 0; i < maxLength; i++) {
        if (i >= columnIndex) {
            if (result[lineIndex].bricks[i]) {
                result[lineIndex].bricks[i].selected = selected;
            } else {
                result[lineIndex].bricks[i] = {
                    empty: true,
                    selected: selected,
                };
            }
        } else {
            if (result[lineIndex].bricks[i]) {
                result[lineIndex].bricks[i].selected = false;
            } else {
                result[lineIndex].bricks[i] = {
                    empty: true,
                    selected: false,
                };
            }
        }
    }
    return result;
}

function shouldForceHover({columnIndex, lineIndex}: BrickState, hoverState: HoverState) {
    if (hoverState === null) {
        return false;
    }
    if ("lineIndex" in hoverState) {
        return hoverState.lineIndex === lineIndex && hoverState.columnIndex <= columnIndex;
    }

    if ("columnIndex" in hoverState) {
        return hoverState.columnIndex <= columnIndex;
    }
    return false;
}
