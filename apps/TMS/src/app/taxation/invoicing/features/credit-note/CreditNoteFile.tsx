import {fullPagePdfUrl, resolveMediaUrl} from "@dashdoc/core";
import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Card, Flex, Icon, Text, toast, TooltipWrapper} from "@dashdoc/web-ui";
import {IFrame} from "@dashdoc/web-ui";
import React, {useState} from "react";

type CreditNoteFileProps = {
    file: string | null;
    creditNoteUid: string;
};
export const CreditNoteFile: React.FunctionComponent<CreditNoteFileProps> = ({
    file,
    creditNoteUid,
}) => {
    const [timestamp, setTimestamp] = useState(() => new Date().getTime());

    if (!file) {
        return null;
    }

    // Add timestamp to the fileUrl to force the iframe to reload
    const fileUrl = `${fullPagePdfUrl(resolveMediaUrl(file))}?time=${timestamp}`;
    return (
        <Card p={3} mt={4}>
            <Flex
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                mb={3}
            >
                <Text variant="h1" mb={3}>
                    {t("common.pdfOverview")}
                </Text>
                <TooltipWrapper content={t("invoice.updatePdf")} placement="left">
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            try {
                                await apiService.post(
                                    `/credit-notes/${creditNoteUid}/refresh-pdf/`,
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
                </TooltipWrapper>{" "}
            </Flex>
            <Box maxWidth="1000px" margin="auto">
                <IFrame src={fileUrl} onLoad={() => {}} download={false} />
            </Box>
        </Card>
    );
};
