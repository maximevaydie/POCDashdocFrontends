import styled from "@emotion/styled";
import {getBox} from "css-box-model";
import isEqual from "lodash.isequal";
import React, {
    CSSProperties,
    FunctionComponent,
    memo,
    ReactNode,
    RefObject,
    useEffect,
    useMemo,
    useRef,
} from "react";

import {Checkbox} from "../../choice/Checkbox";
import {DraggableTr} from "../../dnd/Draggable";
import {Box, BoxProps} from "../../layout/Box";
import {TestableProps} from "../../types";
import {themeAwareCss} from "../../utils";
import {Text} from "../Text";

import {getColumnGap, BaseColumnProps, ColumnPosition} from "./Column";
import {bindEvents} from "./dndEventBindings";

export type BaseRowProps = {
    key?: string;
    id?: number;
    testId?: string;
    [key: string]: any;
};

export type RowProps<TCustomColumn = BaseColumnProps, TCustomRow = BaseRowProps> = {
    row: TCustomRow;
    testId?: string;
    id: string;
    index: number;
    columns: TCustomColumn[];
    getCellContent: (
        row: TCustomRow,
        columnName: string,
        index?: number
    ) => ReactNode | ReactNode[];
    getCellIsClickable: (row: TCustomRow, columnName: string) => boolean;
    getCellStyle?: (row: TCustomRow, columnName: string, index?: number) => CSSProperties;
    getColumnKey: (column: TCustomColumn, index: number) => string;
    getColumnName: (column: TCustomColumn) => string;
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: (row: TCustomRow, selected: boolean) => void;
    onClick?: (row: TCustomRow) => void;
    onHover?: (row: TCustomRow | null) => void;
    isEditing?: boolean;
    isResizable?: boolean;
    withSelectableColumns?: boolean;
    withDraggableRows?: boolean;
    isDragging?: boolean;
    getDragGhost?: (row: TCustomRow) => ReactNode;
    dragGhostWidth?: number;
    headerRef?: RefObject<Element>;
    narrowColumnGaps?: boolean;
};

export const RowCell: FunctionComponent<
    BoxProps &
        Pick<RowProps, "onClick" | "narrowColumnGaps"> & {
            rowSpan?: number;
            columnPosition?: ColumnPosition;
        }
> = ({narrowColumnGaps = false, columnPosition, ...props}) => {
    let horizontalPadding = getColumnGap(narrowColumnGaps, columnPosition);
    return (
        <Box
            as="td"
            {...horizontalPadding}
            py={2}
            verticalAlign="top"
            position="relative"
            {...props}
        />
    );
};

export const StyledRowCell = styled(RowCell)<{
    style: CSSProperties;
}>(({style}) => themeAwareCss(style));

export const CheckboxRowCell = styled(RowCell)<{
    isSelected: boolean;
    isEditing: boolean;
}>(({isSelected, isEditing}) =>
    themeAwareCss({
        "&:hover": {
            backgroundColor: isEditing
                ? "grey.light"
                : isSelected
                ? "blue.ultralight"
                : "blue.light",
        },
    })
);

export const Tr = styled(Box.withComponent("tr"))<{
    isClickable: boolean;
    isSelected: boolean;
    isEditing: boolean;
    index: number;
}>(({isClickable, isSelected, isEditing, index}) => {
    const bgColor = index % 2 === 1 ? "grey.ultralight" : "grey.white";
    return themeAwareCss({
        cursor: isClickable ? "pointer" : "default",
        backgroundColor: isEditing ? "grey.light" : isSelected ? "blue.ultralight" : bgColor,
        "&:hover": {
            backgroundColor: isEditing ? "grey.light" : isSelected ? "blue.light" : "grey.light",
        },
    });
});

const RowWrapper = ({
    withDraggableRows,
    id,
    row,
    index,
    children,
    isDragging,
    headerRef,
    dragGhost,
    dragGhostWidth,
    ...rowProps
}: {
    withDraggableRows: boolean;
    id: string;
    row: BaseRowProps;
    index: number;
    children: React.ReactNode;
    isClickable: boolean;
    isSelected: boolean;
    isEditing: boolean;
    isDragging: boolean;
    headerRef?: RefObject<Element>;
    dragGhost: React.ReactNode;
    dragGhostWidth: number;
} & TestableProps) => {
    const refGhost = useRef<HTMLElement>(null);
    useEffect(() => {
        const unsubscribe = bindEvents(window, [
            {
                eventName: "onBeforeCapture",
                fn: (event: CustomEvent) => {
                    const el = refGhost.current;
                    if (!el || !headerRef) {
                        return;
                    }
                    // @ts-ignore
                    const headerBox = getBox(headerRef.current);
                    const clientSelection = event.detail.clientSelection;
                    // want to shrink the item
                    // want it to be centered as much as possible to the cursor
                    const targetWidth = dragGhostWidth;
                    const halfWidth = targetWidth / 2;
                    const distanceToLeft = Math.max(
                        clientSelection.x - headerBox.borderBox.left,
                        0
                    );

                    // Nothing left to do
                    if (distanceToLeft < halfWidth) {
                        return;
                    }
                    // what the new left will be
                    const proposedLeftOffset: number = distanceToLeft - halfWidth;
                    // what the raw right value would be
                    const targetRight: number =
                        headerBox.borderBox.left + proposedLeftOffset + targetWidth;

                    // how much we would be going past the right value
                    const rightOverlap: number = Math.max(
                        targetRight - headerBox.borderBox.right,
                        0
                    );

                    // need to ensure that we don't pull the element past
                    // it's resting right position
                    const leftOffset: number = proposedLeftOffset - rightOverlap;
                    el.style.position = "relative";
                    el.style.left = `${leftOffset}px`;
                },
            },
        ]);
        return () => {
            unsubscribe();
        };
    }, []);

    if (withDraggableRows) {
        return (
            <DraggableTr
                kind="table"
                id={id}
                payload={{} /* empty for now, the entity is enough */}
                entity={row}
                index={index}
                rowProps={rowProps}
            >
                {children}
            </DraggableTr>
        );
    }
    return (
        <Tr {...rowProps} data-test-row-id={id} index={index}>
            {children}
        </Tr>
    );
};

