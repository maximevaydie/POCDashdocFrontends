import {t} from "@dashdoc/web-core";
import {Link, Text} from "@dashdoc/web-ui";
import {formatDate, SecurityProtocol, useToggle} from "dashdoc-utils";
import React from "react";

import {utilsService} from "../../../../../../services/utils.service";

import {DocumentModal} from "./DocumentModal";

type PropsForm = {
    uploadingFile: File;
};
type Props = {
    document: SecurityProtocol;
    deleted: boolean;
};
export function SecurityProtocolLink(props: PropsForm | Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    if ("uploadingFile" in props) {
        return (
            <Text
                flex={1}
                maxWidth={"fit-content"}
                textOverflow="'[...]'"
                whiteSpace="nowrap"
                overflow="hidden"
            >
                {props.uploadingFile.name || t("addressModal.securityProtocol")}
            </Text>
        );
    }
    const {document, deleted} = props;
    return (
        <>
            <Link
                onClick={handleSecurityProtocolOpen}
                flex={1}
                maxWidth={"fit-content"}
                css={{
                    textOverflow: "'[...]'",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textDecoration: deleted ? "line-through" : "initial",
                    "&:hover": {
                        textDecoration: deleted ? "line-through" : "initial",
                    },
                }}
                mr={0}
            >
                {document.document_title || t("addressModal.securityProtocol")}
            </Link>
            <Text ml={1} variant="caption">
                {`(${formatDate(document.updated, "P")})`}
            </Text>

            {isModalOpen && (
                <DocumentModal
                    onClose={closeModal}
                    url={document.document}
                    label={document.document_title}
                />
            )}
        </>
    );

    function handleSecurityProtocolOpen() {
        if (utilsService.isDeviceIos()) {
            window.open(document.document);
        } else {
            openModal();
        }
    }
}
