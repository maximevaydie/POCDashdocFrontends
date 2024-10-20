import styled from "@emotion/styled";
import React, {useRef, useState} from "react";
import {compose, layout} from "styled-system";

import {HTMLInputEvent, Icon, HandleUploadButton, UploadButton} from "../../Elements/index";
import {Box} from "../../Elements/layout/Box";

import {ErrorMessage} from "./input2/ErrorMessage";
import {Label} from "./input2/Label";
import {StyledInputSpecificProps} from "./input2/StyledInput";

type FileUploadInputProps = StyledInputSpecificProps & {
    onFileChange: (files: FileList, meta: React.ChangeEvent) => void;
    onRemoveFile: (meta: React.UIEvent) => void;
    label: string;
    error?: string;
    supportedFileFormats?: string[];
    initialPreviewSrc?: string;
    initialFileName?: string;
    dataTestid?: string;
};

const StyledImg = styled.img(compose(layout));

export const FileUploadInput = (props: FileUploadInputProps) => {
    const {
        onFileChange,
        onRemoveFile,
        label,
        supportedFileFormats,
        initialPreviewSrc,
        initialFileName,
        error,
        disabled,
        success,
        required,
        dataTestid,
    } = props;
    const [fileChosen, setFileChosen] = useState(!!(initialFileName || initialPreviewSrc));
    const [fileName, setFileName] = useState(initialFileName);
    const [previewSrc, setPreviewSrc] = useState(initialPreviewSrc);
    const uploadButtonRef = useRef<HandleUploadButton>(null);

    const removeFile = () => {
        // @ts-ignore
        setFileChosen(undefined);
        setFileName(undefined);
        setPreviewSrc(undefined);
        // @ts-ignore
        uploadButtonRef.current.resetInput();
    };

    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            // convert image file to base64 string
            if (typeof reader.result === "string") {
                setPreviewSrc(reader.result);
            }
        },
        false
    );

    const handleFileChange = (files: FileList, meta: HTMLInputEvent) => {
        if (files[0]) {
            setFileName(files[0].name);
            setFileChosen(true);
            if (files[0].type.includes("image/")) {
                reader.readAsDataURL(files[0]);
            } else {
                setPreviewSrc(undefined);
            }
        }

        onFileChange(files, meta);
    };

    return (
        <>
            <UploadButton
                variant="secondary"
                onFileChange={handleFileChange}
                accept={supportedFileFormats ? supportedFileFormats.join(", ") : "*/*"}
                multiple={false}
                width="100%"
                justifyContent="normal"
                deferFormSubmission={true}
                flexDirection="column"
                alignItems="flex-start"
                data-testid={`${dataTestid}-input`}
                buttonDataTestId={`${dataTestid}-button`}
                ref={uploadButtonRef}
                disabled={disabled}
                required={required}
                success={success}
                error={error}
                withLabel={label ? true : false}
                position="relative"
            >
                <Label
                    // @ts-ignore
                    disabled={disabled}
                    // @ts-ignore
                    required={required}
                    // @ts-ignore
                    success={success}
                    // @ts-ignore
                    error={error}
                    focused={false}
                    filled={fileChosen}
                    label={label}
                />
                {fileChosen && (
                    <Box display="flex" alignItems="center">
                        {previewSrc ? (
                            <div>
                                <StyledImg
                                    src={previewSrc}
                                    alt="upload preview"
                                    maxWidth="100%"
                                    maxHeight="10em"
                                    data-testid={`${dataTestid}-img`}
                                    verticalAlign="unset"
                                />
                            </div>
                        ) : (
                            <div data-testid={`${dataTestid}-text`}>{fileName}</div>
                        )}
                        <Icon mr={1} name="edit" fontSize={1} marginLeft="1em" />
                        <Icon
                            mr={1}
                            name="delete"
                            fontSize={1}
                            onClick={(event) => {
                                event.stopPropagation();
                                removeFile();
                                onRemoveFile(event);
                            }}
                            marginLeft="1em"
                        />
                    </Box>
                )}
            </UploadButton>
            <span>{error && <ErrorMessage error={error} />}</span>
        </>
    );
};
