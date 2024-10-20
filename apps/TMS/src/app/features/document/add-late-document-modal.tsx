import {t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    Modal,
    Select,
    TextInput,
    SelectOption,
    SelectOptions,
} from "@dashdoc/web-ui";
import {Company, TransportMessagePost} from "dashdoc-utils";
import React, {useCallback, useMemo, useState} from "react";

import {getDocumentTypeOptions} from "app/services/transport";

import {DocumentCompaniesVisibilitySelect} from "./DocumentCompaniesVisibilitySelect";
import {SitePicker} from "./SitePicker";

import type {Transport} from "app/types/transport";

type Props = {
    userCompany: Pick<Company, "pk">;
    transport: Transport;
    file: File;
    onSubmit: (document: TransportMessagePost) => void;
    onClose: () => void;
};

export function AddLateDocumentModal({userCompany, transport, file, onSubmit, onClose}: Props) {
    const [documentType, setDocumentType] = useState<TransportMessagePost["document_type"]>("cmr");
    const [site, setSite] = useState<string | null>(null);
    const [reference, setDocumentReference] = useState("");
    const [visibleByEveryone, setVisibleByEveryone] = useState(true);
    const [readableByTrucker, setReadableByTrucker] = useState(true);
    const [readableByCompanyIds, setReadableByCompanyIds] = useState<number[]>([]);

    const documentTypeOptions: SelectOptions<TransportMessagePost["document_type"]> = useMemo(
        () => getDocumentTypeOptions(),
        []
    );

    const handleDocumentTypeChange = useCallback(
        ({value}: SelectOption<TransportMessagePost["document_type"]>) => {
            setDocumentType(value as TransportMessagePost["document_type"]);

            /* Truckers shouldn't be able to see invoices unless they are explicitly allowed to */
            setReadableByTrucker(value !== "invoice");
        },
        [setDocumentType]
    );

    const handleSubmit = useCallback(() => {
        onSubmit({
            document: file,
            type: "document",
            document_type: documentType,
            document_title: file.name,
            reference: reference,
            site: site,
            visible_by_everyone: visibleByEveryone,
            readable_by_company_ids: readableByCompanyIds,
            readable_by_trucker: readableByTrucker,
        });
    }, [
        documentType,
        file,
        onSubmit,
        site,
        reference,
        visibleByEveryone,
        readableByCompanyIds,
        readableByTrucker,
    ]);

    return (
        <Modal
            id="add-late-document-modal"
            data-testid="add-late-document-modal"
            title={t("updateLateTransports.addDocument")}
            onClose={onClose}
            mainButton={{
                children: t("common.add"),
                onClick: handleSubmit,
                disabled: !reference,
                ["data-testid"]: "update-late-transport-add-document-button",
            }}
        >
            <Box mb={2}>
                <TextInput
                    data-testid="late-transport-document-reference-input"
                    label={t("common.reference")}
                    onChange={setDocumentReference}
                    value={reference}
                    required
                />
            </Box>
            <Box mb={4}>
                <Select
                    label={t("components.documentType")}
                    isClearable={false}
                    onChange={handleDocumentTypeChange}
                    options={documentTypeOptions}
                    value={documentTypeOptions.filter(({value}) => value === documentType)}
                />
            </Box>
            <Box>
                <Checkbox
                    label={t("components.visibleByStakeholders")}
                    checked={visibleByEveryone}
                    onChange={setVisibleByEveryone}
                />
            </Box>
            {transport.carrier && userCompany.pk === transport.carrier.pk && (
                <Box my={2}>
                    <Checkbox
                        label={t("components.readableByTrucker")}
                        checked={readableByTrucker}
                        onChange={setReadableByTrucker}
                    />
                </Box>
            )}
            {visibleByEveryone && transport.deliveries.length > 1 && (
                <Box mb={2}>
                    <SitePicker
                        label={t("components.attachToSite")}
                        value={site}
                        setSite={setSite}
                        transport={transport}
                    />
                </Box>
            )}
            {!visibleByEveryone && (
                <DocumentCompaniesVisibilitySelect
                    label={t("components.companiesWithAccessToDocument")}
                    transport={transport}
                    authorCompany={userCompany.pk}
                    initialReadableByCompanyIds={readableByCompanyIds}
                    setReadableByCompanyIds={setReadableByCompanyIds}
                />
            )}
        </Modal>
    );
}
