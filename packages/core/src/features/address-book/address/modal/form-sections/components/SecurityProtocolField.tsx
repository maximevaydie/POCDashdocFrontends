import {t} from "@dashdoc/web-core";
import {Box, DocumentDropzone, ErrorMessage, Flex, IconButton} from "@dashdoc/web-ui";
import {SecurityProtocol} from "dashdoc-utils";
import React, {useRef, useState} from "react";

import {SecurityProtocolLink} from "./SecurityProtocolLink";

type Props = {
    document: SecurityProtocol | undefined;
    file?: File | null;
    disabled?: boolean;
    onChange: (file: File | null) => void;
};
export function SecurityProtocolField({document, file, disabled, onChange}: Props) {
    const [error, setError] = useState<string | undefined>(undefined);
    const inputSecurityProtocol = useRef<HTMLInputElement>(null);
    const securityProtocolFileNameMaxLength = 100;

    return (
        <Box flexBasis="100%" pr={2}>
            {(document && file !== null) || file ? (
                <>
                    <Flex alignItems="center" mt={4}>
                        {file && <SecurityProtocolLink uploadingFile={file} />}
                        {document && !file && (
                            <SecurityProtocolLink deleted={false} document={document} />
                        )}
                        <IconButton
                            disabled={disabled}
                            ml={1}
                            type="button"
                            onClick={handleEdit}
                            data-testid="edit-security-protocol"
                            name="edit"
                        />
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            ref={inputSecurityProtocol}
                            style={{display: "none"}}
                            disabled={disabled}
                            onChange={(event) => {
                                setError(undefined);
                                if (event?.target?.files && event.target.files.length > 0) {
                                    const file = event.target.files[0];
                                    if (file.name.length > securityProtocolFileNameMaxLength) {
                                        setError(
                                            t("errors.fileNameMaxLength", {
                                                maxLength: securityProtocolFileNameMaxLength,
                                            })
                                        );
                                        return;
                                    }
                                    onChange(file);
                                }
                            }}
                        />
                        <IconButton
                            type="button"
                            onClick={handleDelete}
                            data-testid="delete-security-protocol"
                            name="bin"
                            withConfirmation
                            confirmationMessage={t(
                                "addressModal.securityProtocolDeleteConfirmationMessage"
                            )}
                            disabled={disabled}
                            modalProps={{
                                title: t("components.deleteSecurityProtocol"),
                                mainButton: {
                                    children: t("common.delete"),
                                },
                            }}
                        />
                    </Flex>
                    <Flex mt={4}>{error && <ErrorMessage error={error} />}</Flex>
                </>
            ) : (
                <DocumentDropzone
                    file={file ?? null}
                    nameMaxLength={securityProtocolFileNameMaxLength}
                    onAcceptedFile={onChange}
                    onRemoveFile={handleDelete}
                />
            )}
        </Box>
    );
    function handleEdit() {
        inputSecurityProtocol?.current?.click();
    }
    function handleDelete() {
        onChange(null);
    }
}
