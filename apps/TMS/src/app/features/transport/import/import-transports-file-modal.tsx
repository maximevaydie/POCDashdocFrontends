import {apiService} from "@dashdoc/web-common";
import {TrackedLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {DocumentDropzone, Modal, Text, Callout, toast} from "@dashdoc/web-ui";
import {populateFormData} from "dashdoc-utils";
import React, {FormEvent, useState} from "react";
import XLSX from "xlsx";

type ImportTransportsFileModal = {
    onClose: () => void;
};

const ImportTransportsFileModal = (props: ImportTransportsFileModal) => {
    const maxFileSize = 5 * 1048576;
    const supportedFileFormats = [
        ".csv",
        "application/csv",
        "application/x-csv",
        "text/csv",
        "text/comma-separated-values",
        "text/x-comma-separated-values",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls",
        ".xlsx",
    ];
    const supportedFileFormatsDisplayString = "csv, xls, xlsx";

    // @ts-ignore
    const [droppedFile, setDroppedFile] = useState<File>(undefined);
    const [conversionInProgress, setConversionInProgress] = useState(false);

    async function postToIntegromat(file: File) {
        try {
            const formData = populateFormData({file: file});
            await apiService.post("/transports-import/to-make/", formData);
            toast.success(t("transportForm.uploadModal.success"));
            props.onClose();
        } catch (e) {
            toast.error(t("transportForm.uploadModal.failure"));
            throw e;
        }
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        postToIntegromat(droppedFile);
    }

    const convertExcelToCsv: (file: File) => Promise<File> = (file: File) => {
        return new Promise(function (resolve) {
            const reader = new FileReader();
            reader.onload = (e) => {
                /* Parse data */
                // @ts-ignore
                const ab = e.target.result;
                const wb = XLSX.read(ab, {type: "array", dateNF: "dd/mm/yyyy"});
                /* Get first worksheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                /* Convert array of arrays */
                const data = XLSX.utils.sheet_to_csv(ws);
                const blob = new Blob([data], {type: "application/csv"});
                const csvFile = new File(
                    [blob],
                    (file.name.substring(0, file.name.lastIndexOf(".")) || file.name) + ".csv",
                    {
                        type: "application/csv",
                    }
                );
                resolve(csvFile);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleDroppedFile = (file: File) => {
        const isExcelFile =
            file.type.includes("excel") ||
            file.type.includes("openxmlformats") ||
            // @ts-ignore
            file.name.split(".").pop().includes("xls");

        if (isExcelFile) {
            setConversionInProgress(true);
            convertExcelToCsv(file).then((csvFile) => {
                setDroppedFile(csvFile);
                setConversionInProgress(false);
            });
        } else {
            setDroppedFile(file);
        }
    };

    return (
        <Modal
            title={t("transportForm.uploadModal.title")}
            onClose={props.onClose}
            mainButton={{
                children: t("transportsForm.uploadFile"),
                type: "submit",
                "data-testid": "import-transports-file-modal-button",
                form: "import-transports-file",
                disabled: droppedFile === undefined,
                loading: conversionInProgress,
            }}
            data-testid="upload-transports-modal"
        >
            {import.meta.env.MODE != "prod" && (
                <Callout variant="danger" mb={2}>
                    <Text>{t("common.dontworkinthisenv")}</Text>
                </Callout>
            )}
            <Text mb={2}>{t("transportForm.uploadModal.body")}</Text>
            <Text mb={4}>
                <TrackedLink
                    to="https://help.dashdoc.eu/fr/articles/5833395-importer-une-liste-de-transports"
                    absoluteLink
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("transportForm.uploadModal.helpCenterLink")}
                </TrackedLink>
            </Text>
            <form id="import-transports-file" onSubmit={submit} />

            <DocumentDropzone
                file={droppedFile}
                onAcceptedFile={handleDroppedFile}
                // @ts-ignore
                onRemoveFile={() => setDroppedFile(undefined)}
                supportedFileFormats={supportedFileFormats}
                supportedFileFormatsDisplayString={supportedFileFormatsDisplayString}
                maxFileSize={maxFileSize}
                loading={conversionInProgress}
            />
            <Callout mt={7}>
                <Text>{t("transportForm.uploadModal.info")}</Text>
            </Callout>
        </Modal>
    );
};

export default ImportTransportsFileModal;
