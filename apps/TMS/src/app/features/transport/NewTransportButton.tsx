import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, MultipleActionsButton, Text, useDevice} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import useIsCarrier from "app/hooks/useIsCarrier";
import {NuvoTransportsImporter} from "app/screens/transport/NuvoTransportsImporter";

import ImportTransportsFileModal from "./import/import-transports-file-modal";
import {PdfImportModal} from "./import/PdfImportModal";

interface Option {
    name: string;
    onClick: () => void;
}

type Props = {
    displaySmall?: boolean;
    onOptionSelected: () => void;
};

export function NewTransportButton({displaySmall, onOptionSelected}: Props) {
    const history = useHistory();
    const isCarrier = useIsCarrier();
    const onClick = (complex = false) => {
        history.push(
            `/app/${isCarrier ? "transports" : "orders"}/new/?${complex ? "complex=true" : ""}`
        );
    };
    const device = useDevice();
    const newTransportButtonLabel = isCarrier
        ? t("transportsForm.newTransport")
        : t("transportsForm.newOrder");

    const newComplexTransportButtonLabel = isCarrier
        ? t("transportsForm.newMultipointTransport")
        : t("transportsForm.newMultipointOrder");

    const hasNuvoTransportImporterEnable = useFeatureFlag("enableNuvoTransportImporter");

    const [isCsvImportModalOpen, openCsvImportModal, closeCsvImportModal] = useToggle();
    const [isPdfImportModalOpen, openPdfImportModal, closePdfImportModal] = useToggle();
    const [isNuvoImportModalOpen, openNuvoImportModal, closeNuvoImportModal] = useToggle();

    const transportFormOption = {
        name: newTransportButtonLabel,
        onClick: onClick,
    };

    const complexTransportFormOption = {
        name: newComplexTransportButtonLabel,
        onClick: () => onClick(true),
        testId: "new-complex-transport-button",
    };

    const uploadPdfOption = {
        name: t("pdfImport.importPdf"),
        onClick: openPdfImportModal,
    };

    const uploadCsvOption = {
        name: t("transportsForm.uploadCsv"),
        onClick: openCsvImportModal,
    };

    const uploadNuvoOption = {
        name: t("transport.import.uploadFile"),
        onClick: openNuvoImportModal,
    };

    const additionalOptions = [
        complexTransportFormOption,
        uploadPdfOption,
        isCarrier && uploadCsvOption,
        hasNuvoTransportImporterEnable && uploadNuvoOption,
    ].filter(Boolean) as Option[];

    const AddButton = ({onClick}: {onClick: () => void}) => {
        return (
            <Button onClick={onClick} variant="primary" paddingX={2} paddingY={1}>
                <Icon name="add" lineHeight={1} m={0} color="grey.white" />
            </Button>
        );
    };

    const ArrowButton = ({onClick}: {onClick: () => void}) => {
        return (
            <Button
                height="100%"
                width="100%"
                variant="primary"
                onClick={onClick}
                paddingX={1}
                paddingY={1}
                borderRadius={0}
                borderTopRightRadius={1}
                borderBottomRightRadius={1}
            >
                <Icon name="arrowDown" lineHeight={1} m={0} color="grey.white" />
            </Button>
        );
    };

    return (
        <>
            <Flex
                mx={displaySmall ? 1 : 3}
                marginTop={5}
                marginBottom={5}
                data-testid="new-transport-button-container"
            >
                {displaySmall ? (
                    <MultipleActionsButton
                        ButtonComponent={AddButton}
                        width="100%"
                        marginLeft="0px"
                        optionsPositionLeft="110%"
                        optionsPositionTop="0%"
                        options={[transportFormOption, ...additionalOptions]}
                        onOptionSelected={onOptionSelected}
                    />
                ) : (
                    <>
                        <Button
                            width="90%"
                            variant="primary"
                            onClick={() => {
                                onOptionSelected();
                                onClick();
                            }}
                            data-testid="new-transport-button"
                            borderRadius={0}
                            borderTopLeftRadius={1}
                            borderBottomLeftRadius={1}
                        >
                            <Icon name="add" mr={1} color="grey.white" />
                            <Text color="grey.white">{newTransportButtonLabel}</Text>
                        </Button>
                        <MultipleActionsButton
                            ButtonComponent={ArrowButton}
                            width="12%"
                            marginLeft="1px"
                            optionsPositionLeft={device !== "mobile" ? "0%" : undefined}
                            optionsPositionRight={device === "mobile" ? "0%" : undefined}
                            optionsPositionTop="105%"
                            options={additionalOptions}
                            onOptionSelected={onOptionSelected}
                        />
                    </>
                )}
            </Flex>
            {isCsvImportModalOpen && <ImportTransportsFileModal onClose={closeCsvImportModal} />}
            {isPdfImportModalOpen && <PdfImportModal onClose={closePdfImportModal} />}
            {isNuvoImportModalOpen && (
                <NuvoTransportsImporter
                    isNuvoImportModalOpen={isNuvoImportModalOpen}
                    onClose={closeNuvoImportModal}
                    onImportDone={() => {}}
                />
            )}
        </>
    );
}
