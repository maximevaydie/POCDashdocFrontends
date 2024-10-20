import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    ClickableBox,
    ClickableBoxProps,
    Flex,
    Text,
    TooltipWrapper,
    useDevice,
} from "@dashdoc/web-ui";
import {WrapXLines} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {ReactNode, useState} from "react";

import {NotesInputModal} from "./NotesInputModal";

export type NotesInputProps = {
    value: string;
    disabled: boolean;
    emptyMessage?: ReactNode;
    helpText?: ReactNode;
    onUpdate(newValue: string): Promise<void>;
} & ClickableBoxProps;

export function NotesInput({
    value,
    disabled,
    emptyMessage,
    helpText,
    onUpdate,
    ...boxProps
}: NotesInputProps) {
    const [isHovering, setIsHovering] = useState(false);
    const isEmptyNote = value.length === 0;
    const [show, setShow, setHide] = useToggle(false);
    const device = useDevice();
    return (
        <>
            <ClickableBox
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={disabled ? undefined : setShow}
                minHeight="100px"
                {...boxProps}
                style={{
                    cursor: disabled ? "auto" : "pointer",
                }}
            >
                <Flex position="relative">
                    {!disabled && (
                        <Box
                            position="absolute"
                            top={0}
                            right={0}
                            style={{
                                visibility:
                                    isHovering || device === "mobile" ? "inherit" : "hidden",
                            }}
                        >
                            {isEmptyNote ? (
                                <>
                                    <Button variant="secondary" width="fit-content">
                                        {t("common.addNotes")}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" width="fit-content">
                                    {t("common.edit")}
                                </Button>
                            )}
                        </Box>
                    )}
                </Flex>
                <Flex justifyContent="space-between">
                    {value ? (
                        <WrapXLines numberOfLines={10} maxHeight="240px">
                            <TooltipWrapper
                                content={
                                    <Box maxWidth="300px">
                                        <Text>{value}</Text>
                                    </Box>
                                }
                            >
                                <Text>{value}</Text>
                            </TooltipWrapper>
                        </WrapXLines>
                    ) : (
                        emptyMessage
                    )}
                </Flex>
            </ClickableBox>
            {show && (
                <NotesInputModal
                    title={value ? t("common.editNotes") : t("common.addNotes")}
                    value={value}
                    helpText={helpText}
                    onClose={setHide}
                    onEdit={handleEdit}
                    data-testid={value ? "edit-notes-modal" : "add-notes-modal"}
                />
            )}
        </>
    );

    async function handleEdit(updatedNotes: string) {
        await onUpdate(updatedNotes);
        setHide();
    }
}
