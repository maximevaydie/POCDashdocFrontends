import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text, theme, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {ConfirmationDocumentsCounts, useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {PdfImportModal} from "./PdfImportModal";

const SmallLoadedConfirmationsButtonBox = styled(Box)(
    themeAwareCss({
        padding: `${theme.space[1]}px`,
        marginX: `${theme.space[1]}px`,
        marginBottom: `${theme.space[5]}px`,
        marginTop: `-20px`,
        cursor: "pointer",
        color: `grey.dark`,
        border: "1px solid",
        borderRadius: 1,
        borderColor: `grey.light`,
        textAlign: `center`,
    })
);

const LoadedConfirmationsButtonBox = styled(Box)(
    themeAwareCss({
        padding: `${theme.space[1]}px ${theme.space[2]}px`,
        marginX: `${theme.space[3]}px`,
        marginBottom: `${theme.space[5]}px`,
        marginTop: `-20px`,
        cursor: "pointer",
        backgroundColor: `blue.ultralight`,
        border: "1px solid",
        borderRadius: 1,
        borderColor: `grey.light`,
    })
);

interface LoadedConfirmationsButtonProps {
    displaySmall: boolean;
    counts: ConfirmationDocumentsCounts["transports_to_create"];
}

export const LoadedConfirmationsButton: FunctionComponent<LoadedConfirmationsButtonProps> = ({
    displaySmall,
    counts,
}) => {
    const [isPdfImportModalOpen, openPdfImportModal, closePdfImportModal] = useToggle();

    if (counts.total === 0) {
        return null;
    }

    const ButtonComponent = displaySmall
        ? SmallLoadedConfirmationsButtonBox
        : LoadedConfirmationsButtonBox;

    return (
        <>
            <ButtonComponent onClick={openPdfImportModal}>
                {displaySmall ? (
                    <Icon name="robot" />
                ) : (
                    <Flex>
                        <Flex flex="100%" justifyContent="center">
                            <Text variant="caption" alignSelf="center">
                                {t("pdfImport.importsInProgress")}
                            </Text>
                        </Flex>
                        {
                            <Text mr={1} ml={-4} color="blue.dark" variant="h2">
                                {`${counts.data_extracted}/${counts.total}`}
                            </Text>
                        }
                    </Flex>
                )}
            </ButtonComponent>
            {isPdfImportModalOpen && <PdfImportModal onClose={closePdfImportModal} />}
        </>
    );
};