export const EmptyRow: FunctionComponent<
    Pick<
        RowProps,
        "isSelectable" | "columns" | "getColumnKey" | "withSelectableColumns" | "isResizable"
    > & {
        getColumnWidth: (column: BaseColumnProps) => string | number;
    }
> = ({
    isSelectable,
    columns,
    getColumnKey,
    getColumnWidth,
    isResizable,
    withSelectableColumns,
}) => {
    return (
        <Box as="tr" height="0px">
            {isSelectable && <Box width="36px" as="td" pb={0} />}
            {columns.map((column, columnIndex) => (
                <Box
                    as="td"
                    key={getColumnKey(column, columnIndex)}
                    width={getColumnWidth(column)}
                    height="0px"
                    pb={0}
                />
            ))}
            {isResizable && <Box as="td" width="auto" pb={0} />}
            {withSelectableColumns && <Box width="2.5em" as="td" pb={0} />}
        </Box>
    );
};

const RowComponent: FunctionComponent<RowProps> = (props) => {
    const {
        row,
        id,
        index,
        testId,
        columns,
        getCellContent,
        getColumnKey,
        getColumnName,
        isSelectable,
        isSelected = false,
        onSelect,
        onClick,
        onHover,
        isEditing,
        getCellIsClickable,
        getCellStyle,
        isResizable,
        withSelectableColumns,
        withDraggableRows,
        isDragging,
        headerRef,
        getDragGhost,
        dragGhostWidth,
        narrowColumnGaps,
    } = props;

    const maxRowSpan = useMemo(() => {
        return Math.max(
            ...columns.map((column) => {
                const content = getCellContent(row, getColumnName(column));
                return Array.isArray(content) ? content.length : 1;
            })
        );
    }, [columns, row]);

    return (
        <>
            {Array.from({length: maxRowSpan}).map((_, i) => (
                <RowWrapper
                    key={row.key + "-" + i}
                    index={index}
                    id={id}
                    row={row}
                    // @ts-ignore
                    withDraggableRows={withDraggableRows}
                    isClickable={!!onClick}
                    // @ts-ignore
                    isEditing={isEditing}
                    isSelected={isSelected}
                    // @ts-ignore
                    isDragging={isDragging}
                    headerRef={headerRef}
                    dragGhost={isDragging && getDragGhost ? getDragGhost(row) : undefined}
                    // @ts-ignore
                    dragGhostWidth={dragGhostWidth}
                    data-testid={`${i > 0 ? "sub-" : ""}${testId}`}
                    onMouseEnter={() => {
                        onHover?.(row);
                    }}
                    onMouseLeave={() => onHover?.(null)}
                >
                    {isSelectable && i === 0 && (
                        <CheckboxRowCell
                            rowSpan={maxRowSpan}
                            width="36px"
                            onClick={() => {
                                onSelect?.(row, !isSelected);
                            }}
                            // @ts-ignore
                            isEditing={isEditing}
                            isSelected={isSelected}
                            data-testid={`${testId}-checkbox-${index}`}
                        >
                            <Checkbox checked={isSelected} />
                        </CheckboxRowCell>
                    )}
                    {columns.map((column, columnIndex) => {
                        const content = getCellContent(row, getColumnName(column), index);
                        const isSubRow = Array.isArray(content);
                        const rowSpan = isSubRow ? 1 : maxRowSpan;
                        const contentToRender = isSubRow ? (content as ReactNode[])[i] : content;

                        if (!isSubRow && i > 0) {
                            return null;
                        }

                        return (
                            <StyledRowCell
                                key={getColumnKey(column, columnIndex)}
                                onClick={() =>
                                    getCellIsClickable(row, getColumnName(column)) &&
                                    onClick?.(row)
                                }
                                rowSpan={rowSpan}
                                data-testid={`${testId}-column-${column.name}`}
                                narrowColumnGaps={narrowColumnGaps}
                                columnPosition={
                                    columnIndex === 0
                                        ? "first"
                                        : columnIndex === columns.length - 1
                                        ? "last"
                                        : "middle"
                                }
                                style={getCellStyle?.(row, getColumnName(column), index) ?? {}}
                            >
                                {typeof contentToRender === "string" ? (
                                    <Text variant="caption" lineHeight={0}>
                                        {contentToRender}
                                    </Text>
                                ) : (
                                    contentToRender
                                )}
                            </StyledRowCell>
                        );
                    })}
                    {isResizable && <RowCell p={0} width="auto" />}
                    {withSelectableColumns && i === 0 && (
                        <RowCell pl={0} width="2.5em" rowSpan={maxRowSpan} />
                    )}
                </RowWrapper>
            ))}
        </>
    );
};

export const Row = memo(RowComponent, (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
});
