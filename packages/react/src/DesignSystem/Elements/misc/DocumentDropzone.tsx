import {t} from "@dashdoc/web-core";
import {Box, Icon, Text} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {roundNumber} from "dashdoc-utils";
import React, {useState} from "react";
import {useDropzone} from "react-dropzone";

import {ClickableText} from "../base/ClickableText";
import {ErrorMessage} from "../input/input2/ErrorMessage";
import {StyledBox} from "../input/input2/StyledInput";
import {BigScreenOnlyText} from "../layout/BigScreenOnlyText";
import {Flex} from "../layout/Flex";
import {theme} from "../../theme";

interface DocumentDropzoneProps {
    file: File | null;
    onAcceptedFile: (file: File) => void;
    onRemoveFile: () => void;
    supportedFileFormats?: string[];
    supportedFileFormatsDisplayString?: string;
    maxFileSize?: number;
    nameMaxLength?: number;
    loading?: boolean;
    helpTextComponent?: React.ReactNode;
    error?: string;
}

const getBorderColor = (props: any) => {
    if (props.isDragAccept) {
        return theme.colors.green.default;
    }
    if (props.isDragReject) {
        return theme.colors.red.default;
    }
    if (props.isDragActive) {
        return theme.colors.blue.default;
    }
    return "";
};

const Container = styled(StyledBox)`
    overflow: hidden;
    border-width: 2px;
    border-color: ${(props) => getBorderColor(props)};
    border-style: dashed;
    border-radius: 5px;
    margin: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: normal;
    width: auto;
    &:hover {
        border-color: ${theme.colors.blue.default};
        border-style: dashed;
        border-width: 2px;
        i {
            color: ${theme.colors.blue.default};
        }
    }

    &:focus {
        border-style: dashed;
        border-width: 2px;
    }
`;

// If you want to add a new supported file format you will also need to update the API too.
export const DefaultFileFormats = [
    "image/png",
    "image/jpeg",
    "image/tif",
    "image/tiff",
    "image/tiff-fx",
    ".png",
    ".tif",
    ".tiff",
    ".jpg",
    ".gif",
    ".pdf",
    ".eml",
    ".msg",
    ".csv",
    ".rtf",
    ".xlsm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.ms-outlook",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const DefaultFileFormatsDisplayString = "Word, Excel, PDF, PNG, JPG, Email";

export function DocumentDropzone(props: DocumentDropzoneProps) {
    const {
        file,
        supportedFileFormatsDisplayString = DefaultFileFormatsDisplayString,
        supportedFileFormats = DefaultFileFormats,
        maxFileSize,
        nameMaxLength,
        loading,
        error,
    } = props;
    const [errors, setErrors] = useState<string[]>([]);
    const {getRootProps, getInputProps} = useDropzone({
        accept: supportedFileFormats.join(", "),
        maxSize: maxFileSize,
        multiple: false,
        validator: (file) => {
            if (nameMaxLength && file.name.length > nameMaxLength) {
                return {
                    code: "name-too-long",
                    message: "", // Set below in the `onDrop` callback
                };
            }

            return null; // no error
        },
        onDrop: (acceptedFiles, rejectedFiles) => {
            setErrors([]);
            if (rejectedFiles.length > 0 || acceptedFiles.length === 0) {
                if (rejectedFiles[0].errors.some((item) => item.code === "file-invalid-type")) {
                    setErrors((previousError) => [
                        ...previousError,
                        t("components.invalideFileFormat"),
                    ]);
                }
                if (rejectedFiles[0].errors.some((item) => item.code === "file-too-large")) {
                    setErrors((previousError) => [
                        ...previousError,
                        t("components.invalidFileSize", {size: maxFileSizeDisplay}),
                    ]);
                }
                if (rejectedFiles[0].errors.some((item) => item.code === "name-too-long")) {
                    setErrors((previousError) => [
                        ...previousError,
                        t("errors.fileNameMaxLength", {maxLength: nameMaxLength}),
                    ]);
                }

                props.onRemoveFile();
            } else {
                props.onAcceptedFile(acceptedFiles[0]);
            }
        },
    });

    // @ts-ignore
    const maxFileSizeDisplay: string = maxFileSize
        ? maxFileSize > 1073741824
            ? t("common.gigaByte", {size: roundNumber(maxFileSize / 1073741824, 1)})
            : maxFileSize > 1048576
              ? t("common.megaByte", {size: roundNumber(maxFileSize / 1048576, 1)})
              : maxFileSize > 1024
                ? t("common.kiloByte", {size: roundNumber(maxFileSize / 1024, 1)})
                : t("common.byte", {size: maxFileSize})
        : undefined;

    const supportedFormatsDisplay = supportedFileFormatsDisplayString
        ? supportedFileFormatsDisplayString
        : supportedFileFormats && supportedFileFormats.length > 0
          ? supportedFileFormats.join(", ")
          : t("common.all");

    const _renderDropzoneText = () => {
        if (loading) {
            return <Text data-testid="document-dropzone-loading">{t("common.loading")}</Text>;
        }
        if (file) {
            return <Text data-testid="document-dropzone-name">{file.name}</Text>;
        }
        if (props.helpTextComponent) {
            return props.helpTextComponent;
        }
        return (
            <Box>
                <BigScreenOnlyText hiddenUnder={992}>
                    {t("components.dragYourDocument")}
                </BigScreenOnlyText>
                <BigScreenOnlyText hiddenUnder={992} display="inline">
                    {t("common.or")}{" "}
                </BigScreenOnlyText>
                <ClickableText>{t("common.clickHere")}</ClickableText>{" "}
                {t("components.toSelectAFile")}
            </Box>
        );
    };

    return (
        <>
            <Container
                {...getRootProps({className: "dropzone"})}
                data-testid="document-dropzone"
                error={error ?? errors.join(", ")}
            >
                <Flex flexDirection={"column"}>
                    <Box minHeight={95}>
                        <input {...getInputProps()} />
                        <BigScreenOnlyText hiddenUnder={768}>
                            <Icon
                                p={3}
                                mt={3}
                                scale={2.5}
                                color="grey.default"
                                name="cloudUpload"
                            />
                        </BigScreenOnlyText>
                        <Box p={3} display="inline-block">
                            {_renderDropzoneText()}
                        </Box>
                    </Box>
                </Flex>
            </Container>
            <Flex mb={2} ml={3}>
                <Text variant="caption" color="grey.dark">
                    {t("dropZone.acceptedFormat", {formats: supportedFormatsDisplay})}
                </Text>
                {maxFileSizeDisplay && (
                    <Text variant="caption" color="grey.dark">
                        {" "}
                        - {t("dropZone.maxSize", {maxSize: maxFileSizeDisplay})}
                    </Text>
                )}
            </Flex>
            {errors?.map((err, index) => (
                <ErrorMessage
                    error={err}
                    key={index}
                    data-testid={`document-dropzone-error-${index}`}
                />
            ))}
            {error && <ErrorMessage error={error} />}
        </>
    );
}
