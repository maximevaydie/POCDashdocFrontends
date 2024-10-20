import {fullPagePdfUrl, resolveMediaUrl} from "@dashdoc/core";
import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    BigScreenOnlyText,
    Box,
    Button,
    Card,
    ClickableText,
    DocumentDropzone,
    Flex,
    Icon,
    Text,
    toast,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {IFrame} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";
import {useDispatch} from "react-redux";

import {fetchPatchInvoiceFile} from "app/redux/actions/invoices";
import {useSelector} from "app/redux/hooks";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import type {InvoicingDataSource} from "app/services/invoicing/connectors.service";

type Props = {
    invoice: Invoice;
    fromSharing: boolean;
};

export const InvoiceFile: FunctionComponent<Props> = ({invoice, fromSharing}) => {
    const dispatch = useDispatch();
    const invoicingConnector = useSelector((state) => state.invoicingConnector);
    const dataSource = invoicingConnector?.data_source as InvoicingDataSource | undefined;
    const displayUploadZone = dataSource === "sage" && !fromSharing && !invoice.is_dashdoc;
    const [fileBeingUploaded, setFileBeingUploaded] = React.useState<File | null>(null);
    const [timestamp, setTimestamp] = useState(() => new Date().getTime());

    const handleUploadDocument = async (file: File) => {
        setFileBeingUploaded(file);
        try {
            await dispatch(fetchPatchInvoiceFile(invoice.uid, file));
            setFileBeingUploaded(null);
        } catch (e) {
            setFileBeingUploaded(null);
        }
    };

    const _renderReplaceFileHelpText = () => {
        return (
            <Box>
                <BigScreenOnlyText hiddenUnder={992}>
                    {t("invoiceDropzone.replaceFile")}{" "}
                    <ClickableText>{t("common.clickHere")}</ClickableText>
                </BigScreenOnlyText>
                <BigScreenOnlyText hiddenUnder={992} display="inline">
                    {t("common.or")}{" "}
                </BigScreenOnlyText>{" "}
                {t("components.dragYourDocument").toLocaleLowerCase()}
            </Box>
        );
    };

    if (invoice.file) {
        const fileUrl = `${fullPagePdfUrl(resolveMediaUrl(invoice.file))}?time=${timestamp}`;
        return (
            <Card p={3} mt={4}>
                <Flex
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    mb={3}
                >
                    <Box>
                        <Text variant="h1">
                            {invoice.status === "draft"
                                ? t("invoiceDropzone.titleDraft")
                                : t("invoiceDropzone.title")}
                        </Text>
                    </Box>
                    <TooltipWrapper content={t("invoice.updatePdf")} placement="left">
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                try {
                                    await apiService.post(
                                        `/invoices/${invoice.uid}/refresh-pdf/`,
                                        undefined,
                                        {
                                            apiVersion: "web",
                                        }
                                    );
                                    setTimestamp(new Date().getTime());
                                } catch (e) {
                                    toast.error(t("common.error"));
                                }
                            }}
                        >
                            <Icon name="synchronize" />
                        </Button>
                    </TooltipWrapper>
                </Flex>
                {displayUploadZone && (
                    <DocumentDropzone
                        // @ts-ignore
                        file={fileBeingUploaded}
                        loading={!!fileBeingUploaded}
                        onAcceptedFile={handleUploadDocument}
                        onRemoveFile={() => {
                            setFileBeingUploaded(null);
                        }}
                        supportedFileFormats={[".pdf", "application/pdf"]}
                        supportedFileFormatsDisplayString="PDF"
                        helpTextComponent={_renderReplaceFileHelpText()}
                    />
                )}
                <Box maxWidth="1000px" margin="auto">
                    <IFrame src={fileUrl} onLoad={() => {}} download={false} />
                </Box>
            </Card>
        );
    }

    if (fromSharing) {
        return null;
    }

    return (
        <Card p={3} mt={3}>
            <Text variant="h1" mb={3}>
                {t("invoiceDropzone.title")}
            </Text>
            <DocumentDropzone
                // @ts-ignore
                file={fileBeingUploaded}
                loading={!!fileBeingUploaded}
                onAcceptedFile={handleUploadDocument}
                onRemoveFile={() => {
                    setFileBeingUploaded(null);
                }}
                supportedFileFormats={[".pdf", "application/pdf"]}
                supportedFileFormatsDisplayString="PDF"
            />
        </Card>
    );
};
