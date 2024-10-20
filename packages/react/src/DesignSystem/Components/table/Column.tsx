import React, {FunctionComponent, ReactNode, useCallback} from "react";

import {SortCriteriaOption, SortValue} from "../../choice";
import {ResizableBox} from "../../layout";
import {Box, BoxProps} from "../../layout/Box";
import {Flex} from "../../layout/Flex";
import {Icon} from "../icon";
import {Text} from "../Text";

import {ColumnSort} from "./ColumnSort";

export type BaseColumnProps = {
    key?: string;
    id?: string;
    name?: string;
    label?: string | JSX.Element;
    [key: string]: any;
};

export type ColumnDirection = "asc" | "desc" | null | undefined;

export type ColumnProps<
    TCustomColumn = BaseColumnProps,
    TSortCriterion extends string = string,
> = {
    column: TCustomColumn;
    getLabel: (column: TCustomColumn) => ReactNode;
    getWidth: (column: TCustomColumn) => BoxProps["width"];
    setWidth?: (column: TCustomColumn, width: string) => void;
    "data-testid"?: string;
    narrowColumnGaps?: boolean;
    columnPosition?: ColumnPosition;
    sortValue?: SortValue<TSortCriterion> | null;
    sortCriteria?: Array<SortCriteriaOption<TSortCriterion>>;
    onUpdateSort?: (sortValue: SortValue<TSortCriterion> | null) => void;
} & {
    /**
     * @deprecated, use sortCriteria instead
     */
    isSortable?: boolean;
    // Deprecated, use sortValue instead
    direction?: ColumnDirection;
    // Deprecated, use onUpdateSort instead
    onDirectionChange?: (newDirection: ColumnDirection) => void;
};

export type ColumnPosition = "first" | "middle" | "last";

export const getColumnGap = (narrowColumnGaps: boolean, columnPosition?: ColumnPosition) => {
    let horizontalPadding: {[key: string]: string} = {px: "12px"};
    if (narrowColumnGaps) {
        switch (columnPosition) {
            case "first":
                horizontalPadding = {pl: "12px", pr: "6px"};
                break;
            case "middle":
                horizontalPadding = {px: "6px"};
                break;
            case "last":
                horizontalPadding = {pl: "6px", pr: "12px"};
                break;
        }
    }
    return horizontalPadding;
};

export const ColumnCell: FunctionComponent<
    BoxProps & {
        onClick?: () => void;
        title?: string;
        colSpan?: number;
        setWidth?: (width: string) => void;
        minSize?: string;
        narrowColumnGaps?: boolean;
        columnPosition?: ColumnPosition;
    }
> = ({setWidth, minSize, narrowColumnGaps = false, columnPosition, ...props}) => {
    let horizontalPadding = getColumnGap(narrowColumnGaps, columnPosition);
    if (setWidth !== undefined) {
        return (
            <ResizableBox
                allowedDirections={["right"]}
                asComponent={"th"}
                onResizeDone={setWidth}
                minSize={{width: minSize}}
                position="sticky"
                top={0}
                zIndex="level1"
                backgroundColor="grey.ultralight"
                {...horizontalPadding}
                py={2}
                showResizeHandleOnHover={true}
                resizeHandleColor="grey.default"
                {...props}
            />
        );
    }
    return (
        <Box
            as={"th"}
            position="sticky"
            top={0}
            zIndex="level1"
            backgroundColor="grey.ultralight"
            {...horizontalPadding}
            py={2}
            {...props}
        />
    );
};

export const Column = <
    TCustomColumn extends BaseColumnProps = BaseColumnProps,
    TSortCriterion extends string = string,
>({
    column,
    getLabel,
    getWidth,
    setWidth,
    // Deprecated, use sortCriteria instead
    isSortable: isSortableDeprecated,
    // Deprecated, use sortValue.order instead
    direction: directionDeprecated,
    // Deprecated, use onUpdateSort instead
    onDirectionChange: onDirectionChangeDeprecated,
    narrowColumnGaps,
    columnPosition,
    sortCriteria,
    sortValue,
    onUpdateSort,
    "data-testid": dataTestId,
}: ColumnProps<TCustomColumn, TSortCriterion>) => {
    const label = getLabel(column);
    const content =
        typeof label === "string" ? (
            <Text variant="captionBold" ellipsis>
                {label}
            </Text>
        ) : (
            label
        );

    const isSortable = sortCriteria && sortCriteria.length > 0;

    const direction = directionDeprecated || (sortValue && sortValue.order);

    const onSort = useCallback(() => {
        if (onDirectionChangeDeprecated && isSortableDeprecated) {
            return onDirectionChangeDeprecated(direction === "desc" ? "asc" : "desc");
        }
    }, [direction, onDirectionChangeDeprecated, isSortableDeprecated]);

    const width = getWidth(column);

    return (
        <ColumnCell
            css={{cursor: isSortableDeprecated ? "pointer" : "auto"}}
            width={width}
            minSize={isSortable || isSortableDeprecated ? "60px" : "40px"}
            setWidth={setWidth ? (width) => setWidth(column, width) : undefined}
            // @ts-ignore
            title={typeof label === "string" && label}
            narrowColumnGaps={narrowColumnGaps}
            columnPosition={columnPosition}
        >
            <Flex
                alignItems="center"
                data-testid={dataTestId}
                onClick={onSort}
                style={{gap: "4px"}}
            >
                {content}
                {onDirectionChangeDeprecated && isSortableDeprecated ? (
                    <Flex
                        flexDirection="column"
                        fontSize="0.4em"
                        color="grey.dark"
                        mx={2}
                        data-testid="sort-button"
                    >
                        {direction !== "desc" && <Icon name="triangleUp" />}
                        {direction !== "asc" && <Icon name="triangleDown" />}
                    </Flex>
                ) : isSortable ? (
                    <ColumnSort<TSortCriterion>
                        sortValue={sortValue ?? null}
                        sortCriteria={sortCriteria}
                        onUpdateSort={(newSortValue) => {
                            onUpdateSort?.(newSortValue);
                        }}
                        data-testid={`${column.name}-sort`}
                    />
                ) : null}
            </Flex>
        </ColumnCell>
    );
};
