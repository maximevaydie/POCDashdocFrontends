import {apiService, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    DocumentDropzone,
    Flex,
    Icon,
    IconButton,
    LoadingWheel,
    Modal,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {ConfirmationDocument, formatDate, parseAndZoneDate, populateFormData} from "dashdoc-utils";
import React, {FunctionComponent, useEffect, useState} from "react";
import {useHistory} from "react-router";

import useIsCarrier from "app/hooks/useIsCarrier";
import {useSelector} from "app/redux/hooks";

interface ConfirmationLineProps {
    confirmation: ConfirmationDocument;
    afterClick: () => void;
}
const ConfirmationLine: FunctionComponent<ConfirmationLineProps> = ({
    confirmation,
    afterClick,
}) => {
    const history = useHistory();
    const isCarrier = useIsCarrier();
    const onClick = () => {
        history.push(
            `/app/${isCarrier ? "transports" : "orders"}/new/?confirmationUid=${confirmation.uid}`
        );
        afterClick();
    };
    const timezone = useTimezone();

    return (
        <Flex
            alignItems="center"
            borderStyle="solid"
            borderColor="grey.light"
            borderRadius={2}
            padding={3}
            m={2}
        >
            <Box flex={1}>
                <Text overflow="hidden" variant="h2">
                    {confirmation.document_name}
                </Text>
                <Text marginTop={2}>
                    {confirmation.data_extracted ? (
                        <Flex>
                            {t("pdfImport.imported")} {t("common.dateOn")}{" "}
                            {formatDate(parseAndZoneDate(confirmation.created, timezone), "PPPp")}
                            <Icon name="checkCircle" color="green.dark" marginLeft={2} />
                        </Flex>
                    ) : (
                        t("pdfImport.importInProgress")
                    )}
                </Text>
            </Box>
            <Button disabled={!confirmation.data_extracted} onClick={onClick} my={1}>
                {t(isCarrier ? "transportForm.createTransport" : "transportForm.createOrder")}
            </Button>
            <IconButton
                name="delete"
                ml={1}
                mr={-1}
                fontSize={3}
                onClick={() => apiService.ConfirmationDocuments.delete(confirmation.uid)}
                data-testid="delete-confirmation"
            />
        </Flex>
    );
};

interface LoadedConfirmationsProps {
    confirmations: ConfirmationDocument[];
    afterClick: () => void;
}

const LoadedConfirmations: FunctionComponent<LoadedConfirmationsProps> = ({
    confirmations,
    afterClick,
}) => {
    if (!confirmations.length) {
        return null;
    }
    return (
        <Box marginTop={5}>
            <Text variant="h1" mx={2}>
                {t("pdfImport.importsInProgress")}
            </Text>
            <Text variant="caption" color="grey.dark" marginBottom={5} marginTop={1} mx={2}>
                {t("pdfImport.continueToWork", {
                    importsInProgress: t("pdfImport.importsInProgress"),
                })}
            </Text>
            {confirmations.map((confirmation) => (
                <ConfirmationLine
                    confirmation={confirmation}
                    afterClick={afterClick}
                    key={confirmation.uid}
                />
            ))}
        </Box>
    );
};

interface PdfImportModal {
    onClose: () => void;
}

export const PdfImportModal: FunctionComponent<PdfImportModal> = ({onClose}) => {
    const counts = useSelector((state) => state.counts);
    const {confirmationDocuments: confirmationDocumentsCounts} = counts;
    const transportsToCreateCount =
        "transports_to_create" in confirmationDocumentsCounts
            ? confirmationDocumentsCounts.transports_to_create
            : undefined;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [confirmationsLoading, setConfirmationsLoading] = useState(true);
    const [confirmations, setConfirmations] = useState<ConfirmationDocument[]>([]);

    const supportedFileFormats = [".pdf"];
    const supportedFileFormatsDisplayString = `PDF (${t("pdfImport.onlyFirstPageProcessed")})`;

    const fetchConfirmations = async () => {
        const response = await apiService.ConfirmationDocuments.getAll({
            query: {transport_to_create: true, ordering: "created"},
        });
        setConfirmations(response);
    };

    useEffect(() => {
        try {
            fetchConfirmations();
        } catch {
            if (confirmationsLoading) {
                toast.error(t("common.error"));
            }
        }
        setConfirmationsLoading(false);
    }, [transportsToCreateCount]);

    const renderHeader = () => {
        return (
            <Flex>
                <Text variant="h1">{t("transportsForm.pdfUploads")}</Text>
                <Box
                    backgroundColor="turquoise.light"
                    color="turquoise.dark"
                    borderColor="turquoise.dark"
                    borderStyle="solid"
                    borderRadius={1}
                    px={3}
                    py={1}
                    marginLeft={5}
                    fontSize={1}
                >
                    {t("pdfImport.betaVersion")}
                </Box>
            </Flex>
        );
    };

    const renderHelpText = () => {
        return (
            <Box mx={2}>
                <Text variant="h1" marginBottom={6}>
                    {t("pdfImport.helpText.dashdocAiHelp")}
                </Text>
                {[
                    t("pdfImport.helpText.uploadTransportOrder"),
                    t("pdfImport.helpText.dataProcessed"),
                    t("pdfImport.helpText.finishCreation"),
                ].map((text, index) => {
                    return (
                        <Flex marginBottom={2} key={index}>
                            <Text mr={3}>
                                {index + 1}
                                {"."}
                            </Text>
                            <Text>{text}</Text>
                        </Flex>
                    );
                })}
            </Box>
        );
    };

    const uploadFile = async (file: File) => {
        setSelectedFile(file);
        try {
            await apiService.ConfirmationDocuments.post({
                data: populateFormData({
                    document: file,
                    document_name: file.name,
                }) as Partial<ConfirmationDocument>,
            });
            toast.success(t("pdfImport.toast.pdfSuccessfullyImported"));
        } catch {
            toast.error(t("pdfImport.toast.errorOccured"));
        }

        setSelectedFile(null);
    };

    return (
        <Modal title={renderHeader()} mainButton={null} onClose={onClose}>
            {!confirmationsLoading && !confirmations.length && (
                <>
                    {renderHelpText()}
                    <Icon name="robotWithHands" size={60} marginTop={5} marginBottom={-5} />
                </>
            )}
            <Box zIndex="level0">
                <DocumentDropzone
                    file={selectedFile}
                    onAcceptedFile={uploadFile}
                    onRemoveFile={setSelectedFile.bind(undefined, null)}
                    loading={!!selectedFile}
                    supportedFileFormats={supportedFileFormats}
                    supportedFileFormatsDisplayString={supportedFileFormatsDisplayString}
                />
            </Box>
            {confirmationsLoading ? (
                <LoadingWheel />
            ) : (
                <LoadedConfirmations confirmations={confirmations} afterClick={onClose} />
            )}
        </Modal>
    );
};
