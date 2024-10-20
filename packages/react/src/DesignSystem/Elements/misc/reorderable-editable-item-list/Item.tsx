import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    ClickableBoxProps,
    ClickableFlex,
    ErrorMessage,
    Flex,
    Icon,
    IconButton,
    IconNames,
    Text,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {FunctionComponent, ReactNode} from "react";
import {Draggable} from "react-beautiful-dnd";

const ItemWrapper = styled(Flex)`
    &:hover > .dnd-handle {
        display: flex;
    }
    &:hover > .dnd-handle-index {
        display: none;
    }
`;
type ItemProps = {
    index: number;
    showIndex?: boolean;
    dataTestId?: string;
    draggableItemId: string;
    isDragDisabled: boolean;

    isHidden: boolean;
    isEditing: boolean;
    positionInEditingGroup?: "first" | "middle" | "last";
    onEdit: () => void;

    canDelete: boolean;
    onDelete?: () => void;
    deleteConfirmation?: {
        title: string;
        message: string | ReactNode;
    };
    outsideDelete?: boolean;

    error?: string | null;
    warning?: string | null;

    children?: ReactNode;
    contentUnder?: ReactNode;
    canEdit: boolean;
    dragIconAlwaysVisible: boolean;
    deleteIcon?: IconNames;
    itemContainerStyle?: ClickableBoxProps;
};
export const Item: FunctionComponent<ItemProps> = ({
    index,
    showIndex = false,
    dataTestId,
    draggableItemId,
    isDragDisabled,
    isHidden,
    isEditing,
    positionInEditingGroup,
    onEdit,
    canDelete,
    onDelete,
    deleteConfirmation,
    outsideDelete = false,
    error,
    warning,
    children,
    contentUnder,
    canEdit,
    dragIconAlwaysVisible,
    deleteIcon = "delete",
    itemContainerStyle,
}) => {
    let background = "grey.white";
    let borderColor = "grey.light";
    if (positionInEditingGroup === "middle") {
        background = "blue.ultralight";
    } else if (positionInEditingGroup === "last") {
        background = "blue.ultralight";
    } else if (isEditing || positionInEditingGroup === "first") {
        background = "blue.ultralight";
        borderColor = "blue.default";
    } else if (error) {
        background = "red.ultralight";
        borderColor = "red.default";
    } else if (warning) {
        background = "yellow.ultralight";
        borderColor = "yellow.default";
    }

    const containerStyle = {
        border: "1px solid",
        borderColor: borderColor,
        bg: background,
        ...(itemContainerStyle ?? {p: 2, pl: 3}),
    };

    return (
        <>
            <Draggable
                key={draggableItemId}
                draggableId={draggableItemId}
                index={index}
                isDragDisabled={isDragDisabled}
            >
                {(provided, snapshot) => (
                    <>
                        <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                        >
                            {!isHidden && (
                                <ItemWrapper
                                    data-testid={dataTestId}
                                    ml={dragIconAlwaysVisible ? 0 : -5}
                                    pl={dragIconAlwaysVisible ? 0 : 5}
                                    mt={3}
                                    display="flex"
                                    minWidth="120px"
                                >
                                    {provided.dragHandleProps && (
                                        <>
                                            <Box
                                                width="24px"
                                                ml={dragIconAlwaysVisible ? 0 : -5}
                                                alignItems="center"
                                                justifyContent="center"
                                                className={"dnd-handle"}
                                                display={
                                                    dragIconAlwaysVisible || snapshot.isDragging
                                                        ? "flex"
                                                        : "none"
                                                }
                                            >
                                                <Icon
                                                    name="drag"
                                                    color="grey.dark"
                                                    fontSize={2}
                                                    backgroundColor="grey.white"
                                                />
                                            </Box>

                                            <Box
                                                width="24px"
                                                ml={-5}
                                                alignItems="center"
                                                justifyContent="center"
                                                className="dnd-handle-index"
                                                display={snapshot.isDragging ? "none" : "flex"}
                                            >
                                                {showIndex && (
                                                    <Text fontWeight={600} color="grey.dark">
                                                        {index + 1}
                                                    </Text>
                                                )}
                                            </Box>
                                        </>
                                    )}
                                    <Box width={"100%"}>
                                        <ClickableFlex
                                            onClick={onEdit}
                                            alignItems="center"
                                            height={"100%"}
                                            display="flex"
                                            justifyContent="space-between"
                                            disabled={!canEdit}
                                            {...containerStyle}
                                        >
                                            {warning ? (
                                                <Callout variant="warning">{warning}</Callout>
                                            ) : (
                                                children
                                            )}
                                            <Flex>
                                                {!outsideDelete && canEdit && (
                                                    <IconButton name="edit" />
                                                )}
                                                {!outsideDelete && canDelete && onDelete && (
                                                    <Box
                                                        onClick={(e: React.MouseEvent) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <IconButton
                                                            name={deleteIcon}
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                onDelete();
                                                            }}
                                                            data-testid={
                                                                (dataTestId ?? "") +
                                                                "-delete-button"
                                                            }
                                                            withConfirmation={!!deleteConfirmation}
                                                            confirmationMessage={
                                                                deleteConfirmation?.message
                                                            }
                                                            modalProps={{
                                                                title: deleteConfirmation?.title,
                                                                mainButton: {
                                                                    children: t("common.delete"),
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Flex>
                                        </ClickableFlex>
                                    </Box>
                                    {outsideDelete &&
                                        onDelete &&
                                        (canDelete ? (
                                            <Box
                                                onClick={(e: React.MouseEvent) =>
                                                    e.stopPropagation()
                                                }
                                                alignItems="center"
                                                display={"flex"}
                                            >
                                                <IconButton
                                                    name="delete"
                                                    ml={2}
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onDelete();
                                                    }}
                                                    scale={[1.4, 1.4]}
                                                    color="grey.dark"
                                                    withConfirmation={!!deleteConfirmation}
                                                    data-testid={
                                                        (dataTestId ?? "") + "-delete-button"
                                                    }
                                                    confirmationMessage={
                                                        deleteConfirmation?.message
                                                    }
                                                    modalProps={{
                                                        title: deleteConfirmation?.title,
                                                        mainButton: {
                                                            children: t("common.delete"),
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box width="2.25em" ml={2} />
                                        ))}
                                </ItemWrapper>
                            )}
                        </Box>
                        {error && <ErrorMessage error={error} />}
                        {!snapshot.isDragging && contentUnder}
                    </>
                )}
            </Draggable>
        </>
    );
};
